import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase.js';
import { sanitizeAvatarUri } from '../utils/imageUtils';

const SESSION_STORAGE_KEY = '@sut_canteen_remembered_session';
const USERS_STORAGE_KEY = '@sut_canteen_registered_users';

export const authService = {
  /**
   * Retrieves saved session ONLY if 'Remember Me' was checked during sign in
   */
  async getSavedSession() {
    try {
      const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.rememberMe) return null;
      return {
        ...parsed,
        avatarUri: sanitizeAvatarUri(parsed.avatarUri),
      };
    } catch (e) {
      console.warn('Failed to load remembered session:', e);
      return null;
    }
  },

  /**
   * Saves session when user signs in with Remember Me = true
   */
  async saveSession(user) {
    try {
      if (!user) return;
      const sessionData = {
        ...user,
        rememberMe: true,
        avatarUri: sanitizeAvatarUri(user.avatarUri),
      };
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Failed to save session:', e);
    }
  },

  /**
   * Clears saved session (on logout or when user logs in without remember me)
   */
  async clearSession() {
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      try {
        await supabase.auth.signOut();
      } catch (sErr) { }
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
  },

  /**
   * Get all registered users from local cache
   */
  async getRegisteredUsers() {
    try {
      const raw = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((u) => ({
          ...u,
          avatarUri: sanitizeAvatarUri(u.avatarUri),
        }))
        : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Registers a new user both in Supabase (public.users & auth.signUp)
   * and in local storage cache
   */
  async registerUser(userData) {
    const trimmedEmail = (userData.email || '').trim().toLowerCase();
    const cleanUser = {
      fullName: (userData.fullName || '').trim(),
      studentId: (userData.studentId || '').trim(),
      email: trimmedEmail,
      password: userData.password || '',
      role: userData.role || 'customer',
      customerType: userData.customerType || 'student',
      roleTitle: userData.roleTitle || (userData.role === 'merchant' ? 'ผู้ประกอบการร้านค้า' : 'นักศึกษา'),
      phoneNumber: (userData.phoneNumber || '').trim(),
      gender: userData.gender || '',
      avatarUri: sanitizeAvatarUri(userData.avatarUri),
    };

    // 1. Save to Supabase 'users' table if exists
    try {
      const basePayload = {
        email: cleanUser.email,
        password: cleanUser.password,
        full_name: cleanUser.fullName,
        student_id: cleanUser.studentId,
        role: cleanUser.role,
        customer_type: cleanUser.customerType,
        role_title: cleanUser.roleTitle,
      };

      // Try inserting with all fields first (in case columns exist in Supabase)
      const fullPayload = {
        ...basePayload,
        phone_number: cleanUser.phoneNumber || null,
        gender: cleanUser.gender || null,
        avatar_url: cleanUser.avatarUri || null,
      };

      const { data, error } = await supabase
        .from('users')
        .insert([fullPayload])
        .select()
        .single();

      if (error && (error.code === '42703' || error.code === 'PGRST204')) {
        // Fallback to base columns if phone_number/gender/avatar_url do not exist in users table schema
        const fallback = await supabase
          .from('users')
          .insert([basePayload])
          .select()
          .single();
        if (fallback.data) {
          cleanUser.id = fallback.data.id;
        }
      } else if (data) {
        cleanUser.id = data.id;
      }
    } catch (err) {
      console.warn('Supabase users table insert exception:', err);
    }

    // 2. Also register in Supabase Auth (stores metadata in auth.users)
    try {
      await supabase.auth.signUp({
        email: cleanUser.email,
        password: cleanUser.password || 'password123',
        options: {
          data: {
            full_name: cleanUser.fullName,
            role: cleanUser.role,
            student_id: cleanUser.studentId,
            customer_type: cleanUser.customerType,
            phone_number: cleanUser.phoneNumber,
            gender: cleanUser.gender,
            avatar_url: cleanUser.avatarUri,
          },
        },
      });
    } catch (err) {
      // ignore email confirmation or duplicate notice
    }

    // 3. Save to local AsyncStorage cache
    try {
      const users = await this.getRegisteredUsers();
      const existingIdx = users.findIndex(
        (u) => u.email.toLowerCase() === cleanUser.email
      );

      if (existingIdx >= 0) {
        users[existingIdx] = { ...users[existingIdx], ...cleanUser };
      } else {
        users.push(cleanUser);
      }

      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to register user to AsyncStorage:', e);
    }

    return cleanUser;
  },

  /**
   * Authenticates user against Supabase and local cache.
   * Supports logging in with:
   * - Email (e.g. nonthapat.sirikul@gmail.com)
   * - Student / SUT ID (e.g. B6601393)
   * - Phone Number (e.g. 089-123-4567 or 0891234567)
   */
  async authenticate(identifier, password, preferredRole = 'customer') {
    const trimmedId = (identifier || '').trim().toLowerCase();
    const cleanDigits = trimmedId.replace(/[^0-9]/g, '');

    if (!trimmedId) {
      return { error: 'กรุณากรอกอีเมล, รหัสนักศึกษา หรือ เบอร์โทรศัพท์' };
    }

    // 1. Check Supabase 'users' table
    try {
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.${trimmedId},student_id.ilike.${trimmedId}`)
        .limit(1);

      // If not matched by email/studentId and user input is numeric/phone digits (9+ digits), check phone_number column
      if ((!data || data.length === 0) && cleanDigits.length >= 9) {
        try {
          const phoneRes = await supabase
            .from('users')
            .select('*')
            .ilike('phone_number', `%${cleanDigits}%`)
            .limit(1);
          if (!phoneRes.error && phoneRes.data && phoneRes.data.length > 0) {
            data = phoneRes.data;
            error = null;
          }
        } catch (phoneErr) {
          // Column phone_number might not exist yet in Supabase table
        }
      }

      if (!error && Array.isArray(data) && data.length > 0) {
        const u = data[0];
        if (password && u.password && u.password !== password) {
          return { error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
        }

        // Sync sign in with Supabase Auth to get persistent cloud user_metadata
        let authAvatar = null;
        let authPhone = null;
        let authGender = null;

        try {
          if (u.email && password) {
            const { data: authData } = await supabase.auth.signInWithPassword({
              email: u.email,
              password,
            });
            if (authData?.user?.user_metadata) {
              authAvatar = authData.user.user_metadata.avatar_url || null;
              authPhone = authData.user.user_metadata.phone_number || null;
              authGender = authData.user.user_metadata.gender || null;
            }
          }
        } catch (authSignInErr) {
          console.warn('Supabase auth sign in note:', authSignInErr);
        }

        // Merge with local cache for phone, gender, avatar if Supabase doesn't have them
        const registeredUsers = await this.getRegisteredUsers();
        const localMatched = registeredUsers.find(
          (lu) =>
            (lu.email && lu.email.toLowerCase() === (u.email || '').toLowerCase()) ||
            (lu.id && lu.id === u.id)
        );

        return {
          user: {
            id: u.id,
            email: u.email,
            fullName: u.full_name,
            studentId: u.student_id,
            role: u.role || preferredRole,
            customerType: u.customer_type || 'student',
            roleTitle: u.role_title,
            phoneNumber: authPhone || u.phone_number || localMatched?.phoneNumber || '',
            gender: authGender || u.gender || localMatched?.gender || '',
            avatarUri: sanitizeAvatarUri(authAvatar || u.avatar_url || localMatched?.avatarUri || null),
          },
        };
      }
    } catch (e) {
      console.warn('Supabase auth query notice:', e);
    }

    // 2. Check local registered users cache (Supports Email, Student ID, and Phone Number)
    const registeredUsers = await this.getRegisteredUsers();
    const matchedUser = registeredUsers.find((u) => {
      const userEmail = (u.email || '').toLowerCase();
      const userStudentId = (u.studentId || '').toLowerCase();
      const userPhone = (u.phoneNumber || '').trim();
      const userPhoneDigits = userPhone.replace(/[^0-9]/g, '');

      // Check match by Email
      if (userEmail && userEmail === trimmedId) return true;

      // Check match by Student / Staff ID
      if (userStudentId && userStudentId === trimmedId) return true;

      // Check match by Phone Number (with dashes, without dashes, or with spaces)
      if (userPhone && userPhone.toLowerCase() === trimmedId) return true;
      if (cleanDigits.length >= 9 && userPhoneDigits && userPhoneDigits === cleanDigits) {
        return true;
      }

      return false;
    });

    if (matchedUser) {
      if (password && matchedUser.password && matchedUser.password !== password) {
        return { error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
      }
      return { user: matchedUser };
    }

    // 3. If user has not registered yet
    return {
      error: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ กรุณากด "สมัครสมาชิก (Sign Up)" ก่อนเข้าสู่ระบบ',
    };
  },

  /**
   * Updates user profile data (fullName, phoneNumber, email, gender, avatarUri)
   * in local cache, session storage, and Supabase
   */
  async updateUserProfile(oldUser, updatedFields) {
    try {
      if (!oldUser) return { error: 'ไม่พบข้อมูลผู้ใช้' };

      const updatedUser = {
        ...oldUser,
        ...updatedFields,
        avatarUri: sanitizeAvatarUri(
          updatedFields.avatarUri !== undefined ? updatedFields.avatarUri : oldUser.avatarUri
        ),
      };

      // 1. Update in local storage USERS_STORAGE_KEY
      const registeredUsers = await this.getRegisteredUsers();
      const userIndex = registeredUsers.findIndex(
        (u) =>
          (oldUser.email && u.email?.toLowerCase() === oldUser.email.toLowerCase()) ||
          (oldUser.studentId && u.studentId?.toLowerCase() === oldUser.studentId.toLowerCase()) ||
          (oldUser.id && u.id === oldUser.id)
      );

      if (userIndex >= 0) {
        registeredUsers[userIndex] = {
          ...registeredUsers[userIndex],
          ...updatedFields,
          avatarUri: sanitizeAvatarUri(
            updatedFields.avatarUri !== undefined
              ? updatedFields.avatarUri
              : registeredUsers[userIndex].avatarUri
          ),
        };
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
      } else {
        registeredUsers.push(updatedUser);
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
      }

      // 2. Update active session storage ONLY IF rememberMe was active
      const currentSaved = await this.getSavedSession();
      if (currentSaved && currentSaved.rememberMe) {
        await AsyncStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            ...currentSaved,
            ...updatedUser,
            avatarUri: sanitizeAvatarUri(updatedUser.avatarUri),
            rememberMe: true,
          })
        );
      }

      // 3. Update Supabase 'users' table if possible
      try {
        const payload = {};
        if (updatedFields.fullName !== undefined) payload.full_name = updatedFields.fullName;
        if (updatedFields.phoneNumber !== undefined) payload.phone_number = updatedFields.phoneNumber;
        if (updatedFields.email !== undefined) payload.email = updatedFields.email;
        if (updatedFields.gender !== undefined) payload.gender = updatedFields.gender;
        if (updatedFields.avatarUri !== undefined) payload.avatar_url = updatedFields.avatarUri;

        if (Object.keys(payload).length > 0) {
          let updateQuery = supabase.from('users').update(payload);
          if (oldUser.id) {
            updateQuery = updateQuery.eq('id', oldUser.id);
          } else if (oldUser.email) {
            updateQuery = updateQuery.eq('email', oldUser.email);
          }

          const { error } = await updateQuery;
          if (error && (error.code === '42703' || error.code === 'PGRST204')) {
            // Columns phone_number/gender/avatar_url might not exist yet in Supabase table
            // Fallback to update full_name and email
            const fallbackPayload = {};
            if (payload.full_name) fallbackPayload.full_name = payload.full_name;
            if (payload.email) fallbackPayload.email = payload.email;

            if (Object.keys(fallbackPayload).length > 0) {
              if (oldUser.id) {
                await supabase.from('users').update(fallbackPayload).eq('id', oldUser.id);
              } else if (oldUser.email) {
                await supabase.from('users').update(fallbackPayload).eq('email', oldUser.email);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Supabase updateUserProfile notice:', err);
      }

      // 4. Update Supabase Auth user metadata
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: updatedUser.fullName,
            phone_number: updatedUser.phoneNumber,
            gender: updatedUser.gender,
            avatar_url: updatedUser.avatarUri,
          },
        });
      } catch (authErr) {
        // ignore if offline or no session
      }

      return { success: true, user: updatedUser };
    } catch (e) {
      console.error('Error updating user profile:', e);
      return { error: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' };
    }
  },

  /**
   * Fetches the latest user profile data from Supabase and local storage,
   * ensuring cross-device profile and avatar sync.
   */
  async fetchLatestUserProfile(user) {
    if (!user) return null;

    try {
      let freshUser = { ...user };

      // 1. Try fetching from Supabase 'users' table
      const searchEmail = (user.email || '').trim().toLowerCase();
      const searchId = user.id;
      const searchStudentId = (user.studentId || '').trim().toLowerCase();

      let query = supabase.from('users').select('*');
      if (searchId) {
        query = query.eq('id', searchId);
      } else if (searchEmail) {
        query = query.eq('email', searchEmail);
      } else if (searchStudentId) {
        query = query.eq('student_id', searchStudentId);
      } else {
        return user;
      }

      const { data, error } = await query.limit(1);

      if (!error && Array.isArray(data) && data.length > 0) {
        const u = data[0];

        // Parse role_title if it contains extra JSON metadata (avatar, phone, gender)
        let extraMeta = null;
        if (u.role_title && typeof u.role_title === 'string' && u.role_title.startsWith('{')) {
          try {
            extraMeta = JSON.parse(u.role_title);
          } catch (e) {}
        }

        freshUser = {
          ...freshUser,
          fullName: u.full_name || freshUser.fullName,
          email: u.email || freshUser.email,
          studentId: u.student_id || freshUser.studentId,
          role: u.role || freshUser.role,
          customerType: u.customer_type || freshUser.customerType,
          roleTitle: extraMeta?.title || (typeof u.role_title === 'string' && !u.role_title.startsWith('{') ? u.role_title : freshUser.roleTitle),
          phoneNumber: u.phone_number || extraMeta?.phone || freshUser.phoneNumber,
          gender: u.gender || extraMeta?.gender || freshUser.gender,
          avatarUri: sanitizeAvatarUri(u.avatar_url || extraMeta?.avatar || freshUser.avatarUri),
        };
      }

      // 2. Also check Supabase Auth session for user_metadata if available
      try {
        const { data: authData } = await supabase.auth.getSession();
        if (authData?.session?.user) {
          const meta = authData.session.user.user_metadata || {};
          if (meta.avatar_url && !freshUser.avatarUri) {
            freshUser.avatarUri = sanitizeAvatarUri(meta.avatar_url);
          }
          if (meta.full_name && !freshUser.fullName) {
            freshUser.fullName = meta.full_name;
          }
          if (meta.phone_number && !freshUser.phoneNumber) {
            freshUser.phoneNumber = meta.phone_number;
          }
          if (meta.gender && !freshUser.gender) {
            freshUser.gender = meta.gender;
          }
        }
      } catch (authErr) {}

      // 3. Fallback to local storage if fields are still empty
      const registeredUsers = await this.getRegisteredUsers();
      const localMatched = registeredUsers.find(
        (lu) =>
          (lu.email && lu.email.toLowerCase() === (freshUser.email || '').toLowerCase()) ||
          (lu.id && lu.id === freshUser.id)
      );

      if (localMatched) {
        if (!freshUser.avatarUri && localMatched.avatarUri) {
          freshUser.avatarUri = sanitizeAvatarUri(localMatched.avatarUri);
        }
        if (!freshUser.phoneNumber && localMatched.phoneNumber) {
          freshUser.phoneNumber = localMatched.phoneNumber;
        }
        if (!freshUser.gender && localMatched.gender) {
          freshUser.gender = localMatched.gender;
        }
      }

      freshUser.avatarUri = sanitizeAvatarUri(freshUser.avatarUri);
      return freshUser;
    } catch (err) {
      console.warn('fetchLatestUserProfile failed, returning cached user:', err);
      return user;
    }
  },
};

export default authService;

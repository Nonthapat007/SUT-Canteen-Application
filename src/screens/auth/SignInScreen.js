import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Icon from '../../components/common/Icon';
import authService, { DEFAULT_ACCOUNTS } from '../../services/authService';

export default function SignInScreen({
  onSignInSuccess,
  onNavigateToSignUp,
  initialEmail = '',
}) {
  // Account Role Type: 'customer' | 'merchant'
  const [selectedRole, setSelectedRole] = useState('customer');
  const [identifier, setIdentifier] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Remember Me checkbox state - default to false so app requires login on launch unless checked
  const [rememberMe, setRememberMe] = useState(false);

  // Form Validation & Auth Error States (Inline red text & alert banner)
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (initialEmail) {
      setIdentifier(initialEmail);
    }
  }, [initialEmail]);

  // Switch role tab
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setAuthError('');
    setIdentifierError('');
    setPasswordError('');
  };

  const handleSignIn = async () => {
    let hasError = false;
    setAuthError('');
    setIdentifierError('');
    setPasswordError('');

    if (!identifier.trim()) {
      setIdentifierError(
        selectedRole === 'merchant'
          ? 'กรุณากรอกอีเมลร้านค้า หรือ รหัสร้านค้า'
          : 'กรุณากรอกอีเมล มทส. หรือ รหัสนักศึกษา'
      );
      hasError = true;
    }
    if (!password) {
      setPasswordError('กรุณากรอกรหัสผ่าน');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const result = await authService.authenticate(identifier, password, selectedRole);
    if (result.error) {
      setAuthError('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
      return;
    }

    if (result.user && typeof onSignInSuccess === 'function') {
      onSignInSuccess(result.user, rememberMe);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* SUT Canteen Express Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.bowlIconWrapper}>
          <Icon name="burger" size={24} color={COLORS.primary} strokeWidth={2} />
        </View>
        <View style={styles.logoTextCol}>
          <Text style={styles.logoTitle}>SUT</Text>
          <Text style={styles.logoSub}>Canteen</Text>
          <Text style={styles.logoExpress}>Express</Text>
        </View>
      </View>

      {/* Heading */}
      <Text style={styles.headingTitle}>เข้าสู่ระบบ</Text>
      <Text style={styles.headingHighlight}>SUT Canteen Express</Text>
      <Text style={styles.headingSub}>
        เลือกประเภทบัญชีเพื่อเข้าใช้งานระบบ
      </Text>

      {/* Role Selector Tabs (Customer vs Merchant) */}
      <View style={styles.roleTabsContainer}>
        <TouchableOpacity
          style={[styles.roleTab, selectedRole === 'customer' && styles.roleTabActive]}
          onPress={() => handleSelectRole('customer')}
          activeOpacity={0.85}
        >
          <Icon
            name="user"
            size={16}
            color={selectedRole === 'customer' ? COLORS.primary : '#64748B'}
            strokeWidth={selectedRole === 'customer' ? 2.5 : 2}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.roleTabText,
              selectedRole === 'customer' && styles.roleTabTextActive,
            ]}
          >
            ลูกค้า / นักศึกษา
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleTab, selectedRole === 'merchant' && styles.roleTabActive]}
          onPress={() => handleSelectRole('merchant')}
          activeOpacity={0.85}
        >
          <Icon
            name="store"
            size={16}
            color={selectedRole === 'merchant' ? COLORS.primary : '#64748B'}
            strokeWidth={selectedRole === 'merchant' ? 2.5 : 2}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.roleTabText,
              selectedRole === 'merchant' && styles.roleTabTextActive,
            ]}
          >
            ร้านค้า / แม่ค้า
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        {/* Auth Error Banner (เมื่อกรอกรหัสหรือเมลผิด) */}
        {authError ? (
          <View style={styles.errorBanner}>
            <Icon name="alert-circle" size={18} color="#DC2626" variant="filled" style={{ marginRight: 8 }} />
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        ) : null}

        {/* Email / SUT ID / Phone / Shop Code */}
        <View style={styles.inputLabelRow}>
          <Text style={styles.inputLabel}>
            {selectedRole === 'merchant'
              ? 'อีเมลร้านค้า หรือ รหัสร้านค้า (Shop Code)'
              : 'อีเมล มทส. หรือ รหัสนักศึกษา / เบอร์โทร'}
          </Text>
        </View>
        <View style={[styles.inputWrapper, identifierError ? styles.inputWrapperError : null]}>
          <TextInput
            style={styles.textInput}
            placeholder={
              selectedRole === 'merchant'
                ? 'merchant@sut.ac.th หรือ SUT-SHOP-01'
                : 'sarawut@g.sut.ac.th หรือ B6XXXXXX'
            }
            placeholderTextColor={COLORS.textMuted}
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              if (identifierError) setIdentifierError('');
              if (authError) setAuthError('');
            }}
            autoCapitalize="none"
          />
        </View>
        {identifierError ? (
          <Text style={styles.fieldErrorText}>* {identifierError}</Text>
        ) : null}

        {/* Password */}
        <View style={styles.inputLabelRow}>
          <Text style={styles.inputLabel}>รหัสผ่าน (Password)</Text>
        </View>
        <View style={[styles.inputWrapper, passwordError ? styles.inputWrapperError : null]}>
          <TextInput
            style={styles.textInput}
            placeholder="รหัสผ่าน"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
              if (authError) setAuthError('');
            }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Icon name={showPassword ? 'eye' : 'eye-off'} size={18} color="#64748B" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.fieldErrorText}>* {passwordError}</Text>
        ) : null}

        {/* Options Row: Remember Me & Forgot Password */}
        <View style={styles.optionsRow}>
          {/* Remember Me Toggle */}
          <TouchableOpacity
            style={styles.rememberMeBtn}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <Icon name="check" size={11} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text style={styles.rememberMeText}>จดจำฉันไว้ (Remember Me)</Text>
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
            <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn} activeOpacity={0.85}>
          <Text style={styles.signInBtnText}>
            {selectedRole === 'merchant' ? 'เข้าสู่ระบบร้านค้า →' : 'เข้าสู่ระบบ →'}
          </Text>
        </TouchableOpacity>

        {/* Divider: Or continue with */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>หรือเข้าสู่ระบบด้วย</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sign in with SUT Mail */}
        <TouchableOpacity style={styles.sutMailBtn} onPress={handleSignIn} activeOpacity={0.8}>
          <Icon name="graduation" size={18} color="#C2410C" strokeWidth={2} style={{ marginRight: 8 }} />
          <Text style={styles.sutMailText}>Sign in with SUT Mail</Text>
        </TouchableOpacity>

        {/* Social Icons Row (Google, Facebook, iOS / Apple) */}
        <View style={styles.socialRow}>
          {/* 1. Google */}
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={handleSignIn}
            activeOpacity={0.75}
            accessibilityLabel="Sign in with Google"
          >
            <Image
              source={require('../../../assets/icons/google.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 2. Facebook */}
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={handleSignIn}
            activeOpacity={0.75}
            accessibilityLabel="Sign in with Facebook"
          >
            <Image
              source={require('../../../assets/icons/facebook.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 3. Apple (iOS) */}
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={handleSignIn}
            activeOpacity={0.75}
            accessibilityLabel="Sign in with Apple"
          >
            <Image
              source={require('../../../assets/icons/apple.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Footer: New to SUT Canteen? Sign Up */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>ยังไม่มีบัญชี SUT Canteen? </Text>
          <TouchableOpacity onPress={onNavigateToSignUp}>
            <Text style={styles.footerLink}>สมัครสมาชิก (Sign Up)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  bowlIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 58, 0.2)',
  },
  logoTextCol: {
    justifyContent: 'center',
  },
  logoTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    ...TYPOGRAPHY.black,
    lineHeight: 14,
  },
  logoSub: {
    color: COLORS.primary,
    fontSize: 11,
    ...TYPOGRAPHY.bold,
    lineHeight: 12,
  },
  logoExpress: {
    color: COLORS.primary,
    fontSize: 11,
    ...TYPOGRAPHY.black,
    lineHeight: 12,
  },
  headingTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    ...TYPOGRAPHY.bold,
    textAlign: 'center',
    marginBottom: 2,
  },
  headingHighlight: {
    color: COLORS.primary,
    fontSize: 18,
    ...TYPOGRAPHY.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  headingSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    ...TYPOGRAPHY.regular,
    textAlign: 'center',
    marginBottom: 20,
  },
  roleTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    width: '100%',
    marginBottom: 20,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
  roleTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 13,
    ...TYPOGRAPHY.medium,
    color: '#64748B',
  },
  roleTabTextActive: {
    color: COLORS.primary,
    ...TYPOGRAPHY.bold,
  },
  form: {
    width: '100%',
  },
  inputLabelRow: {
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 8,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    backgroundColor: '#FEF2F2',
  },
  fieldErrorText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
    marginTop: -4,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    lineHeight: 18,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 18,
  },
  rememberMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberMeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  forgotBtn: {
    paddingVertical: 2,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  signInBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInBtnText: {
    color: COLORS.textWhite,
    fontSize: 15,
    ...TYPOGRAPHY.bold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    paddingHorizontal: 12,
    fontWeight: '500',
  },
  sutMailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 46,
    borderRadius: 12,
    marginBottom: 16,
  },
  sutMailText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialBtn: {
    width: 52,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  socialIcon: {
    width: 22,
    height: 22,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 13,
    ...TYPOGRAPHY.bold,
  },
});

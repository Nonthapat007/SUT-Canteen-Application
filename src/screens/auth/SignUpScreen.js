// Sign Up Screen matching Reference Mockup & Multi-Target Customer Support
// Supports multiple user targets:
// 1. Customer (นักเรียน/นักศึกษา, ครู/อาจารย์, บุคลากร, บุคคลทั่วไป)
// 2. Merchant (ร้านค้า/ผู้ประกอบการ)
// Adaptive identification field (Student ID, Staff ID, Citizen ID, Phone Number)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Icon from '../../components/common/Icon';
import authService from '../../services/authService';

export default function SignUpScreen({ onSignUpSuccess, onNavigateToSignIn }) {
  const [role, setRole] = useState('customer'); // 'customer' | 'merchant'
  const [customerType, setCustomerType] = useState('student'); // 'student' | 'staff' | 'general'
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Form Validation & Sign Up Error States
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [signUpError, setSignUpError] = useState('');

  // Dynamic label and placeholder for ID field based on target
  const getIdFieldInfo = () => {
    if (role === 'merchant') {
      return {
        label: 'Merchant ID / Shop Code (รหัสร้านค้า)',
        placeholder: 'SUT-SHOP-XX',
        iconName: 'store',
      };
    }
    if (customerType === 'student') {
      return {
        label: 'Student ID / SUT ID (รหัสนักศึกษา)',
        placeholder: 'B6XXXXXX หรือ M6XXXXXX',
        iconName: 'id-card',
      };
    }
    if (customerType === 'staff') {
      return {
        label: 'Staff ID / Citizen ID (รหัสบุคลากร / เลขบัตร)',
        placeholder: 'เช่น E12345 หรือ เลขบัตรประจำตัว',
        iconName: 'id-card',
      };
    }
    return {
      label: 'Phone Number / Citizen ID (เบอร์โทร / เลขบัตร)',
      placeholder: '08X-XXX-XXXX หรือ เลขบัตร',
      iconName: 'smartphone',
    };
  };

  const idInfo = getIdFieldInfo();

  const handleSubmit = async () => {
    let hasError = false;
    setSignUpError('');
    setFullNameError('');
    setEmailError('');
    setPasswordError('');

    if (!fullName.trim()) {
      setFullNameError('กรุณากรอกชื่อ - นามสกุลของคุณ');
      hasError = true;
    }
    if (!email.trim()) {
      setEmailError('กรุณากรอกอีเมลสำหรับการติดต่อ');
      hasError = true;
    } else if (!email.includes('@')) {
      setEmailError('รูปแบบอีเมลไม่ถูกต้อง (เช่น example@sut.ac.th)');
      hasError = true;
    }
    if (!password) {
      setPasswordError('กรุณากำหนดรหัสผ่าน');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    let roleTitle = 'นักศึกษา';
    if (role === 'merchant') {
      roleTitle = 'ผู้ประกอบการร้านค้า';
    } else if (customerType === 'staff') {
      roleTitle = 'อาจารย์ / บุคลากร';
    } else if (customerType === 'general') {
      roleTitle = 'บุคคลทั่วไป';
    }

    const userData = {
      fullName: fullName.trim(),
      studentId: idNumber.trim() || (role === 'merchant' ? 'SUT-SHOP-01' : (customerType === 'student' ? 'B6512345' : 'STAFF-101')),
      email: email.trim().toLowerCase(),
      password: password,
      role,
      customerType,
      roleTitle,
    };

    try {
      await authService.registerUser(userData);
    } catch (e) {
      console.warn('Registration storage note:', e);
    }

    onSignUpSuccess(userData);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Burger / Food Icon */}
      <View style={styles.topIconBox}>
        <Icon name="burger" size={28} color={COLORS.primary} strokeWidth={2} />
      </View>

      {/* Title & Subtitle */}
      <Text style={styles.title}>Join SUT Canteen Express</Text>
      <Text style={styles.subtitle}>Create an account to start ordering.</Text>

      {/* SELECT YOUR ROLE Section */}
      <Text style={styles.sectionLabel}>SELECT YOUR ROLE</Text>

      <View style={styles.roleRow}>
        {/* Customer Card (นักเรียน, ครูอาจารย์, บุคลากร, ทั่วไป) */}
        <TouchableOpacity
          style={[styles.roleCard, role === 'customer' ? styles.roleCardActive : styles.roleCardInactive]}
          onPress={() => setRole('customer')}
          activeOpacity={0.85}
        >
          <View style={styles.roleIconWrap}>
            <Icon
              name="user"
              size={24}
              color={role === 'customer' ? COLORS.primary : '#64748B'}
              strokeWidth={2}
            />
          </View>
          <Text style={styles.roleTitle}>Customer</Text>
          <Text style={styles.roleSub} numberOfLines={2}>
            Student, Staff, Teacher
          </Text>

          {/* Indicator Circle */}
          <View style={[styles.checkCircle, role === 'customer' ? styles.checkCircleActive : styles.checkCircleInactive]}>
            {role === 'customer' && <Icon name="check" size={12} color="#FFFFFF" strokeWidth={3} />}
          </View>
        </TouchableOpacity>

        {/* Merchant Card */}
        <TouchableOpacity
          style={[styles.roleCard, role === 'merchant' ? styles.roleCardActive : styles.roleCardInactive]}
          onPress={() => setRole('merchant')}
          activeOpacity={0.85}
        >
          <View style={styles.roleIconWrap}>
            <Icon
              name="store"
              size={24}
              color={role === 'merchant' ? COLORS.primary : '#64748B'}
              strokeWidth={2}
            />
          </View>
          <Text style={styles.roleTitle}>Merchant</Text>
          <Text style={styles.roleSub}>Shop Owner</Text>

          {/* Indicator Circle */}
          <View style={[styles.checkCircle, role === 'merchant' ? styles.checkCircleActive : styles.checkCircleInactive]}>
            {role === 'merchant' && <Icon name="check" size={12} color="#FFFFFF" strokeWidth={3} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* Customer Target Selection (Multi-target: นักศึกษา, อาจารย์/บุคลากร, บุคคลทั่วไป) */}
      {role === 'customer' && (
        <View style={styles.customerTypeContainer}>
          <Text style={styles.customerTypeLabel}>สถานะของคุณ (CUSTOMER TYPE):</Text>
          <View style={styles.customerTypeRow}>
            {[
              { key: 'student', title: 'นักศึกษา', sub: 'Student', iconName: 'graduation' },
              { key: 'staff', title: 'ครู / บุคลากร', sub: 'Teacher / Staff', iconName: 'briefcase' },
              { key: 'general', title: 'บุคคลทั่วไป', sub: 'General', iconName: 'building' },
            ].map((type) => {
              const isSelected = customerType === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.typePill, isSelected && styles.typePillActive]}
                  onPress={() => setCustomerType(type.key)}
                  activeOpacity={0.8}
                >
                  <View style={{ marginBottom: 4 }}>
                    <Icon
                      name={type.iconName}
                      size={20}
                      color={isSelected ? COLORS.primary : '#64748B'}
                      strokeWidth={2}
                    />
                  </View>
                  <Text style={[styles.typeTitle, isSelected && styles.textOrangeBold]}>
                    {type.title}
                  </Text>
                  <Text style={[styles.typeSub, isSelected && styles.textOrangeSub]}>
                    {type.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Input Form Fields */}
      <View style={styles.form}>
        {signUpError ? (
          <View style={styles.errorBanner}>
            <Icon name="alert-circle" size={18} color="#DC2626" variant="filled" style={{ marginRight: 8 }} />
            <Text style={styles.errorBannerText}>{signUpError}</Text>
          </View>
        ) : null}

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name (ชื่อ - นามสกุล)</Text>
          <View style={[styles.inputWrapper, fullNameError ? styles.inputWrapperError : null]}>
            <Icon name="user" size={18} color="#64748B" strokeWidth={2} style={styles.inputPrefixIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Jane Doe"
              placeholderTextColor={COLORS.textMuted}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (fullNameError) setFullNameError('');
                if (signUpError) setSignUpError('');
              }}
            />
          </View>
          {fullNameError ? (
            <Text style={styles.fieldErrorText}>* {fullNameError}</Text>
          ) : null}
        </View>

        {/* Dynamic Multi-Target ID Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{idInfo.label}</Text>
          <View style={styles.inputWrapper}>
            <Icon name={idInfo.iconName} size={18} color="#64748B" strokeWidth={2} style={styles.inputPrefixIcon} />
            <TextInput
              style={styles.textInput}
              placeholder={idInfo.placeholder}
              placeholderTextColor={COLORS.textMuted}
              value={idNumber}
              onChangeText={setIdNumber}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {role === 'customer' && customerType === 'student'
              ? 'University Email (อีเมล มทส.)'
              : 'Email (อีเมลติดต่อ)'}
          </Text>
          <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
            <Icon name="mail" size={18} color="#64748B" strokeWidth={2} style={styles.inputPrefixIcon} />
            <TextInput
              style={styles.textInput}
              placeholder={
                role === 'customer' && customerType === 'student'
                  ? 'example@g.sut.ac.th'
                  : 'example@email.com'
              }
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
                if (signUpError) setSignUpError('');
              }}
            />
          </View>
          {emailError ? (
            <Text style={styles.fieldErrorText}>* {emailError}</Text>
          ) : null}
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.inputWrapper, passwordError ? styles.inputWrapperError : null]}>
            <Icon name="lock" size={18} color="#64748B" strokeWidth={2} style={styles.inputPrefixIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
                if (signUpError) setSignUpError('');
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Icon name={showPassword ? 'eye' : 'eye-off'} size={18} color="#64748B" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.fieldErrorText}>* {passwordError}</Text>
          ) : null}
        </View>

        {/* Checkbox: Terms of Service */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreeTerms(!agreeTerms)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
            {agreeTerms && <Icon name="check" size={12} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* CREATE ACCOUNT Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.submitBtnText}>CREATE ACCOUNT</Text>
        </TouchableOpacity>

        {/* Footer: Already have an account? Log in */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={onNavigateToSignIn}>
            <Text style={styles.footerLink}>Log in</Text>
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
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  topIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  burgerEmoji: {
    fontSize: 26,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    ...TYPOGRAPHY.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    ...TYPOGRAPHY.regular,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    color: COLORS.textPrimary,
    fontSize: 11,
    ...TYPOGRAPHY.bold,
    letterSpacing: 0.8,
    alignSelf: 'center',
    marginBottom: 12,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 16,
  },
  roleCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
  },
  roleCardActive: {
    backgroundColor: COLORS.roleActiveBg,
    borderColor: COLORS.roleActiveBorder,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  roleCardInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: COLORS.border,
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  roleIconWrap: {
    marginBottom: 6,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputPrefixIcon: {
    marginRight: 10,
  },
  roleTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    ...TYPOGRAPHY.bold,
    marginBottom: 2,
  },
  roleSub: {
    color: COLORS.textSecondary,
    fontSize: 10,
    ...TYPOGRAPHY.medium,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 13,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  checkCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkCircleInactive: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  checkText: {
    color: COLORS.textWhite,
    fontSize: 11,
    ...TYPOGRAPHY.black,
  },
  // Customer Multi-Target Pills
  customerTypeContainer: {
    width: '100%',
    marginBottom: 16,
  },
  customerTypeLabel: {
    color: COLORS.textPrimary,
    fontSize: 11,
    ...TYPOGRAPHY.bold,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  customerTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typePill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typePillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeIcon: {
    fontSize: 15,
    marginBottom: 2,
  },
  typeTitle: {
    color: COLORS.textPrimary,
    fontSize: 11,
    ...TYPOGRAPHY.bold,
    textAlign: 'center',
  },
  typeSub: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 1,
  },
  textOrangeBold: {
    color: COLORS.primary,
  },
  textOrangeSub: {
    color: '#EA580C',
  },
  // Form Inputs
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 13,
  },
  inputLabel: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
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
    marginTop: 4,
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
  fieldIcon: {
    fontSize: 15,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 16,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 18,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxCheck: {
    color: COLORS.textWhite,
    fontSize: 12,
    ...TYPOGRAPHY.black,
  },
  termsText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: COLORS.textWhite,
    fontSize: 14,
    ...TYPOGRAPHY.bold,
    letterSpacing: 0.5,
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

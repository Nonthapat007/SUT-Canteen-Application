// Profile Screen matching Reference Mockup & UX Laws
// Features:
// - Top Bar: "Profile" with GPS Building Selector Pill ("📍 จุดอาคารปัจจุบัน") right next to Profile for instant visibility & 1-tap change
// - User Hero Card: Overlapping avatar, Name, Student ID / Faculty
// - Floating Balance Card: Wallet Balance (฿150) + SUT Rewards (1,200 pts) with 1-tap Top Up
// - Quick Actions: "Order History & Reorder" and "Favorites"
// - Grouped Settings: Notifications (Switch), Saved Customizations, Language, Privacy & Security, Help Center
// - Merchant KDS Access & Destructive Log Out button

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import { SUT_BUILDINGS } from '../../constants/campusData';
import Icon from '../../components/common/Icon';
import ModernSwitch from '../../components/common/ModernSwitch';
import { getPermanentImageUri, sanitizeAvatarUri } from '../../utils/imageUtils';
import { FONT_FAMILY, TYPOGRAPHY } from '../../constants/typography';

export default function ProfileScreen({
  currentUser,
  currentBuilding,
  walletBalance = 0,
  rewardsPoints = 0,
  highlightWallet = false,
  onResetHighlight,
  onSelectBuilding,
  onTopUpWallet,
  onNavigateOrders,
  onNavigateSearch,
  onUpdateProfile,
  onRefreshProfile,
  onLogout,
}) {
  // Settings States
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('Thai / Eng');

  // Modals
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(null); // 'privacy' | 'help' | null

  // Edit Profile States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editGender, setEditGender] = useState('ชาย');
  const [editAvatarUri, setEditAvatarUri] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editError, setEditError] = useState('');

  // If redirected because of insufficient balance (0 Baht), auto-show modal after brief delay
  useEffect(() => {
    if (highlightWallet) {
      const timer = setTimeout(() => {
        setShowTopUpModal(true);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [highlightWallet]);

  // Saved customizations state
  const [savedPreferences, setSavedPreferences] = useState([
    { id: '1', label: 'ไม่ใส่ถั่วงอก (No bean sprouts)', enabled: true },
    { id: '2', label: 'เผ็ดน้อย (Mild spicy)', enabled: true },
    { id: '3', label: 'ไม่ใส่ผงชูรส (No MSG)', enabled: false },
    { id: '4', label: 'ไข่ดาวไม่สุก (Soft yolk)', enabled: true },
    { id: '5', label: 'หวานน้อย (Less sweet)', enabled: true },
  ]);

  // Favorite items mock
  const favoriteItems = [
    { id: 'f1', name: 'ก๋วยเตี๋ยวเรือสูตรพิเศษ', stall: 'Noodle House', price: 45, icon: '🍜' },
    { id: 'f2', name: 'ข้าวมันไก่ผสมพิเศษ', stall: "Mama's Kitchen", price: 50, icon: '🍗' },
    { id: 'f3', name: 'น้ำแตงโมปั่นเกล็ดหิมะ', stall: 'Fruit Bar', price: 35, icon: '🍉' },
  ];

  const handleTogglePreference = (id) => {
    setSavedPreferences((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleSubmitTopUp = (presetAmount) => {
    const amountVal = presetAmount !== undefined ? presetAmount : parseInt(customAmount, 10);
    if (!amountVal || isNaN(amountVal) || amountVal <= 0) {
      Alert.alert('กรุณากรอกจำนวนเงิน', 'กรุณาระบุจำนวนเงินที่ต้องการเติมให้ถูกต้อง (มากกว่า 0 บาท)');
      return;
    }

    if (onTopUpWallet) {
      onTopUpWallet(amountVal);
    }
    setShowTopUpModal(false);
    setCustomAmount('');
    if (typeof onResetHighlight === 'function') {
      onResetHighlight();
    }
    Alert.alert(
      '🎉 เติมเงินสำเร็จ!',
      `เติมเงินเข้า SUT Canteen Wallet จำนวน ฿${amountVal.toLocaleString()} เรียบร้อยแล้ว\nยอดคงเหลือปัจจุบัน: ฿${(walletBalance + amountVal).toLocaleString()}`
    );
  };

  // Open Edit Profile modal with currentUser data prefilled
  const handleOpenEditProfile = () => {
    setEditFullName(currentUser?.fullName || '');
    setEditPhone(currentUser?.phoneNumber || '');
    setEditEmail(currentUser?.email || '');
    setEditGender(currentUser?.gender || 'ชาย');
    setEditAvatarUri(sanitizeAvatarUri(currentUser?.avatarUri));
    setEditError('');
    setShowEditProfileModal(true);
  };

  // Pick profile picture from device media library
  const handlePickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('ต้องการการอนุญาต', 'กรุณาอนุญาตให้แอปเข้าถึงรูปภาพในเครื่องเพื่อเปลี่ยนรูปโปรไฟล์');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const permanentUri = await getPermanentImageUri(result.assets[0]);
        setEditAvatarUri(permanentUri);
      }
    } catch (err) {
      console.warn('ImagePicker launch error:', err);
      Alert.alert('แจ้งเตือน', 'ไม่สามารถเลือกรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Save profile updates
  const handleSaveProfile = async () => {
    const trimmedName = editFullName.trim();
    const trimmedEmail = editEmail.trim();

    if (!trimmedName) {
      setEditError('กรุณาระบุชื่อ - นามสกุล');
      return;
    }
    if (!trimmedEmail) {
      setEditError('กรุณาระบุอีเมล');
      return;
    }

    setIsSavingProfile(true);
    setEditError('');

    try {
      const payload = {
        fullName: trimmedName,
        phoneNumber: editPhone.trim(),
        email: trimmedEmail,
        gender: editGender,
        avatarUri: editAvatarUri,
      };

      if (typeof onUpdateProfile === 'function') {
        const res = await onUpdateProfile(payload);
        if (res?.error) {
          setEditError(res.error);
          setIsSavingProfile(false);
          return;
        }
      }

      setIsSavingProfile(false);
      setShowEditProfileModal(false);
      Alert.alert('สำเร็จ', 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!');
    } catch (e) {
      console.warn('Failed to update profile:', e);
      setIsSavingProfile(false);
      setEditError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Top Bar: "Profile" title + GPS Location Pill (ข้างโปรไฟล์) + Gear settings icon */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Profile</Text>

          {/* จุดอาคารปัจจุบัน (GPS Geofence) วางข้างหัวข้อ Profile ตามที่ผู้ใช้กำหนด มองเห็นและแตะเปลี่ยนง่าย */}
          <TouchableOpacity
            style={styles.buildingLocationPill}
            onPress={() => setShowBuildingModal(true)}
            activeOpacity={0.75}
          >
            <Icon name="location" size={11} color="#C2410C" variant="filled" />
            <Text style={styles.buildingLocationText} numberOfLines={1}>
              {currentBuilding?.name || 'อาคารเรียนรวม 1 (B1)'}
            </Text>
            <Icon name="chevron-down" size={9} color="#EA580C" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.gearBtn}
          onPress={() => setShowInfoModal('help')}
          activeOpacity={0.7}
        >
          <Icon name="gear" size={18} color="#475569" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* 2. User Hero Card with Overlapping Avatar & Floating Wallet Pill */}
        <View style={styles.heroCard}>
          {/* Avatar Peeking Over Top with Pencil Edit Badge */}
          <TouchableOpacity
            style={styles.avatarTouchContainer}
            onPress={handleOpenEditProfile}
            activeOpacity={0.85}
          >
            <View style={styles.avatarWrapper}>
              {sanitizeAvatarUri(currentUser?.avatarUri) ? (
                <Image source={{ uri: sanitizeAvatarUri(currentUser.avatarUri) }} style={styles.avatarImage} />
              ) : (
                <Icon name="user" size={36} color={COLORS.primary} strokeWidth={2.2} />
              )}
            </View>
            <View style={styles.avatarEditBadge}>
              <Icon name="pencil" size={13} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* User Name & Faculty / Role */}
          <Text style={styles.userName}>{currentUser?.fullName || 'ผู้ใช้งาน มทส.'}</Text>
          <Text style={styles.userSubtitle}>
            {currentUser?.studentId ? `ID: ${currentUser.studentId}` : (currentUser?.email || '')} {currentUser?.roleTitle ? `• ${currentUser.roleTitle}` : ''}
          </Text>

          {/* Edit Profile Quick Action Pill */}
          <TouchableOpacity
            style={styles.quickEditBtn}
            onPress={handleOpenEditProfile}
            activeOpacity={0.7}
          >
            <Icon name="pencil" size={11} color={COLORS.primary} strokeWidth={2.5} />
            <Text style={styles.quickEditText}>แก้ไขโปรไฟล์</Text>
          </TouchableOpacity>

          {/* Floating Balance & Rewards Card (Highlighted when funds are low) */}
          <View style={styles.balancePillWrapper}>
            {highlightWallet && (
              <View style={styles.highlightNoticePill}>
                <Icon name="bell" size={12} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 5 }} />
                <Text style={styles.highlightNoticeText}>
                  ยอดเงินคงเหลือ ฿{walletBalance} • แตะที่นี่เพื่อเติมเงิน!
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.balancePill,
                highlightWallet && styles.balancePillHighlighted,
              ]}
              onPress={() => {
                setShowTopUpModal(true);
                if (typeof onResetHighlight === 'function') onResetHighlight();
              }}
              activeOpacity={0.88}
            >
              {/* Left Column: Wallet Balance */}
              <View style={[styles.balanceCol, highlightWallet && styles.balanceColHighlighted]}>
                <Text style={styles.balanceLabel}>Wallet Balance</Text>
                <Text style={[styles.balanceValue, highlightWallet && styles.balanceValueAlert]}>
                  ฿{walletBalance}
                </Text>
                <Text style={[styles.topUpHint, highlightWallet && styles.topUpHintHighlighted]}>
                  {highlightWallet ? '👉 แตะเพื่อเติมเงินเลย' : '+ แตะเพื่อเติมเงิน'}
                </Text>
              </View>

              {/* Middle Divider */}
              <View style={styles.balanceDivider} />

              {/* Right Column: SUT Rewards */}
              <View style={styles.balanceCol}>
                <Text style={styles.balanceLabel}>SUT Rewards</Text>
                <Text style={styles.rewardsValue}>
                  {rewardsPoints.toLocaleString()} <Text style={styles.ptsText}>pts</Text>
                </Text>
                <Text style={styles.rewardTierHint}>ระดับ Gold Member</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            {/* Action 1: Order History & Reorder */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={onNavigateOrders}
              activeOpacity={0.85}
            >
              <View style={styles.iconCircleBlue}>
                <Icon name="refresh" size={20} color="#2563EB" strokeWidth={2.2} />
              </View>
              <Text style={styles.actionCardTitle}>Order History & Reorder</Text>
            </TouchableOpacity>

            {/* Action 2: Favorites */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setShowFavoritesModal(true)}
              activeOpacity={0.85}
            >
              <View style={styles.iconCirclePink}>
                <Icon name="heart" size={20} color="#E11D48" variant="filled" />
              </View>
              <Text style={styles.actionCardTitle}>Favorites</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Settings Group */}
        <View style={styles.settingsGroupCard}>
          {/* Row: Edit Profile */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleOpenEditProfile}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Icon name="pencil" size={19} color="#475569" strokeWidth={2} />
              <View>
                <Text style={styles.settingLabel}>Edit Profile</Text>
                <Text style={styles.settingSub}>แก้ไขชื่อ, เบอร์โทร, อีเมล, เพศ, รูปภาพ</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Row 1: Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon
                name="bell"
                size={19}
                color="#475569"
                strokeWidth={2}
              />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <ModernSwitch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              activeTrackColor={COLORS.primary}
            />
          </View>

          <View style={styles.rowDivider} />

          {/* Row 2: Saved Customizations */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowCustomizationModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Icon name="sliders" size={19} color="#475569" strokeWidth={2} />
              <View>
                <Text style={styles.settingLabel}>Saved Customizations</Text>
                <Text style={styles.settingSub}>e.g., No spicy</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Row 3: Language */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              const next = language === 'Thai / Eng' ? 'ไทย (TH)' : 'Thai / Eng';
              setLanguage(next);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Icon name="globe" size={19} color="#475569" strokeWidth={2} />
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.languageText}>{language}</Text>
              <Icon name="chevron-right" size={16} color="#94A3B8" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Row 4: Privacy & Security */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowInfoModal('privacy')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Icon name="lock" size={19} color="#475569" strokeWidth={2} />
              <Text style={styles.settingLabel}>Privacy & Security</Text>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Row 5: Help Center */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowInfoModal('help')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Icon name="help" size={19} color="#475569" strokeWidth={2} />
              <Text style={styles.settingLabel}>Help Center</Text>
            </View>
            <Icon name="chevron-right" size={16} color="#94A3B8" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Log Out Button matching Reference (Soft Pink/Red tone) */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
          <View style={styles.logoutContent}>
            <Icon name="logout" size={17} color="#E11D48" strokeWidth={2.2} />
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </View>

      {/* MODAL 1: Top Up Wallet (Custom Input + Quick Preset Chips matching User Request) */}
      <Modal visible={showTopUpModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Icon name="wallet" size={20} color={COLORS.primary} variant="filled" />
                <Text style={styles.modalTitle}>เติมเงินเข้า SUT Canteen Wallet</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowTopUpModal(false);
                  setCustomAmount('');
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={20} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <View style={styles.currentBalanceRow}>
              <Text style={styles.topUpSub}>ยอดเงินปัจจุบัน:</Text>
              <Text style={styles.textOrangeBold}>฿{walletBalance}</Text>
            </View>

            {/* Custom Amount Input: ให้กรอกเองได้ตามที่ผู้ใช้ขอ */}
            <Text style={styles.selectAmountLabel}>ระบุจำนวนเงินที่ต้องการเติม (บาท):</Text>
            <View style={styles.customInputRow}>
              <Text style={styles.inputCurrencyPrefix}>฿</Text>
              <TextInput
                style={styles.amountTextInput}
                value={customAmount}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setCustomAmount(cleaned);
                }}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={6}
              />
              {customAmount.length > 0 && (
                <TouchableOpacity
                  onPress={() => setCustomAmount('')}
                  style={styles.clearBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="close" size={14} color="#94A3B8" strokeWidth={2.5} />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Preset Buttons (4 options from user's screenshot) */}
            <Text style={styles.presetLabel}>หรือเลือกจำนวนเงินด่วน:</Text>
            <View style={styles.topUpGrid}>
              {[50, 100, 300, 500].map((amt) => {
                const isSelected = customAmount === String(amt);
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.topUpPill, isSelected && styles.topUpPillActive]}
                    onPress={() => setCustomAmount(String(amt))}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.topUpPillText, isSelected && styles.topUpPillTextActive]}>
                      +฿{amt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Zero-Fee Note */}
            <View style={styles.zeroFeeRow}>
              <Icon name="check" size={14} color="#059669" strokeWidth={2.5} />
              <Text style={styles.topUpNote}>
                ไม่มีค่าธรรมเนียม (Zero-Fee) ผ่าน PromptPay / บัตรนักศึกษา มทส.
              </Text>
            </View>

            {/* Confirm Top Up Button */}
            <TouchableOpacity
              style={[
                styles.confirmTopUpBtn,
                (!customAmount || parseInt(customAmount, 10) <= 0) && styles.confirmTopUpBtnDisabled,
              ]}
              disabled={!customAmount || parseInt(customAmount, 10) <= 0}
              onPress={() => handleSubmitTopUp()}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmTopUpBtnText}>
                {customAmount && parseInt(customAmount, 10) > 0
                  ? `ยืนยันการเติมเงิน ฿${parseInt(customAmount, 10).toLocaleString()}`
                  : 'กรุณาระบุจำนวนเงินที่ต้องการเติม'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Saved Customizations */}
      <Modal visible={showCustomizationModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Icon name="sliders" size={18} color={COLORS.primary} strokeWidth={2.2} />
                <Text style={styles.modalTitle}>ตัวเลือกพิเศษที่บันทึกไว้</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCustomizationModal(false)}>
                <Icon name="close" size={18} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubDesc}>
              ระบบจะเลือกตัวเลือกเหล่านี้ให้อัตโนมัติเมื่อสั่งอาหารเพื่อความสะดวกรวดเร็ว:
            </Text>

            <View style={styles.preferencesList}>
              {savedPreferences.map((pref) => (
                <TouchableOpacity
                  key={pref.id}
                  style={[styles.prefItem, pref.enabled && styles.prefItemActive]}
                  onPress={() => handleTogglePreference(pref.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.prefText, pref.enabled && styles.prefTextActive]}>
                    {pref.label}
                  </Text>
                  {pref.enabled ? (
                    <Icon name="check" size={16} color="#EA580C" strokeWidth={2.5} />
                  ) : (
                    <View style={styles.uncheckCircle} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => setShowCustomizationModal(false)}
            >
              <Text style={styles.modalPrimaryBtnText}>บันทึกการตั้งค่า</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Favorites List */}
      <Modal visible={showFavoritesModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Icon name="heart" size={18} color="#E11D48" variant="filled" />
                <Text style={styles.modalTitle}>รายการโปรดของคุณ</Text>
              </View>
              <TouchableOpacity onPress={() => setShowFavoritesModal(false)}>
                <Icon name="close" size={18} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.favoritesList}>
              {favoriteItems.map((fav) => (
                <View key={fav.id} style={styles.favCard}>
                  <View style={styles.favIconWrap}>
                    <Icon name="utensils" size={18} color="#EA580C" variant="filled" />
                  </View>
                  <View style={styles.favInfo}>
                    <Text style={styles.favName}>{fav.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Icon name="store" size={10} color="#64748B" strokeWidth={2} />
                      <Text style={styles.favStall}>{fav.stall}</Text>
                    </View>
                    <Text style={styles.favPrice}>฿{fav.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favOrderBtn}
                    onPress={() => {
                      setShowFavoritesModal(false);
                      if (onNavigateSearch) onNavigateSearch();
                    }}
                  >
                    <Text style={styles.favOrderText}>+ สั่งด่วน</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: Building GPS Selector */}
      <Modal visible={showBuildingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Icon name="location" size={18} color={COLORS.primary} variant="filled" />
                <Text style={styles.modalTitle}>ระบุอาคารเรียนใน มทส.</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBuildingModal(false)}>
                <Icon name="close" size={18} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {SUT_BUILDINGS.map((bld) => {
                const isSelected = bld.id === currentBuilding?.id;
                return (
                  <TouchableOpacity
                    key={bld.id}
                    style={[styles.bldItem, isSelected && styles.bldItemActive]}
                    onPress={() => {
                      onSelectBuilding(bld);
                      setShowBuildingModal(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.bldName, isSelected && styles.textOrangeBold]}>
                        {bld.name}
                      </Text>
                      <Text style={styles.bldZone}>โซน: {bld.zone}</Text>
                    </View>
                    {isSelected && <Icon name="check" size={18} color={COLORS.primary} strokeWidth={2.5} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: Privacy / Help Dialog */}
      <Modal visible={!!showInfoModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Icon
                  name={showInfoModal === 'privacy' ? 'lock' : 'help'}
                  size={18}
                  color={COLORS.primary}
                  strokeWidth={2}
                />
                <Text style={styles.modalTitle}>
                  {showInfoModal === 'privacy' ? 'ความเป็นส่วนตัวและความปลอดภัย' : 'ศูนย์ช่วยเหลือ (Help Center)'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowInfoModal(null)}>
                <Icon name="close" size={18} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {showInfoModal === 'privacy' ? (
              <View style={styles.infoContent}>
                <Text style={styles.infoParagraph}>
                  ข้อมูลและประวัติการสั่งอาหารของคุณได้รับการเข้ารหัสตามมาตรฐานสากล และใช้เพื่อคำนวณเวลาการเดินเท้าและช่วงเวลาอบอุ่นอาหาร (Predictive Slotting) ภายใน มทส. เท่านั้น
                </Text>
                <Text style={styles.infoParagraph}>
                  ไม่มีการเปิดเผยข้อมูลส่วนบุคคลหรือพิกัดตำแหน่งแก่องค์กรภายนอก
                </Text>
              </View>
            ) : (
              <View style={styles.infoContent}>
                <View style={styles.infoRowItem}>
                  <Icon name="phone" size={14} color="#475569" strokeWidth={2} />
                  <Text style={styles.infoParagraph}>
                    ฝ่ายดูแลสวัสดิการอาหาร มทส.: 044-224-000 ต่อ 8888
                  </Text>
                </View>
                <View style={styles.infoRowItem}>
                  <Icon name="qr-code" size={14} color="#475569" strokeWidth={2} />
                  <Text style={styles.infoParagraph}>
                    LINE Official: @sut-canteen-express
                  </Text>
                </View>
                <View style={styles.infoRowItem}>
                  <Icon name="clock" size={14} color="#475569" strokeWidth={2} />
                  <Text style={styles.infoParagraph}>
                    ให้บริการทุกวัน: 07:00 – 19:30 น.
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => setShowInfoModal(null)}
            >
              <Text style={styles.modalPrimaryBtnText}>รับทราบ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 6: Edit Profile Modal */}
      <Modal visible={showEditProfileModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.editProfileModalCard]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.headerIconCircle}>
                  <Icon name="pencil" size={15} color={COLORS.primary} strokeWidth={2.5} />
                </View>
                <Text style={styles.modalTitle}>แก้ไขข้อมูลโปรไฟล์</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEditProfileModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={20} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.editProfileScrollView}>
              {/* Profile Image Preview & Picker */}
              <View style={styles.editAvatarSection}>
                <TouchableOpacity
                  style={styles.editAvatarTouch}
                  onPress={handlePickImage}
                  activeOpacity={0.8}
                >
                  <View style={styles.editAvatarFrame}>
                    {editAvatarUri ? (
                      <Image source={{ uri: editAvatarUri }} style={styles.editAvatarImage} />
                    ) : (
                      <View style={styles.editAvatarPlaceholder}>
                        <Icon name="user" size={44} color={COLORS.primary} strokeWidth={2.2} />
                      </View>
                    )}
                  </View>
                  <View style={styles.editAvatarCameraBadge}>
                    <Icon name="camera" size={13} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                </TouchableOpacity>

                {/* Avatar buttons */}
                <View style={styles.avatarButtonRow}>
                  <TouchableOpacity
                    style={styles.choosePhotoBtn}
                    onPress={handlePickImage}
                    activeOpacity={0.8}
                  >
                    <Icon name="image" size={14} color={COLORS.primary} strokeWidth={2} />
                    <Text style={styles.choosePhotoBtnText}>เลือกรูปภาพจากเครื่อง</Text>
                  </TouchableOpacity>

                  {editAvatarUri && (
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => setEditAvatarUri(null)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.removePhotoBtnText}>ลบรูป</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.avatarHelperText}>แตะที่รูปหรือปุ่มเพื่อเลือกรูปภาพจากในเครื่อง</Text>
              </View>

              {/* Error Alert Message if any */}
              {editError ? (
                <View style={styles.editErrorBanner}>
                  <Icon name="alert-circle" size={15} color="#EF4444" strokeWidth={2} />
                  <Text style={styles.editErrorText}>{editError}</Text>
                </View>
              ) : null}

              {/* Form Fields */}
              <View style={styles.formSection}>
                {/* 1. Full Name */}
                <View style={styles.formFieldGroup}>
                  <Text style={styles.formLabel}>
                    ชื่อ - นามสกุล <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.inputWithIconWrapper}>
                    <View style={styles.inputLeftIcon}>
                      <Icon name="user" size={16} color="#64748B" strokeWidth={2} />
                    </View>
                    <TextInput
                      style={styles.formTextInput}
                      value={editFullName}
                      onChangeText={(t) => {
                        setEditFullName(t);
                        if (editError) setEditError('');
                      }}
                      placeholder="เช่น สมชาย ใจดี"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                {/* 2. Phone Number */}
                <View style={styles.formFieldGroup}>
                  <Text style={styles.formLabel}>เบอร์โทรศัพท์มือถือ</Text>
                  <View style={styles.inputWithIconWrapper}>
                    <View style={styles.inputLeftIcon}>
                      <Icon name="phone" size={16} color="#64748B" strokeWidth={2} />
                    </View>
                    <TextInput
                      style={styles.formTextInput}
                      value={editPhone}
                      onChangeText={(t) => {
                        setEditPhone(t);
                        if (editError) setEditError('');
                      }}
                      placeholder="เช่น 081-234-5678"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* 3. Email */}
                <View style={styles.formFieldGroup}>
                  <Text style={styles.formLabel}>
                    อีเมล (Email) <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.inputWithIconWrapper}>
                    <View style={styles.inputLeftIcon}>
                      <Icon name="mail" size={16} color="#64748B" strokeWidth={2} />
                    </View>
                    <TextInput
                      style={styles.formTextInput}
                      value={editEmail}
                      onChangeText={(t) => {
                        setEditEmail(t);
                        if (editError) setEditError('');
                      }}
                      placeholder="เช่น user@sut.ac.th"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* 4. Gender (เพศ) */}
                <View style={styles.formFieldGroup}>
                  <Text style={styles.formLabel}>เพศ (Gender)</Text>
                  <View style={styles.genderRow}>
                    {[
                      { id: 'ชาย', label: 'ชาย', icon: '👨' },
                      { id: 'หญิง', label: 'หญิง', icon: '👩' },
                      { id: 'ไม่ระบุ', label: 'ไม่ระบุ', icon: '✨' },
                    ].map((g) => {
                      const isSelected = editGender === g.id;
                      return (
                        <TouchableOpacity
                          key={g.id}
                          style={[
                            styles.genderChip,
                            isSelected && styles.genderChipActive,
                          ]}
                          onPress={() => setEditGender(g.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.genderChipEmoji}>{g.icon}</Text>
                          <Text
                            style={[
                              styles.genderChipText,
                              isSelected && styles.genderChipTextActive,
                            ]}
                          >
                            {g.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.cancelEditBtn}
                  onPress={() => setShowEditProfileModal(false)}
                  disabled={isSavingProfile}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelEditBtnText}>ยกเลิก</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveProfileBtn, isSavingProfile && styles.saveProfileBtnDisabled]}
                  onPress={handleSaveProfile}
                  disabled={isSavingProfile}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveProfileBtnText}>
                    {isSavingProfile ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.black,
    color: '#0F172A',
    fontSize: 24,
    letterSpacing: -0.5,
  },
  // GPS Location Pill beside Profile (ข้างโปรไฟล์)
  buildingLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 8,
    gap: 4,
    flexShrink: 1,
    maxWidth: 190,
  },
  buildingLocationIcon: {
    fontSize: 11,
  },
  buildingLocationText: {
    ...TYPOGRAPHY.bold,
    color: '#C2410C',
    fontSize: 11,
    flexShrink: 1,
  },
  buildingChevron: {
    color: '#EA580C',
    fontSize: 10,
    ...TYPOGRAPHY.bold,
  },
  gearBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gearIcon: {
    fontSize: 17,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  // Hero Card
  heroCard: {
    backgroundColor: '#FFEFE7', // Warm peach tone matching screenshot
    borderRadius: 24,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    marginTop: 40,
    marginBottom: 20,
    position: 'relative',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  avatarTouchContainer: {
    position: 'absolute',
    top: -38,
    alignSelf: 'center',
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  avatarWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FED7AA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: COLORS.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  userName: {
    ...TYPOGRAPHY.black,
    color: '#0F172A',
    fontSize: 20,
    marginBottom: 2,
    textAlign: 'center',
  },
  userSubtitle: {
    ...TYPOGRAPHY.medium,
    color: '#64748B',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  quickEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  quickEditText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.primary,
    fontSize: 11,
  },
  // Balance Floating Pill
  balancePillWrapper: {
    width: '100%',
    position: 'relative',
  },
  balancePill: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(254, 215, 170, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  balancePillHighlighted: {
    borderColor: '#FF5E3A',
    borderWidth: 2.5,
    backgroundColor: '#FFF7ED',
    shadowColor: '#FF5E3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  balanceCol: {
    flex: 1,
    alignItems: 'center',
  },
  balanceColHighlighted: {
    backgroundColor: 'rgba(255, 94, 58, 0.12)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  balanceLabel: {
    ...TYPOGRAPHY.medium,
    color: '#64748B',
    fontSize: 11,
    marginBottom: 2,
  },
  balanceValue: {
    ...TYPOGRAPHY.black,
    color: '#EA580C',
    fontSize: 20,
  },
  balanceValueAlert: {
    ...TYPOGRAPHY.black,
    color: '#DC2626',
  },
  topUpHint: {
    ...TYPOGRAPHY.bold,
    color: COLORS.primary,
    fontSize: 9,
    marginTop: 2,
  },
  topUpHintHighlighted: {
    ...TYPOGRAPHY.black,
    color: '#EA580C',
    fontSize: 10,
    marginTop: 2,
  },
  highlightNoticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  highlightNoticeText: {
    ...TYPOGRAPHY.extraBold,
    color: '#FFFFFF',
    fontSize: 11,
  },
  balanceDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  rewardsValue: {
    ...TYPOGRAPHY.black,
    color: '#EA580C',
    fontSize: 20,
  },
  ptsText: {
    ...TYPOGRAPHY.bold,
    fontSize: 11,
    color: '#EA580C',
  },
  rewardTierHint: {
    ...TYPOGRAPHY.bold,
    color: '#059669',
    fontSize: 9,
    marginTop: 2,
  },
  // Quick Actions
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    ...TYPOGRAPHY.extraBold,
    color: '#0F172A',
    fontSize: 17,
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  iconCircleBlue: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCirclePink: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionCardIcon: {
    fontSize: 18,
  },
  actionCardTitle: {
    ...TYPOGRAPHY.extraBold,
    color: '#0F172A',
    fontSize: 13,
    lineHeight: 18,
  },
  // Settings Group Card
  settingsGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  settingLabel: {
    ...TYPOGRAPHY.bold,
    color: '#0F172A',
    fontSize: 14,
  },
  settingSub: {
    ...TYPOGRAPHY.regular,
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  languageText: {
    ...TYPOGRAPHY.medium,
    color: '#94A3B8',
    fontSize: 12,
  },
  settingChevron: {
    ...TYPOGRAPHY.bold,
    color: '#94A3B8',
    fontSize: 18,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 52,
  },
  // Merchant Card
  merchantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  merchantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  merchantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  merchantIcon: {
    fontSize: 20,
  },
  merchantTitle: {
    ...TYPOGRAPHY.extraBold,
    color: '#0F172A',
    fontSize: 13,
  },
  merchantSub: {
    ...TYPOGRAPHY.regular,
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  merchantIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  merchantArrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  merchantChevron: {
    ...TYPOGRAPHY.black,
    color: COLORS.primary,
    fontSize: 18,
  },
  // Log Out Button
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutText: {
    ...TYPOGRAPHY.bold,
    color: '#E11D48',
    fontSize: 15,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  modalTitle: {
    ...TYPOGRAPHY.bold,
    color: '#0F172A',
    fontSize: 15,
    flex: 1,
  },
  modalCloseText: {
    ...TYPOGRAPHY.bold,
    color: '#64748B',
    fontSize: 16,
    padding: 4,
  },
  currentBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  topUpSub: {
    ...TYPOGRAPHY.regular,
    color: '#64748B',
    fontSize: 13,
  },
  textOrangeBold: {
    ...TYPOGRAPHY.black,
    color: '#EA580C',
    fontSize: 16,
  },
  selectAmountLabel: {
    ...TYPOGRAPHY.bold,
    color: '#0F172A',
    fontSize: 13,
    marginBottom: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
  },
  inputCurrencyPrefix: {
    ...TYPOGRAPHY.black,
    fontSize: 24,
    color: '#EA580C',
    marginRight: 6,
  },
  amountTextInput: {
    ...TYPOGRAPHY.black,
    flex: 1,
    fontSize: 22,
    color: '#0F172A',
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 6,
  },
  presetLabel: {
    ...TYPOGRAPHY.bold,
    color: '#64748B',
    fontSize: 12,
    marginBottom: 8,
  },
  topUpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 14,
  },
  topUpPill: {
    width: '48%',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topUpPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  topUpPillText: {
    ...TYPOGRAPHY.black,
    color: '#EA580C',
    fontSize: 16,
  },
  topUpPillTextActive: {
    ...TYPOGRAPHY.black,
    color: '#FFFFFF',
  },
  zeroFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 10,
  },
  topUpNote: {
    ...TYPOGRAPHY.medium,
    color: '#059669',
    fontSize: 11,
    textAlign: 'center',
    flexShrink: 1,
  },
  confirmTopUpBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmTopUpBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmTopUpBtnText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 14,
  },
  modalSubDesc: {
    ...TYPOGRAPHY.regular,
    color: '#64748B',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  preferencesList: {
    gap: 8,
    marginBottom: 16,
  },
  prefItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  prefItemActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  prefText: {
    ...TYPOGRAPHY.medium,
    color: '#475569',
    fontSize: 12,
    flex: 1,
  },
  prefTextActive: {
    ...TYPOGRAPHY.extraBold,
    color: '#C2410C',
  },
  prefCheck: {
    ...TYPOGRAPHY.black,
    fontSize: 14,
    color: '#EA580C',
    marginLeft: 8,
  },
  modalPrimaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    ...TYPOGRAPHY.extraBold,
    color: '#FFFFFF',
    fontSize: 13,
  },
  favoritesList: {
    gap: 10,
  },
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  favEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  favInfo: {
    flex: 1,
  },
  favName: {
    ...TYPOGRAPHY.extraBold,
    color: '#0F172A',
    fontSize: 12,
  },
  favStall: {
    ...TYPOGRAPHY.regular,
    color: '#64748B',
    fontSize: 10,
  },
  favPrice: {
    ...TYPOGRAPHY.black,
    color: '#EA580C',
    fontSize: 12,
  },
  favOrderBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  favOrderText: {
    ...TYPOGRAPHY.extraBold,
    color: '#FFFFFF',
    fontSize: 11,
  },
  bldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bldItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF7ED',
  },
  bldName: {
    ...TYPOGRAPHY.bold,
    color: '#0F172A',
    fontSize: 13,
  },
  bldZone: {
    ...TYPOGRAPHY.regular,
    color: '#64748B',
    fontSize: 11,
  },
  checkMark: {
    ...TYPOGRAPHY.black,
    color: COLORS.primary,
    fontSize: 16,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  uncheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginLeft: 8,
  },
  favIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Edit Profile Modal Styles
  editProfileModalCard: {
    maxHeight: '90%',
    paddingBottom: 16,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  editProfileScrollView: {
    maxHeight: 520,
  },
  headerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  editAvatarSection: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  editAvatarTouch: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  editAvatarFrame: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: '#FED7AA',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 46,
  },
  editAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FED7AA',
  },
  editAvatarCameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  avatarButtonRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  choosePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  choosePhotoBtnText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.primary,
    fontSize: 12,
  },
  removePhotoBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  removePhotoBtnText: {
    ...TYPOGRAPHY.bold,
    color: '#DC2626',
    fontSize: 12,
  },
  avatarHelperText: {
    ...TYPOGRAPHY.regular,
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 6,
  },
  editErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  editErrorText: {
    ...TYPOGRAPHY.medium,
    color: '#EF4444',
    fontSize: 12,
    flex: 1,
  },
  formSection: {
    gap: 14,
    marginBottom: 20,
  },
  formFieldGroup: {
    gap: 6,
  },
  formLabel: {
    ...TYPOGRAPHY.bold,
    color: '#334155',
    fontSize: 13,
  },
  requiredStar: {
    color: '#EF4444',
  },
  inputWithIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  inputLeftIcon: {
    marginRight: 8,
  },
  formTextInput: {
    ...TYPOGRAPHY.regular,
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    paddingVertical: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
  },
  genderChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: COLORS.primary,
  },
  genderChipEmoji: {
    fontSize: 14,
  },
  genderChipText: {
    ...TYPOGRAPHY.medium,
    color: '#64748B',
    fontSize: 13,
  },
  genderChipTextActive: {
    ...TYPOGRAPHY.extraBold,
    color: COLORS.primary,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelEditBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditBtnText: {
    ...TYPOGRAPHY.bold,
    color: '#64748B',
    fontSize: 14,
  },
  saveProfileBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveProfileBtnDisabled: {
    opacity: 0.6,
  },
  saveProfileBtnText: {
    ...TYPOGRAPHY.extraBold,
    color: '#FFFFFF',
    fontSize: 14,
  },
});

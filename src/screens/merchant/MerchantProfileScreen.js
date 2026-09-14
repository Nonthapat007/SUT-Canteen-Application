import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Icon from '../../components/common/Icon';
import { getPermanentImageUri } from '../../utils/imageUtils';

export default function MerchantProfileScreen({
  shopName = 'ร้านค้าของคุณ',
  currentStall = null,
  currentUser = null,
  onOpenCreateStall,
  onUpdateStallImage,
  onLogout,
}) {
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  const handlePickStallImage = async () => {
    if (!currentStall) {
      Alert.alert('แจ้งเตือน', 'กรุณาเปิดร้านค้าก่อนจึงจะสามารถเปลี่ยนรูปร้านค้าได้');
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('ต้องการการอนุญาต', 'กรุณาอนุญาตให้แอปเข้าถึงรูปภาพเพื่อเปลี่ยนรูปร้านค้า');
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
        const pickedUri = await getPermanentImageUri(result.assets[0]);
        setIsUpdatingImage(true);
        if (typeof onUpdateStallImage === 'function') {
          const res = await onUpdateStallImage(currentStall.id, pickedUri);
          setIsUpdatingImage(false);
          if (res?.error) {
            Alert.alert('แจ้งเตือน', res.error);
            return;
          }
          Alert.alert('สำเร็จ', 'อัปเดตรูปร้านค้าเรียบร้อยแล้ว!');
        }
      }
    } catch (err) {
      console.warn('Pick stall image error:', err);
      setIsUpdatingImage(false);
      Alert.alert('แจ้งเตือน', 'ไม่สามารถเลือกรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleWithdraw = () => {
    if (!currentStall) {
      Alert.alert('แจ้งเตือน', 'กรุณาเปิดร้านค้าก่อนทำรายการถอนเงิน');
      return;
    }
    Alert.alert('ถอนเงินสำเร็จ', 'ระบบส่งคำขอถอนเงินเข้าบัญชีพร้อมเพย์เรียบร้อยแล้ว (Zero-GP ไม่มีค่าธรรมเนียมสำหรับร้านค้า มทส.)');
  };

  const displayName = currentStall
    ? currentStall.thaiName || currentStall.name
    : (currentUser?.fullName ? `ร้านของ ${currentUser.fullName}` : 'ยังไม่มีร้านค้าในระบบ');

  const displayCategory = currentStall
    ? `${currentStall.category || 'อาหารตามสั่ง'} • รอประมาณ ~${currentStall.waitMinutes || 5} นาที`
    : `ผู้ประกอบการ: ${currentUser?.fullName || 'แม่ค้า มทส.'} (${currentUser?.email || ''})`;

  const menuItems = [
    { id: '1', title: 'เปิดร้านค้าใหม่ (เพิ่มสาขา/ร้าน)', iconName: 'store', iconColor: COLORS.primary, bg: COLORS.primaryLight, action: onOpenCreateStall },
    { id: '2', title: 'วิเคราะห์ยอดขาย', iconName: 'chart', iconColor: COLORS.primary, bg: '#FFF7ED' },
    { id: '3', title: 'ตั้งค่าร้านค้า', iconName: 'settings', iconColor: '#0284C7', bg: '#F0F9FF' },
    { id: '4', title: 'ศูนย์ช่วยเหลือ & ติดต่อ มทส.', iconName: 'help', iconColor: '#EA580C', bg: '#FFF7ED' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header matching Image 4 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>โปรไฟล์ร้านค้า</Text>
      </View>

      <View style={styles.content}>
        {/* Top Shop Profile Card */}
        <View style={styles.shopCard}>
          {/* Circular Store Icon with Pencil Edit Badge */}
          <TouchableOpacity
            style={styles.storeAvatarContainer}
            onPress={handlePickStallImage}
            activeOpacity={0.85}
          >
            <View style={styles.storeIconCircle}>
              {currentStall?.imageUrl ? (
                <Image source={{ uri: currentStall.imageUrl }} style={styles.storeAvatarImg} />
              ) : (
                <Icon name="store" size={32} color={COLORS.primary} strokeWidth={2} />
              )}
            </View>
            <View style={styles.storeEditBadge}>
              <Icon name="pencil" size={12} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          <Text style={styles.shopName}>{displayName}</Text>
          <Text style={styles.shopSub}>
            {displayCategory}
          </Text>

          {/* Edit photo button */}
          {currentStall && (
            <TouchableOpacity
              style={styles.changePhotoPill}
              onPress={handlePickStallImage}
              activeOpacity={0.7}
            >
              <Icon name="camera" size={12} color={COLORS.primary} strokeWidth={2.2} />
              <Text style={styles.changePhotoText}>เปลี่ยนรูปร้านค้า</Text>
            </TouchableOpacity>
          )}

          {/* Action: Open Create Stall if no stall or to add new */}
          {onOpenCreateStall && (
            <TouchableOpacity style={styles.editBtn} onPress={onOpenCreateStall} activeOpacity={0.8}>
              <Icon name="plus" size={14} color={COLORS.primary} strokeWidth={2.5} style={{ marginRight: 6 }} />
              <Text style={styles.editBtnText}>
                {currentStall ? 'เปิดร้านค้าใหม่อีกร้าน' : 'ลงทะเบียนเปิดร้านค้า'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Stats Box (ยอดขายวันนี้ / ออเดอร์ทั้งหมด) */}
          <View style={styles.statsBox}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>ยอดขายวันนี้</Text>
              <Text style={styles.statSales}>฿0</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>ออเดอร์ทั้งหมด</Text>
              <Text style={styles.statOrders}>0</Text>
            </View>
          </View>
        </View>

        {/* Big Orange Action: ถอนเงินเข้าพร้อมเพย์ */}
        <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw} activeOpacity={0.85}>
          <Icon name="wallet" size={20} color="#FFFFFF" strokeWidth={2} style={{ marginRight: 8 }} />
          <Text style={styles.withdrawText}>ถอนเงินเข้าพร้อมเพย์ (PromptPay)</Text>
        </TouchableOpacity>

        {/* Settings Menu Card */}
        <View style={styles.menuCard}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuRow}
              onPress={item.action || null}
              activeOpacity={0.7}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: item.bg }]}>
                  <Icon name={item.iconName} size={18} color={item.iconColor} strokeWidth={2} />
                </View>
                <Text style={styles.menuRowTitle}>{item.title}</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#94A3B8" strokeWidth={2.5} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
          <Icon name="logout" size={17} color="#E11D48" strokeWidth={2.2} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>ออกจากระบบ (Log Out)</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    ...TYPOGRAPHY.black,
    color: COLORS.textPrimary,
  },
  content: {
    padding: 20,
  },
  shopCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  storeAvatarContainer: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  storeIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 94, 58, 0.3)',
    overflow: 'hidden',
  },
  storeAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  storeEditBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: COLORS.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  changePhotoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 14,
    marginTop: -4,
  },
  changePhotoText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  shopName: {
    fontSize: 18,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  shopSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 14,
    textAlign: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 16,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statSales: {
    fontSize: 18,
    ...TYPOGRAPHY.black,
    color: COLORS.primary,
  },
  statOrders: {
    fontSize: 18,
    ...TYPOGRAPHY.black,
    color: COLORS.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  withdrawBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  withdrawText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  switchAppBtn: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 12,
  },
  switchAppText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#FFF1F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  logoutText: {
    color: '#E11D48',
    fontSize: 14,
    fontWeight: '700',
  },
});

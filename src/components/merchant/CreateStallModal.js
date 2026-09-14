import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Icon from '../common/Icon';
import dbService from '../../services/dbService';

const PRESET_IMAGES = [
  {
    label: 'อาหารตามสั่ง',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'ก๋วยเตี๋ยว',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'ข้าวมันไก่',
    url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'เครื่องดื่ม',
    url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80',
  },
];

const CANTEEN_OPTIONS = [
  { id: 'canteen-5', name: 'โรงอาหารกาสะลองคำ' },
  { id: 'canteen-1', name: 'โรงอาหารพราวแสดทอง' },
  { id: 'canteen-3', name: 'โรงอาหารครัวท่านท้าว' },
  { id: 'canteen-6', name: 'โรงอาหารดอนตะวัน' },
  { id: 'canteen-4', name: 'โรงอาหารเด่นทองกวาว' },
];

const CATEGORY_OPTIONS = [
  'อาหารตามสั่ง',
  'ก๋วยเตี๋ยว',
  'ข้าวแกง',
  'เครื่องดื่ม/สมูทตี้',
  'ของทานเล่น',
];

export default function CreateStallModal({
  visible,
  onClose,
  onSuccess,
  currentUser = null,
}) {
  const [thaiName, setThaiName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [selectedCanteenId, setSelectedCanteenId] = useState('canteen-5');
  const [selectedCategory, setSelectedCategory] = useState('อาหารตามสั่ง');
  const [waitMinutes, setWaitMinutes] = useState('5');
  const [ownerPhone, setOwnerPhone] = useState(currentUser?.studentId || '');
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!thaiName.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อร้านอาหาร (ภาษาไทย)');
      return;
    }

    try {
      setLoading(true);
      const newStall = await dbService.createStall({
        canteenId: selectedCanteenId,
        name: englishName.trim() || thaiName.trim(),
        thaiName: thaiName.trim(),
        category: selectedCategory,
        imageUrl: selectedImage,
        waitMinutes: parseInt(waitMinutes, 10) || 5,
        ownerPhone: (currentUser?.email || currentUser?.studentId || ownerPhone || 'merchant@sut.ac.th').trim(),
      });

      Alert.alert('สำเร็จ', `สร้างร้านค้า "${thaiName}" สำเร็จเรียบร้อยแล้ว!`);
      if (onSuccess) {
        onSuccess(newStall);
      }
      setThaiName('');
      setEnglishName('');
      onClose();
    } catch (err) {
      console.error('Error in CreateStallModal:', err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกร้านค้าได้: ' + (err.message || 'โปรดลองอีกครั้ง'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>เปิดร้านค้าใหม่</Text>
              <Text style={styles.subtitle}>กรอกข้อมูลร้านเพื่อเริ่มขายอาหารใน มทส.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="close" size={20} color={COLORS.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Field: Thai Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ชื่อร้านอาหาร (ภาษาไทย) *</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น ข้าวมันไก่เด็กหอ มทส."
                placeholderTextColor={COLORS.textMuted}
                value={thaiName}
                onChangeText={setThaiName}
              />
            </View>

            {/* Field: English Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ชื่อร้านภาษาอังกฤษ (ไม่บังคับ)</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น Dek Hor Chicken Rice"
                placeholderTextColor={COLORS.textMuted}
                value={englishName}
                onChangeText={setEnglishName}
              />
            </View>

            {/* Field: Canteen Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>เลือกโรงอาหารที่ตั้งร้าน *</Text>
              <View style={styles.chipRow}>
                {CANTEEN_OPTIONS.map((canteen) => {
                  const isSelected = selectedCanteenId === canteen.id;
                  return (
                    <TouchableOpacity
                      key={canteen.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setSelectedCanteenId(canteen.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {canteen.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Field: Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>หมวดหมู่อาหาร</Text>
              <View style={styles.chipRow}>
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setSelectedCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Field: Wait time & Phone */}
            <View style={styles.rowTwoCols}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>เวลาทำเฉลี่ย (นาที)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor={COLORS.textMuted}
                  value={waitMinutes}
                  onChangeText={setWaitMinutes}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1.4 }]}>
                <Text style={styles.label}>เบอร์โทรติดต่อ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="081-xxx-xxxx"
                  placeholderTextColor={COLORS.textMuted}
                  value={ownerPhone}
                  onChangeText={setOwnerPhone}
                />
              </View>
            </View>

            {/* Field: Cover Image presets */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>เลือกรูปร้านค้า</Text>
              <View style={styles.imagePresetGrid}>
                {PRESET_IMAGES.map((img, idx) => {
                  const isSelected = selectedImage === img.url;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.imagePresetCard, isSelected && styles.imagePresetCardActive]}
                      onPress={() => setSelectedImage(img.url)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: img.url }} style={styles.presetImg} />
                      <Text style={styles.presetLabel}>{img.label}</Text>
                      {isSelected && (
                        <View style={styles.checkmarkBadge}>
                          <Icon name="check" size={12} color={COLORS.textWhite} strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textWhite} />
              ) : (
                <>
                  <Icon name="store" size={18} color={COLORS.textWhite} strokeWidth={2} style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>บันทึกและเปิดร้านทันที</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 19,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  imagePresetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imagePresetCard: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.surfaceSubtle,
  },
  imagePresetCardActive: {
    borderColor: COLORS.primary,
  },
  presetImg: {
    width: '100%',
    height: 75,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 4,
    color: COLORS.textPrimary,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
});

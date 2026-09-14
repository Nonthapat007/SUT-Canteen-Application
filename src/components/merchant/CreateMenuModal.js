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
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Icon from '../common/Icon';
import ModernSwitch from '../common/ModernSwitch';
import dbService, { formatMenuDescription, getDefaultMenuOptions } from '../../services/dbService';
import { getPermanentImageUri } from '../../utils/imageUtils';

const QUICK_TEMPLATES = [
  { name: 'ไข่ดาว', price: 10 },
  { name: 'ไข่เจียว', price: 10 },
  { name: 'พิเศษ', price: 10 },
  { name: 'เส้นเล็ก', price: 0 },
  { name: 'เส้นหมี่', price: 0 },
  { name: 'บะหมี่', price: 0 },
  { name: 'ไม่ใส่ผัก/ถั่ว', price: 0 },
  { name: 'เผ็ดน้อย', price: 0 },
  { name: 'เผ็ดปกติ', price: 0 },
  { name: 'เผ็ดจัดจ้าน 🔥', price: 0 },
  { name: 'เพิ่มหมูกรอบ', price: 15 },
  { name: 'เพิ่มลูกชิ้น', price: 10 },
  { name: 'หวานน้อย', price: 0 },
  { name: 'ไม่หวาน (0%)', price: 0 },
];

export default function CreateMenuModal({ visible, stallId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('45');
  const [prepTime, setPrepTime] = useState('5');
  const [desc, setDesc] = useState('');
  const [options, setOptions] = useState([]);
  const [isPopular, setIsPopular] = useState(false);
  const [isGrabAndGo, setIsGrabAndGo] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTemplate = (tpl) => {
    const newOpt = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: tpl.name,
      price: tpl.price,
    };
    setOptions((prev) => [...prev, newOpt]);
  };

  const handleAddCustomOption = () => {
    const newOpt = {
      id: `opt_${Date.now()}`,
      name: '',
      price: 0,
    };
    setOptions((prev) => [...prev, newOpt]);
  };

  const handleUpdateOption = (index, field, value) => {
    setOptions((prev) => {
      const copy = [...prev];
      if (field === 'price') {
        const cleanVal = parseInt(String(value).replace(/[^0-9]/g, ''), 10);
        copy[index] = { ...copy[index], price: isNaN(cleanVal) ? 0 : cleanVal };
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const handleRemoveOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePickCustomImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('ต้องการการอนุญาต', 'กรุณาอนุญาตให้แอปเข้าถึงรูปภาพในเครื่องเพื่อเลือกรูปเมนู');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.25,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const permanentUri = await getPermanentImageUri(result.assets[0]);
        setSelectedImage(permanentUri);
      }
    } catch (err) {
      console.warn('Pick custom menu image error:', err);
      Alert.alert('แจ้งเตือน', 'ไม่สามารถเลือกรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อเมนูอาหาร');
      return;
    }
    if (!price.trim() || isNaN(price)) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกราคาที่ถูกต้อง');
      return;
    }
    if (!stallId) {
      Alert.alert('แจ้งเตือน', 'กรุณาเลือกหรือสร้างร้านค้าก่อนเพิ่มเมนู');
      return;
    }

    try {
      setLoading(true);
      const validOptions = options
        .filter((o) => o && o.name && o.name.trim().length > 0)
        .map((o) => ({
          id: o.id || `opt_${Math.random()}`,
          name: o.name.trim(),
          price: Number(o.price) || 0,
        }));
      const finalDesc = formatMenuDescription(desc.trim(), validOptions, isGrabAndGo);

      const newMenu = await dbService.createMenu({
        stallId,
        name: name.trim(),
        price: parseFloat(price),
        prepTime: parseInt(prepTime, 10) || 5,
        description: finalDesc,
        options: validOptions,
        imageUrl: selectedImage || '',
        isPopular,
        isGrabAndGo,
      });

      Alert.alert('สำเร็จ', `เพิ่มเมนู "${name}" สำเร็จเรียบร้อยแล้ว!`);
      // Reset form
      setName('');
      setPrice('45');
      setPrepTime('5');
      setDesc('');
      setOptions([]);
      setIsPopular(false);
      setIsGrabAndGo(false);
      setSelectedImage('');

      if (onSuccess) {
        onSuccess({
          ...newMenu,
          desc: desc.trim(),
          description: finalDesc,
          options: validOptions,
          isPopular,
          isGrabAndGo,
        });
      }
      onClose();
    } catch (err) {
      console.error('Error creating menu:', err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มเมนูได้: ' + (err.message || 'โปรดลองอีกครั้ง'));
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
              <Text style={styles.title}>เพิ่มเมนูอาหารใหม่</Text>
              <Text style={styles.subtitle}>เพิ่มรายการอาหารที่จะแสดงในหน้าจอนักศึกษา</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="close" size={20} color={COLORS.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ชื่อเมนูอาหาร *</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น กะเพราหมูกรอบไข่ดาว"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Price and Prep Time */}
            <View style={styles.rowTwoCols}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>ราคา (บาท) *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="45"
                  placeholderTextColor={COLORS.textMuted}
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>เวลาปรุง (นาที)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor={COLORS.textMuted}
                  value={prepTime}
                  onChangeText={setPrepTime}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>คำอธิบายเมนู</Text>
              <TextInput
                style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
                placeholder="เช่น รสชาติจัดจ้าน หมูกรอบทอดใหม่ทุกวัน"
                placeholderTextColor={COLORS.textMuted}
                value={desc}
                onChangeText={setDesc}
                multiline
              />
            </View>

            {/* Toppings & Custom Options (แม่ค้ากำหนดเองได้ กดเพิ่ม-ลด ใส่ราคาได้หรือฟรี) */}
            <View style={styles.optionsContainer}>
              <View style={styles.optionsHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16 }}>🍲</Text>
                  <Text style={styles.optionsTitle}>ท็อปปิ้ง & ตัวเลือกเพิ่มเติม</Text>
                </View>
                <Text style={styles.optionsCountTag}>{options.length} ตัวเลือก</Text>
              </View>
              <Text style={styles.optionsSubtitle}>
                แม่ค้ากำหนดตัวเลือกให้ลูกค้าเลือกได้ เช่น ไข่ดาว, เส้น, ความเผ็ด (ใส่ราคาหรือใส่ 0 เพื่อให้ฟรี)
              </Text>

              {/* Quick Template Chips */}
              <Text style={styles.templateSectionLabel}>⚡ แตะเพื่อเพิ่มเทมเพลตด่วน:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
                {QUICK_TEMPLATES.map((tpl, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.templateChip}
                    onPress={() => handleAddTemplate(tpl)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.templateChipText}>
                      + {tpl.name} {tpl.price > 0 ? `(+${tpl.price}฿)` : '(ฟรี)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Options List */}
              {options.length === 0 ? (
                <View style={styles.emptyOptionsBox}>
                  <Text style={styles.emptyOptionsText}>
                    ยังไม่มีตัวเลือกเพิ่มเติมสำหรับเมนูนี้ (แตะเทมเพลตด่วนด้านบน หรือกด "+ เพิ่มตัวเลือก" ด้านล่าง)
                  </Text>
                </View>
              ) : (
                options.map((opt, idx) => (
                  <View key={opt.id || idx} style={styles.optionRow}>
                    <TextInput
                      style={styles.optionNameInput}
                      placeholder="ชื่อตัวเลือก เช่น ไข่ดาว, เส้นเล็ก"
                      placeholderTextColor={COLORS.textMuted}
                      value={opt.name}
                      onChangeText={(val) => handleUpdateOption(idx, 'name', val)}
                    />
                    <View style={styles.optionPriceInputWrapper}>
                      <Text style={styles.optionPricePrefix}>+฿</Text>
                      <TextInput
                        style={styles.optionPriceInput}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        value={opt.price === 0 ? '0' : String(opt.price || '')}
                        onChangeText={(val) => handleUpdateOption(idx, 'price', val)}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.deleteOptionBtn}
                      onPress={() => handleRemoveOption(idx)}
                      activeOpacity={0.7}
                    >
                      <Icon name="trash" size={14} color="#DC2626" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Add Custom Option Button */}
              <TouchableOpacity
                style={styles.addOptionBtn}
                onPress={handleAddCustomOption}
                activeOpacity={0.8}
              >
                <Icon name="plus" size={14} color={COLORS.primary} strokeWidth={2.5} />
                <Text style={styles.addOptionBtnText}>+ เพิ่มตัวเลือกกำหนดเอง</Text>
              </TouchableOpacity>
            </View>

            {/* Toggles Card: Popular & Grab & Go */}
            <View style={styles.togglesCard}>
              {/* Popular Switch */}
              <TouchableOpacity
                style={styles.switchRowInner}
                onPress={() => setIsPopular(!isPopular)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.switchTitle}>🌟 เมนูแนะนำ (Popular Badge)</Text>
                    {isPopular && (
                      <View style={styles.activePillOrange}>
                        <Text style={styles.activePillTextOrange}>เปิดอยู่</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.switchSub}>แสดงป้ายสีส้ม และขึ้นในเซกชันเมนูแนะนำหน้าแรก</Text>
                </View>
                <ModernSwitch
                  value={isPopular}
                  onValueChange={setIsPopular}
                  activeTrackColor={COLORS.primary}
                  size="small"
                />
              </TouchableOpacity>

              <View style={styles.toggleDivider} />

              {/* Grab & Go Switch */}
              <TouchableOpacity
                style={styles.switchRowInner}
                onPress={() => setIsGrabAndGo(!isGrabAndGo)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.switchTitle}>⚡ Grab & Go (Fast-Lane 0 นาที)</Text>
                    {isGrabAndGo && (
                      <View style={styles.activePillGreen}>
                        <Text style={styles.activePillTextGreen}>เปิดอยู่</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.switchSub}>ปรุงเสร็จวางหน้าร้าน นศ. สแกนหยิบทันทีไม่ต้องรอคิว</Text>
                </View>
                <ModernSwitch
                  value={isGrabAndGo}
                  onValueChange={setIsGrabAndGo}
                  activeTrackColor="#10B981"
                  size="small"
                />
              </TouchableOpacity>
            </View>

            {/* Food Image Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.imageLabelRow}>
                <Text style={styles.label}>รูปภาพอาหาร</Text>
                <Text style={styles.optionalNote}>(ไม่ใส่รูป ระบบจะแสดงเป็น NO IMAGE)</Text>
              </View>

              {/* Custom Image Box / Preview */}
              <View style={styles.customImageContainer}>
                {selectedImage ? (
                  <View style={styles.previewCard}>
                    <Image source={{ uri: selectedImage }} style={styles.selectedFoodPreview} />
                    <View style={styles.previewBadgeRow}>
                      <View style={styles.customPhotoTag}>
                        <Icon name="check" size={12} color="#FFFFFF" strokeWidth={3} />
                        <Text style={styles.customPhotoTagText}>เลือกรูปภาพแล้ว</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => setSelectedImage('')}
                        activeOpacity={0.8}
                      >
                        <Icon name="close" size={13} color="#DC2626" strokeWidth={2.5} />
                        <Text style={styles.removeImageText}>ลบรูป / ให้เป็น NO IMAGE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.noImagePlaceholderCard}
                    onPress={handlePickCustomImage}
                    activeOpacity={0.85}
                  >
                    <View style={styles.noImageBadge}>
                      <Text style={styles.noImageBadgeText}>NO IMAGE</Text>
                    </View>
                    <View style={styles.noImageIconCircle}>
                      <Icon name="camera" size={28} color="#94A3B8" strokeWidth={1.8} />
                    </View>
                    <Text style={styles.noImageTitle}>ยังไม่ได้เลือกรูปภาพอาหาร</Text>
                    <Text style={styles.noImageSub}>
                      ระบบจะแสดงเป็นขาวดำเทา NO IMAGE ให้ลูกค้าเห็น จนกว่าจะใส่รูป (สามารถเพิ่มทีหลังได้)
                    </Text>
                    <Text style={styles.noImageActionHint}>แตะเพื่อเลือกรูปภาพจากเครื่อง</Text>
                  </TouchableOpacity>
                )}

                {/* Device Image Picker Button */}
                <TouchableOpacity
                  style={styles.pickFromDeviceBtn}
                  onPress={handlePickCustomImage}
                  activeOpacity={0.85}
                >
                  <Icon name="camera" size={16} color={COLORS.primary} strokeWidth={2.2} />
                  <Text style={styles.pickFromDeviceText}>
                    {selectedImage ? '📸 เปลี่ยนรูปภาพจากในเครื่อง' : '📸 เลือกรูปภาพจากเครื่อง (เลือกรูปเอง)'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer */}
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
                  <Icon name="plus" size={18} color={COLORS.textWhite} strokeWidth={2.5} style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>เพิ่มเมนูเข้าสู่ร้าน</Text>
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
    maxHeight: '88%',
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  togglesCard: {
    backgroundColor: COLORS.surfaceSubtle,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  switchSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activePillOrange: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activePillTextOrange: {
    color: '#EA580C',
    fontSize: 10,
    ...TYPOGRAPHY.bold,
  },
  activePillGreen: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activePillTextGreen: {
    color: '#059669',
    fontSize: 10,
    ...TYPOGRAPHY.bold,
  },
  imageLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionalNote: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  customImageContainer: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 14,
  },
  previewCard: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  selectedFoodPreview: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  customPhotoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  customPhotoTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  removeImageText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
  },
  noImagePlaceholderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    marginBottom: 12,
  },
  noImageBadge: {
    backgroundColor: '#64748B',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  noImageBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    ...TYPOGRAPHY.bold,
    letterSpacing: 1,
  },
  noImageIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  noImageTitle: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  noImageSub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 8,
  },
  noImageActionHint: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  pickFromDeviceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  pickFromDeviceText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  // Toppings & Options Editor Styles
  optionsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  optionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionsTitle: {
    ...TYPOGRAPHY.bold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  optionsCountTag: {
    ...TYPOGRAPHY.semiBold,
    fontSize: 11,
    color: COLORS.primary,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  optionsSubtitle: {
    ...TYPOGRAPHY.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
    lineHeight: 16,
  },
  templateSectionLabel: {
    ...TYPOGRAPHY.semiBold,
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  templatesScroll: {
    marginBottom: 12,
  },
  templateChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  templateChipText: {
    ...TYPOGRAPHY.medium,
    fontSize: 12,
    color: COLORS.primary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionNameInput: {
    flex: 1,
    height: 38,
    paddingHorizontal: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.regular,
  },
  optionPriceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 38,
    width: 80,
  },
  optionPricePrefix: {
    ...TYPOGRAPHY.bold,
    fontSize: 11,
    color: '#64748B',
    marginRight: 2,
  },
  optionPriceInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    padding: 0,
    ...TYPOGRAPHY.bold,
  },
  deleteOptionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: '#FFF7ED',
    marginTop: 4,
    gap: 6,
  },
  addOptionBtnText: {
    ...TYPOGRAPHY.semiBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  emptyOptionsBox: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  emptyOptionsText: {
    ...TYPOGRAPHY.regular,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
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

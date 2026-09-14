import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';
import { parseMenuDescription, getDefaultMenuOptions } from '../services/dbService';

export default function FoodItemModal({
  visible,
  onClose,
  stall,
  menuItem,
  onProceedToSync,
}) {
  if (!visible || !menuItem || !stall) return null;

  // Extract custom options and clean description
  const parsed = parseMenuDescription(menuItem.description || menuItem.desc, menuItem.name);
  const availableOptions =
    Array.isArray(menuItem.options)
      ? menuItem.options
      : Array.isArray(parsed.options)
      ? parsed.options
      : [];

  const cleanDescription = parsed.cleanDescription || menuItem.desc || menuItem.description;

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [specialNote, setSpecialNote] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Reset states whenever modal opens for a menu item
  useEffect(() => {
    if (visible) {
      setSelectedOptions([]);
      setSpecialNote('');
      setQuantity(1);
    }
  }, [visible, menuItem?.id]);

  const toggleOption = (opt) => {
    setSelectedOptions((prev) => {
      const exists = prev.some((o) => o.name === opt.name);
      if (exists) {
        return prev.filter((o) => o.name !== opt.name);
      } else {
        return [...prev, opt];
      }
    });
  };

  // Compute final price
  const basePrice = Number(menuItem.price) || 0;
  const additionalCost = selectedOptions.reduce((sum, opt) => sum + (Number(opt.price) || 0), 0);
  const finalPrice = basePrice + additionalCost;
  const totalPrice = finalPrice * quantity;

  const handleProceed = () => {
    const customList = selectedOptions.map((opt) => {
      const priceNum = Number(opt.price) || 0;
      return priceNum > 0 ? `${opt.name} (+${priceNum}฿)` : `${opt.name} (ฟรี)`;
    });

    onProceedToSync({
      menuItem: { ...menuItem, price: finalPrice },
      customOptions: customList,
      specialNote: specialNote.trim(),
      quantity,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header styled like Grab */}
          <View style={styles.grabHeader}>
            <TouchableOpacity onPress={onClose} style={styles.grabCloseBtn} activeOpacity={0.7}>
              <Icon name="close" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.grabHeaderTitle} numberOfLines={1}>
              {menuItem.name}
            </Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView style={styles.optionsScroll} showsVerticalScrollIndicator={false}>
            {/* Stall & Menu Info */}
            <View style={styles.menuMetaBox}>
              <Text style={styles.stallName}>🏪 {stall.thaiName || stall.name}</Text>
              {!!cleanDescription && (
                <Text style={styles.menuDesc} numberOfLines={2}>
                  {cleanDescription}
                </Text>
              )}
              <Text style={styles.basePriceText}>เริ่มต้น ฿{basePrice}</Text>
            </View>

            {/* Toppings / Options Section (only render if there are available options) */}
            {availableOptions.length > 0 && (
              <View style={styles.optionSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>ท็อปปิ้งและตัวเลือกเสริม</Text>
                  <Text style={styles.sectionSubTitle}>เลือกได้ตามใจชอบ</Text>
                </View>

                <View style={styles.optionsList}>
                  {availableOptions.map((opt, idx) => {
                    const isSelected = selectedOptions.some((o) => o.name === opt.name);
                    const priceNum = Number(opt.price) || 0;

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.optionRow}
                        onPress={() => toggleOption(opt)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.optionLeft}>
                          <View style={[styles.grabCheckbox, isSelected && styles.grabCheckboxActive]}>
                            {isSelected && <Text style={styles.checkmark}>✓</Text>}
                          </View>
                          <Text style={[styles.optionName, isSelected && styles.optionNameActive]}>
                            {opt.name}
                          </Text>
                        </View>
                        <Text style={styles.optionPriceText}>
                          {priceNum > 0 ? `+${priceNum}` : 'ฟรี'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* วิธีดำเนินการกรณีของหมด (Grab style) */}
            <View style={styles.outOfStockRow}>
              <Text style={styles.outOfStockTitle}>วิธีดำเนินการกรณีของหมด</Text>
              <View style={styles.outOfStockAction}>
                <Text style={styles.outOfStockText}>ติดต่อฉันเพื่อหาสินค้าทดแทน</Text>
                <Text style={styles.chevronRight}>›</Text>
              </View>
            </View>

            {/* หมายเหตุถึงร้านอาหาร (Grab style) */}
            <View style={styles.noteSection}>
              <View style={styles.noteHeaderRow}>
                <Text style={styles.noteTitle}>หมายเหตุถึงร้านอาหาร</Text>
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalBadgeText}>ไม่จำเป็นต้องระบุ</Text>
                </View>
              </View>
              <TextInput
                style={styles.grabNoteInput}
                placeholder="ระบุรายละเอียดคำขอ (ขึ้นอยู่กับดุลยพินิจของร้าน)"
                placeholderTextColor="#94A3B8"
                value={specialNote}
                onChangeText={(t) => setSpecialNote(t.slice(0, 120))}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                maxLength={120}
              />
            </View>

            {/* Centered Stepper (Grab Style - Circled in User Image) */}
            <View style={styles.grabStepperContainer}>
              <TouchableOpacity
                style={[
                  styles.grabStepperBtn,
                  quantity <= 1 ? styles.grabStepperBtnDisabled : styles.grabStepperBtnActive,
                ]}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                activeOpacity={0.7}
              >
                <Icon
                  name="minus"
                  size={16}
                  color={quantity <= 1 ? '#FDBA74' : '#EA580C'}
                  strokeWidth={3}
                />
              </TouchableOpacity>

              <Text style={styles.grabQuantityText}>{quantity}</Text>

              <TouchableOpacity
                style={styles.grabStepperBtnPlus}
                onPress={() => setQuantity((q) => Math.min(99, q + 1))}
                activeOpacity={0.7}
              >
                <Icon name="plus" size={16} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Action Button (Grab Pill Button) */}
          <View style={styles.grabFooter}>
            <TouchableOpacity
              style={styles.grabActionBtn}
              onPress={handleProceed}
              activeOpacity={0.88}
            >
              <Text style={styles.grabActionBtnText}>
                ต่อไป: ตั้งเวลา Sync - ฿{totalPrice}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  grabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  grabCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grabHeaderTitle: {
    ...TYPOGRAPHY.bold,
    fontSize: 17,
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 32,
  },
  optionsScroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  menuMetaBox: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stallName: {
    ...TYPOGRAPHY.medium,
    color: '#64748B',
    fontSize: 13,
    marginBottom: 4,
  },
  menuDesc: {
    ...TYPOGRAPHY.regular,
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  basePriceText: {
    ...TYPOGRAPHY.bold,
    fontSize: 16,
    color: '#EA580C',
  },
  optionSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bold,
    color: '#0F172A',
    fontSize: 15,
  },
  sectionSubTitle: {
    ...TYPOGRAPHY.regular,
    color: '#94A3B8',
    fontSize: 12,
  },
  emptyOptionsText: {
    ...TYPOGRAPHY.regular,
    color: '#94A3B8',
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  optionsList: {
    gap: 2,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  grabCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  grabCheckboxActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: -1,
  },
  optionName: {
    ...TYPOGRAPHY.medium,
    color: '#334155',
    fontSize: 15,
    flex: 1,
  },
  optionNameActive: {
    ...TYPOGRAPHY.bold,
    color: '#0F172A',
  },
  optionPriceText: {
    ...TYPOGRAPHY.bold,
    color: '#0F172A',
    fontSize: 14,
  },
  outOfStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  outOfStockTitle: {
    ...TYPOGRAPHY.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  outOfStockAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  outOfStockText: {
    ...TYPOGRAPHY.regular,
    fontSize: 13,
    color: '#64748B',
  },
  chevronRight: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: -1,
  },
  noteSection: {
    marginBottom: 8,
  },
  noteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    ...TYPOGRAPHY.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  optionalBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  optionalBadgeText: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: '#64748B',
  },
  grabNoteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    minHeight: 64,
    ...TYPOGRAPHY.regular,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  grabStepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  grabStepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grabStepperBtnDisabled: {
    backgroundColor: '#FFF7ED',
  },
  grabStepperBtnActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  grabQuantityText: {
    ...TYPOGRAPHY.black,
    fontSize: 20,
    color: '#0F172A',
    marginHorizontal: 36,
  },
  grabStepperBtnPlus: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  grabFooter: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  grabActionBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  grabActionBtnText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 16,
  },
});

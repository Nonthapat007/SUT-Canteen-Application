import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';
import { calculatePredictiveSlotting } from '../services/predictiveSlotting';

export default function ClassSyncModal({
  visible,
  onClose,
  selectedCanteen,
  selectedStall,
  selectedMenu,
  currentBuilding,
  customOptions = [],
  specialNotes = '',
  quantity: initialQuantity = 1,
  onConfirmOrder,
}) {
  // Default to 0 (เดินไปตอนนี้ / ทำทันที) so demo and presentations work instantly without unexpected delay!
  const [departureOffset, setDepartureOffset] = useState(0);
  const [showAlgorithmDetails, setShowAlgorithmDetails] = useState(false);
  const [quantity, setQuantity] = useState(initialQuantity || 1);

  useEffect(() => {
    if (visible) {
      setQuantity(initialQuantity || 1);
    }
  }, [visible, initialQuantity]);

  if (!visible || !selectedMenu || !selectedCanteen || !selectedStall) return null;

  // Calculate predictive slotting
  const slotting = calculatePredictiveSlotting({
    buildingId: currentBuilding?.id || 'bld-b1',
    canteenId: selectedCanteen?.id || 'canteen-1',
    departureOffsetMinutes: departureOffset,
    standardPrepMinutes: selectedMenu.prepTime || 5,
    currentQueueWaitMinutes: selectedStall.currentQueueCount ? selectedStall.currentQueueCount * 2 : 2,
  });

  const timeOptions = [
    { label: '🚶 เดินไปตอนนี้ (ส่งครัวทันที)', value: 0 },
    { label: 'อีก 5 นาที', value: 5 },
    { label: 'อีก 10 นาที', value: 10 },
    { label: 'อีก 15 นาที', value: 15 },
    { label: 'อีก 25 นาที (คาบถัดไป)', value: 25 },
  ];

  const unitPrice = Number(selectedMenu.price) || 0;
  const totalAmount = unitPrice * quantity;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleBadgeRow}>
                <View style={styles.syncBadge}>
                  <Icon name="zap" size={11} color="#FFFFFF" variant="filled" />
                  <Text style={styles.syncBadgeText}>ZERO WAIT TIME</Text>
                </View>
                <Text style={styles.title}>สั่งอาหารล่วงหน้า</Text>
              </View>
              <Text style={styles.subtitle}>
                ซิงก์เวลาปรุงอาหารกับเวลาเดินเท้า อาหารเสร็จร้อนๆ พอดีตอนเดินถึง
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="close" size={18} color={COLORS.textSecondary} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            {/* Selected Dish Summary Card */}
            <View style={styles.dishSummary}>
              <View style={styles.dishLeft}>
                <Text style={styles.stallName}>🏪 {selectedStall.thaiName || selectedStall.name}</Text>
                <Text style={styles.dishName}>{selectedMenu.name}</Text>
                {customOptions.length > 0 && (
                  <Text style={styles.optionsNote} numberOfLines={2}>
                    ตัวเลือก: {customOptions.join(' • ')}
                  </Text>
                )}
                {!!specialNotes && (
                  <Text style={styles.specialNotesDisplay} numberOfLines={2}>
                    📝 โน้ต: {specialNotes}
                  </Text>
                )}
              </View>

              <View style={styles.dishRightCol}>
                <Text style={styles.dishPrice}>฿{totalAmount}</Text>
                {/* Quantity Adjuster */}
                <View style={styles.counterRowSmall}>
                  <TouchableOpacity
                    style={[styles.counterBtnSmall, quantity <= 1 && styles.counterBtnDisabled]}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    activeOpacity={0.7}
                  >
                    <Icon name="minus" size={11} color={quantity <= 1 ? '#94A3B8' : COLORS.textPrimary} strokeWidth={2.5} />
                  </TouchableOpacity>

                  <Text style={styles.counterTextSmall}>{quantity}</Text>

                  <TouchableOpacity
                    style={styles.counterBtnSmall}
                    onPress={() => setQuantity((q) => Math.min(99, q + 1))}
                    activeOpacity={0.7}
                  >
                    <Icon name="plus" size={11} color={COLORS.textPrimary} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Departure Selector */}
            <View style={styles.sectionBox}>
              <View style={styles.departureHeaderRow}>
                <Text style={styles.sectionLabel}>
                  ⏰ คุณจะออกจากอาคารเรียนเมื่อใด?
                </Text>
                <Text style={styles.currentBldNote}>
                  📍 {currentBuilding?.name || 'กลุ่มอาคารเรียน มทส.'}
                </Text>
              </View>

              <View style={styles.pillsContainer}>
                {timeOptions.map((opt) => {
                  const isSelected = departureOffset === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.timePill, isSelected && styles.timePillActive]}
                      onPress={() => setDepartureOffset(opt.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.timePillText, isSelected && styles.timePillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Clean Timing Result Card (กระชับ อ่านง่าย ไม่รกตา) */}
            <View style={styles.timingCard}>
              <View style={styles.timingTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.timingLabel}>⏱️ คาดว่าอาหารเสร็จพร้อมรับ</Text>
                  <Text style={styles.timingTime}>{slotting.formattedArrival}</Text>
                </View>
                <View style={styles.zeroWaitTag}>
                  <Icon name="zap" size={12} color="#FFFFFF" variant="filled" />
                  <Text style={styles.zeroWaitTagText}>0 นาที ไม่ต้องรอ</Text>
                </View>
              </View>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusIndicatorDot,
                    { backgroundColor: slotting.shouldReleaseImmediately ? '#10B981' : '#F59E0B' },
                  ]}
                />
                <Text style={styles.statusText}>
                  {slotting.shouldReleaseImmediately
                    ? '🚀 ส่งเข้าจอครัวแม่ค้า (KDS) ทันที แม่ค้าเริ่มปรุงตอนนี้'
                    : `☁️ หน่วงเวลาบนคลาวด์อีก ${Math.ceil(slotting.holdSecondsRemaining / 60)} นาที (ส่งเข้าเตาพอดีเวลา)`}
                </Text>
              </View>

              {/* Collapsible Algorithm Details (ซ่อนไว้ให้ดูคลีน ถ้าอาจารย์ถามค่อยกดกางออกดู) */}
              <TouchableOpacity
                style={styles.algorithmToggle}
                onPress={() => setShowAlgorithmDetails(!showAlgorithmDetails)}
                activeOpacity={0.7}
              >
                <Text style={styles.algorithmToggleText}>
                  {showAlgorithmDetails
                    ? '▲ ซ่อนเบื้องหลังการคำนวณ'
                    : 'ℹ️ ดูเบื้องหลังการคำนวณเวลา (Predictive Algorithm) ▼'}
                </Text>
              </TouchableOpacity>

              {showAlgorithmDetails && (
                <View style={styles.expandedAlgorithmBox}>
                  <Text style={styles.formulaText}>
                    สูตร: เวลาส่งเข้าจอครัว = เวลาถึงร้าน - (เวลาปรุง + คิวสะสม)
                  </Text>
                  <View style={styles.gridParams}>
                    <View style={styles.paramItem}>
                      <Text style={styles.paramLabel}>🚶‍♂️ เดินเท้า</Text>
                      <Text style={styles.paramVal}>{slotting.walkingMinutes} นาที</Text>
                    </View>
                    <View style={styles.paramItem}>
                      <Text style={styles.paramLabel}>🍳 เวลาปรุง</Text>
                      <Text style={styles.paramVal}>{slotting.standardPrepMinutes} นาที</Text>
                    </View>
                    <View style={styles.paramItem}>
                      <Text style={styles.paramLabel}>⏳ คิวสะสม</Text>
                      <Text style={styles.paramVal}>{slotting.currentQueueWaitMinutes} นาที</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                onConfirmOrder({
                  canteen: selectedCanteen,
                  stall: selectedStall,
                  items: [
                    {
                      name: selectedMenu.name,
                      qty: quantity,
                      price: unitPrice,
                      options: customOptions,
                    },
                  ],
                  totalAmount: totalAmount,
                  specialNotes: specialNotes || '',
                  departureOffsetMinutes: departureOffset,
                  walkingMinutes: slotting.walkingMinutes,
                  prepMinutes: slotting.standardPrepMinutes,
                  queueMinutes: slotting.currentQueueWaitMinutes,
                  holdSecondsRemaining: slotting.holdSecondsRemaining,
                });
                onClose();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>
                ยืนยันสั่งอาหารล่วงหน้า x{quantity} (฿{totalAmount})
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
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 24,
    maxHeight: '90%',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  syncBadgeText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  title: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    fontSize: 17,
  },
  subtitle: {
    ...TYPOGRAPHY.regular,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  scrollArea: {
    marginBottom: 12,
  },
  dishSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dishLeft: {
    flex: 1,
  },
  stallName: {
    ...TYPOGRAPHY.bold,
    color: '#D97706',
    fontSize: 11,
    marginBottom: 2,
  },
  dishName: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    fontSize: 15,
    marginBottom: 2,
  },
  optionsNote: {
    ...TYPOGRAPHY.regular,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  specialNotesDisplay: {
    ...TYPOGRAPHY.medium,
    color: '#EA580C',
    fontSize: 11,
    marginTop: 2,
  },
  dishRightCol: {
    alignItems: 'flex-end',
    marginLeft: 12,
    gap: 6,
  },
  dishPrice: {
    ...TYPOGRAPHY.black,
    color: '#EA580C',
    fontSize: 18,
  },
  counterRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 2,
  },
  counterBtnSmall: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  counterBtnDisabled: {
    backgroundColor: '#F8FAFC',
    opacity: 0.4,
  },
  counterTextSmall: {
    minWidth: 24,
    textAlign: 'center',
    ...TYPOGRAPHY.bold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  sectionBox: {
    marginBottom: 14,
  },
  departureHeaderRow: {
    marginBottom: 8,
  },
  sectionLabel: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginBottom: 2,
  },
  currentBldNote: {
    ...TYPOGRAPHY.medium,
    color: '#64748B',
    fontSize: 11,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timePill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timePillActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  timePillText: {
    ...TYPOGRAPHY.medium,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  timePillTextActive: {
    ...TYPOGRAPHY.bold,
    color: '#EA580C',
  },
  timingCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    marginBottom: 14,
  },
  timingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timingLabel: {
    ...TYPOGRAPHY.bold,
    color: '#9A3412',
    fontSize: 12,
    marginBottom: 2,
  },
  timingTime: {
    ...TYPOGRAPHY.black,
    color: '#EA580C',
    fontSize: 22,
  },
  zeroWaitTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  zeroWaitTagText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statusIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    fontSize: 11,
    flex: 1,
  },
  algorithmToggle: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 4,
  },
  algorithmToggleText: {
    ...TYPOGRAPHY.medium,
    color: '#C2410C',
    fontSize: 11,
  },
  expandedAlgorithmBox: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
  },
  formulaText: {
    ...TYPOGRAPHY.medium,
    color: '#7C2D12',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
  },
  gridParams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 8,
  },
  paramItem: {
    flex: 1,
    alignItems: 'center',
  },
  paramLabel: {
    ...TYPOGRAPHY.regular,
    color: '#78716C',
    fontSize: 10,
    marginBottom: 2,
  },
  paramVal: {
    ...TYPOGRAPHY.bold,
    color: '#7C2D12',
    fontSize: 12,
  },
  footer: {
    paddingTop: 6,
  },
  confirmBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 15,
  },
});

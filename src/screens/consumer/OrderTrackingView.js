// Consumer Orders & Activity Screen inspired by Grab's clean layout & SUT Canteen Design System
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONT_FAMILY, TYPOGRAPHY } from '../../constants/typography';
import DigitalPassModal from '../../components/DigitalPassModal';
import Icon from '../../components/common/Icon';

export default function OrderTrackingView({
  orders = [],
  currentUser = null,
  rewardsPoints = 1200,
  walletBalance = 150,
  onNavigateHome,
  onCompletePickup,
  onReleaseOrderNow,
}) {
  const [selectedPassOrder, setSelectedPassOrder] = useState(null);

  // Separate active in-progress orders from completed past orders
  const activeOrders = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  // Format date helper in Thai matching Grab (เช่น 07 ก.ย. 2026, 14:02 น.)
  const formatDateThai = (isoDate) => {
    if (!isoDate) return 'วันนี้';
    try {
      const d = new Date(isoDate);
      const months = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
      ];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${mins} น.`;
    } catch (e) {
      return 'วันนี้';
    }
  };

  const getStatusDisplay = (order) => {
    switch (order.status) {
      case 'HOLDING_IN_CLOUD':
        return {
          title: 'หน่วงเวลาบนคลาวด์',
          desc: `อีก ${order.holdSecondsRemaining || 0} วินาที ระบบจะปล่อยออเดอร์เข้าจอแม่ค้า`,
          color: '#EA580C',
          badgeBg: '#FFF7ED',
          stepIndex: 1,
        };
      case 'RELEASED_TO_KDS':
        return {
          title: 'ส่งเข้าจอแม่ค้าแล้ว',
          desc: 'ออเดอร์ปรากฏบนหน้าจอแท็บเล็ตหน้าเตา รอแม่ค้ากดเริ่มปรุง',
          color: '#D97706',
          badgeBg: '#FEF3C7',
          stepIndex: 2,
        };
      case 'COOKING':
        return {
          title: 'แม่ค้ากำลังปรุงอาหาร',
          desc: 'กำลังปรุงอาหารสดใหม่ตามตัวเลือกพิเศษของคุณ',
          color: COLORS.primary,
          badgeBg: COLORS.primaryLight,
          stepIndex: 3,
        };
      case 'READY':
      case 'READY_FOR_PICKUP':
        return {
          title: 'อาหารเสร็จแล้ว พร้อมรับ!',
          desc: 'เดินไปรับอาหารที่จุดรับได้เลยทันที ไม่ต้องรอคิว',
          color: COLORS.green,
          badgeBg: '#ECFDF5',
          stepIndex: 4,
        };
      default:
        return {
          title: 'รับอาหารเรียบร้อยแล้ว',
          desc: 'ขอบคุณที่ใช้บริการ SUT Canteen Express',
          color: '#64748B',
          badgeBg: '#F1F5F9',
          stepIndex: 5,
        };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Grab-style Top Header (รายการ + ประวัติ) */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>รายการ</Text>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => Alert.alert('ประวัติคำสั่งซื้อ', 'ระบบบันทึกประวัติคำสั่งซื้อทั้งหมดของคุณไว้เรียบร้อยแล้ว')}
          activeOpacity={0.8}
        >
          <Icon name="clock" size={14} color={COLORS.textPrimary} strokeWidth={2.2} style={{ marginRight: 5 }} />
          <Text style={styles.historyBtnText}>ประวัติ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* 2. Grab-style Rewards Points Card (Banner) */}
        <View style={styles.rewardsCard}>
          <View style={styles.rewardsTopRow}>
            <View style={styles.giftIconCircle}>
              <Icon name="gift" size={24} color={COLORS.primary} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardsTitle}>
                ขณะนี้คุณมี {rewardsPoints} SUT Points
              </Text>
              <Text style={styles.rewardsSub}>
                ใช้คะแนนแลกสิทธิพิเศษและส่วนลดโรงอาหารได้มากมาย!
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.findPointsLink}
            onPress={() => Alert.alert('SUT Points', 'คุณสามารถสะสมคะแนนจากการสั่งอาหารและนำมาแลกส่วนลดในแอปได้')}
            activeOpacity={0.7}
          >
            <Text style={styles.findPointsText}>ค้นหา SUT Points →</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Live Active Orders (ถ้ามีออเดอร์ที่กำลังปรุง/กำลังรอ) */}
        {activeOrders.length > 0 && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionTitle}>กำลังดำเนินการ ({activeOrders.length})</Text>
            {activeOrders.map((order) => {
              const statusInfo = getStatusDisplay(order);
              const isFinished = order.status === 'READY' || order.status === 'READY_FOR_PICKUP';

              return (
                <View key={order.id} style={styles.activeOrderCard}>
                  {/* Order Top Bar */}
                  <View style={styles.orderTopBar}>
                    <View>
                      <Text style={styles.activeQueueNum}>คิว #{order.orderNumber}</Text>
                      <Text style={styles.activeOrderId}>ID: {order.id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.badgeBg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                        {statusInfo.title}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Steps */}
                  <View style={styles.stepsRow}>
                    {[
                      { num: 1, label: 'จองคิว' },
                      { num: 2, label: 'เข้า KDS' },
                      { num: 3, label: 'กำลังปรุง' },
                      { num: 4, label: 'พร้อมรับ' },
                    ].map((step) => {
                      const isStepDone = statusInfo.stepIndex >= step.num;
                      return (
                        <View key={step.num} style={styles.stepItem}>
                          <View
                            style={[
                              styles.stepDot,
                              isStepDone ? styles.stepDotDone : styles.stepDotInactive,
                            ]}
                          >
                            {isStepDone && <Icon name="check" size={11} color="#FFFFFF" strokeWidth={3} />}
                          </View>
                          <Text style={styles.stepLabelText}>{step.label}</Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Shop and Items */}
                  <View style={styles.shopInfoBox}>
                    <Text style={styles.activeShopName}>{order.stallName || 'ร้านอาหาร มทส.'}</Text>
                    <Text style={styles.activeCanteenName}>{order.canteenName || 'โรงอาหาร มทส.'}</Text>
                    {order.items?.map((it, idx) => (
                      <View key={idx} style={{ marginTop: 4 }}>
                        <View style={styles.activeItemRow}>
                          <Text style={styles.activeItemName}>
                            • {it.name || 'รายการอาหาร'} x{it.qty || 1}
                          </Text>
                          <Text style={styles.activePriceText}>฿{it.price || order.totalAmount}</Text>
                        </View>
                        {it.options && it.options.length > 0 && (
                          <Text style={styles.activeItemOptionsText}>
                            ตัวเลือก: {it.options.join(', ')}
                          </Text>
                        )}
                      </View>
                    ))}

                    {!!order.specialNotes && (
                      <View style={styles.activeSpecialNotesBox}>
                        <Text style={styles.activeSpecialNotesText}>
                          📝 โน้ตคำขอพิเศษ: {order.specialNotes}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* If Holding in Cloud: Show Fast-Track Button to immediately send to KDS without waiting! */}
                  {order.status === 'HOLDING_IN_CLOUD' && (
                    <TouchableOpacity
                      style={styles.fastTrackBtn}
                      onPress={() => onReleaseOrderNow && onReleaseOrderNow(order.id)}
                      activeOpacity={0.85}
                    >
                      <Icon name="zap" size={15} color="#FFFFFF" variant="filled" style={{ marginRight: 6 }} />
                      <Text style={styles.fastTrackBtnText}>
                        ⚡ เร่งส่งเข้าครัวทันที (ไม่ต้องรอเวลา)
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Action Pass Button */}
                  <TouchableOpacity
                    style={[styles.passBtn, isFinished && styles.passBtnGreen]}
                    onPress={() => setSelectedPassOrder(order)}
                    activeOpacity={0.85}
                  >
                    <Icon name="qr-code" size={15} color="#FFFFFF" strokeWidth={2} style={{ marginRight: 6 }} />
                    <Text style={styles.passBtnText}>
                      {isFinished ? 'เปิดบัตรรับอาหาร / PIN' : 'ดูบัตรคิว SUT Pass'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* 4. Section Title: "ล่าสุด" (Recent) matching Grab */}
        <Text style={styles.sectionTitle}>ล่าสุด</Text>

        {/* 5. If Empty State (ผู้ใช้พึ่งสมัครยังไม่ได้สั่งเลย ให้เป็นหน้าโล่งๆ ไว้ก่อน) */}
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="orders" size={40} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>ยังไม่มีรายการคำสั่งซื้อ</Text>
            <Text style={styles.emptySubtitle}>
              เมื่อคุณสั่งอาหารล่วงหน้า หรือเติมเงินเข้ากระเป๋า SUT Canteen Wallet รายการคำสั่งซื้อจะปรากฏที่นี่
            </Text>
            <TouchableOpacity
              style={styles.startOrderBtn}
              onPress={onNavigateHome}
              activeOpacity={0.85}
            >
              <Text style={styles.startOrderBtnText}>สั่งอาหารเลย →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* 6. Grab-style Transaction / Recent Orders List */
          <View style={styles.recentList}>
            {completedOrders.map((order) => (
              <View key={order.id} style={styles.grabItemRow}>
                {/* Left Food Plate Circle Icon */}
                <View style={styles.foodIconCircle}>
                  <Icon name="burger" size={20} color={COLORS.primary} strokeWidth={2} />
                </View>

                {/* Center Details */}
                <View style={styles.itemCenterCol}>
                  <Text style={styles.grabShopTitle} numberOfLines={1}>
                    {order.stallName || 'ร้านอาหาร มทส.'} - {order.canteenName || 'โรงอาหาร'}
                  </Text>
                  <Text style={styles.grabDateText}>
                    {formatDateThai(order.createdAt)}
                  </Text>

                  {/* Rating Stars matching Grab */}
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name="star"
                        size={13}
                        color="#CBD5E1"
                        strokeWidth={1.5}
                        style={{ marginRight: 3 }}
                      />
                    ))}
                  </View>

                  {/* Reorder Link matching Grab */}
                  <TouchableOpacity
                    style={styles.reorderLink}
                    onPress={onNavigateHome}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reorderLinkText}>สั่งซื้ออีกครั้ง →</Text>
                  </TouchableOpacity>
                </View>

                {/* Right Price */}
                <View style={styles.priceRightCol}>
                  <Text style={styles.grabPriceBold}>฿{order.totalAmount}</Text>
                </View>
              </View>
            ))}

            {/* If wallet has balance, show recent wallet top-up transaction item */}
            {walletBalance > 0 && (
              <View style={styles.grabItemRow}>
                <View style={styles.walletIconCircle}>
                  <Icon name="wallet" size={18} color={COLORS.primary} strokeWidth={2} />
                </View>
                <View style={styles.itemCenterCol}>
                  <Text style={styles.grabShopTitle}>เติมเงิน SUT Canteen Wallet</Text>
                  <Text style={styles.grabDateText}>วันนี้, ระบบพร้อมใช้งาน</Text>
                </View>
                <View style={styles.priceRightCol}>
                  <Text style={styles.walletPriceOrange}>฿{walletBalance}.00</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={{ height: 60 }} />

      {/* Digital Pass / QR Modal */}
      {selectedPassOrder && (
        <DigitalPassModal
          visible={!!selectedPassOrder}
          order={selectedPassOrder}
          onClose={() => setSelectedPassOrder(null)}
          onPickupComplete={(orderId) => {
            if (typeof onCompletePickup === 'function') {
              onCompletePickup(orderId);
            }
            setSelectedPassOrder(null);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.black,
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  historyBtnText: {
    ...TYPOGRAPHY.bold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  content: {
    padding: 16,
  },
  // Rewards Points Card matching Grab
  rewardsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  rewardsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  giftIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 58, 0.2)',
  },
  rewardsTitle: {
    ...TYPOGRAPHY.extraBold,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  rewardsSub: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  findPointsLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  findPointsText: {
    ...TYPOGRAPHY.bold,
    fontSize: 12,
    color: '#0284C7',
  },
  sectionTitle: {
    ...TYPOGRAPHY.black,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  // Empty State (หน้าโล่งๆ เมื่อยังไม่ได้สั่ง)
  emptyContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 10,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 94, 58, 0.25)',
  },
  emptyTitle: {
    ...TYPOGRAPHY.extraBold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 280,
  },
  startOrderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  startOrderBtnText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 13,
  },
  // Active Orders
  activeSection: {
    marginBottom: 20,
  },
  activeOrderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  orderTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeQueueNum: {
    ...TYPOGRAPHY.black,
    fontSize: 18,
    color: COLORS.primary,
  },
  activeOrderId: {
    ...TYPOGRAPHY.regular,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    ...TYPOGRAPHY.bold,
    fontSize: 11,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotDone: {
    backgroundColor: COLORS.green,
  },
  stepDotInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepLabelText: {
    ...TYPOGRAPHY.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  shopInfoBox: {
    marginBottom: 14,
  },
  activeShopName: {
    ...TYPOGRAPHY.extraBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  activeCanteenName: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  activeItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  activeItemName: {
    ...TYPOGRAPHY.regular,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  activePriceText: {
    ...TYPOGRAPHY.bold,
    fontSize: 13,
    color: COLORS.primary,
  },
  activeItemOptionsText: {
    ...TYPOGRAPHY.medium,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 10,
    marginTop: 2,
  },
  activeSpecialNotesBox: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  activeSpecialNotesText: {
    ...TYPOGRAPHY.medium,
    fontSize: 11,
    color: COLORS.primary,
  },
  fastTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#C2410C',
  },
  fastTrackBtnText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 13,
  },
  passBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  passBtnGreen: {
    backgroundColor: COLORS.green,
  },
  passBtnText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 13,
  },
  // Grab-style Recent List
  recentList: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  grabItemRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'flex-start',
  },
  foodIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  walletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  itemCenterCol: {
    flex: 1,
    minWidth: 0,
  },
  grabShopTitle: {
    ...TYPOGRAPHY.extraBold,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  grabDateText: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reorderLink: {
    alignSelf: 'flex-start',
  },
  reorderLinkText: {
    ...TYPOGRAPHY.bold,
    fontSize: 12,
    color: COLORS.primary,
  },
  priceRightCol: {
    marginLeft: 10,
  },
  grabPriceBold: {
    ...TYPOGRAPHY.black,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  walletPriceOrange: {
    ...TYPOGRAPHY.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
});

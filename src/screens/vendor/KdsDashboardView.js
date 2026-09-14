// Vendor KDS (Kitchen Display System) - หน้าจอครัวแท็บเล็ตสำหรับร้านค้าหน้าเตา
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SUT_CANTEENS } from '../../constants/campusData';

export default function KdsDashboardView({
  storeState,
  storeActions,
}) {
  const { orders, grabAndGoItems, selectedVendorStallId } = storeState;
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'grab_stock'

  // Find all stalls across canteens for vendor stall switcher
  const allStalls = [];
  SUT_CANTEENS.forEach((canteen) => {
    canteen.stalls.forEach((st) => {
      allStalls.push({ ...st, canteenName: canteen.shortName });
    });
  });

  const currentStall = allStalls.find((s) => s.id === selectedVendorStallId) || allStalls[0];

  // Filter orders for this stall
  const stallOrders = orders.filter(
    (o) => o.stallId === currentStall.id || (o.stallName && o.stallName === currentStall.name)
  );

  // Group orders by urgent active vs cloud holding vs ready
  const urgentOrders = stallOrders.filter((o) => o.status === 'RELEASED_TO_KDS' || o.status === 'COOKING');
  const holdingOrders = stallOrders.filter((o) => o.status === 'HOLDING_IN_CLOUD');
  const readyOrders = stallOrders.filter((o) => o.status === 'READY' || o.status === 'READY_FOR_PICKUP');

  // Grab & Go items associated with this stall/canteen
  const stallGrabItems = grabAndGoItems.filter(
    (item) => item.stallName === currentStall.name || item.canteenId === currentStall.canteenId
  );

  return (
    <View style={styles.container}>
      {/* KDS Top Bar - High Contrast for Cook */}
      <View style={styles.topBar}>
        <View style={styles.kdsBranding}>
          <View style={styles.kdsBadge}>
            <Text style={styles.kdsBadgeText}>KDS TABLET</Text>
          </View>
          <View>
            <Text style={styles.stallNameTitle}>
              {currentStall.name} ({currentStall.canteenName})
            </Text>
            <Text style={styles.stallSubTitle}>
              หน้าจอครัวหน้าเตา • ตัวหนังสือขนาดใหญ่อ่านง่ายในระยะ 1 เมตร
            </Text>
          </View>
        </View>

        {/* Top Actions: View Switcher & Quick Stall Switch */}
        <View style={styles.topActions}>
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
              onPress={() => setActiveTab('orders')}
            >
              <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
                🍳 คิวปรุงสด ({urgentOrders.length + holdingOrders.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'grab_stock' && styles.tabBtnActive]}
              onPress={() => setActiveTab('grab_stock')}
            >
              <Text style={[styles.tabText, activeTab === 'grab_stock' && styles.tabTextActive]}>
                ⚡ จัดการสต็อก Grab & Go
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Quick Stall Selector Row */}
      <View style={styles.stallSelectorRow}>
        <Text style={styles.stallSelectorLabel}>เลือกร้านค้าของคุณ:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stallPillContainer}>
          {allStalls.map((st) => {
            const isSelected = st.id === currentStall.id;
            return (
              <TouchableOpacity
                key={st.id}
                style={[styles.stallPill, isSelected && styles.stallPillActive]}
                onPress={() => storeActions.setSelectedVendorStall(st.id)}
              >
                <Text style={[styles.stallPillText, isSelected && styles.stallPillTextActive]}>
                  {st.image} {st.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content View */}
      {activeTab === 'orders' ? (
        <ScrollView style={styles.kdsBody} showsVerticalScrollIndicator={false}>
          {/* Section 1: Urgent / Need to Cook Now */}
          <View style={styles.sectionHeader}>
            <View style={styles.urgentDot} />
            <Text style={styles.sectionTitle}>
              🔥 ถึงเวลาปรุงแล้ว / กำลังปรุง ({urgentOrders.length} ออเดอร์)
            </Text>
          </View>

          {urgentOrders.length === 0 && (
            <View style={styles.noOrdersCard}>
              <Text style={styles.noOrdersText}>ไม่มีออเดอร์ที่ต้องปรุงทันทีในขณะนี้</Text>
            </View>
          )}

          <View style={styles.cardsGrid}>
            {urgentOrders.map((order) => {
              const isCooking = order.status === 'COOKING';
              return (
                <View key={order.id} style={[styles.kdsCard, isCooking && styles.kdsCardCooking]}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardQueueBadge}>
                      <Text style={styles.queueBigNumber}>#{order.orderNumber}</Text>
                    </View>
                    <View style={styles.timeTag}>
                      <Text style={styles.timeTagText}>
                        {isCooking ? '🍳 กำลังทำ' : '🚨 ถึงคิวแล้ว!'}
                      </Text>
                    </View>
                  </View>

                  {/* Customer Info */}
                  <Text style={styles.customerLine}>
                    👤 {order.studentName} ({order.studentPhone})
                  </Text>
                  <Text style={styles.customerSub}>
                    จุดเดินมา: {order.departureBuilding} (เดิน {order.walkingMinutes} นาที)
                  </Text>

                  {/* Menu Items (BIG FONT FOR COOK) */}
                  <View style={styles.orderItemsBox}>
                    {order.items.map((it, idx) => (
                      <View key={idx} style={styles.kdsItemRow}>
                        <Text style={styles.kdsItemName}>
                          {it.qty}x {it.name}
                        </Text>
                        
                        {/* High Contrast Special Notes Badges */}
                        {it.options && it.options.length > 0 && (
                          <View style={styles.notesContainer}>
                            {it.options.map((opt, oIdx) => (
                              <View key={oIdx} style={styles.noteBadge}>
                                <Text style={styles.noteText}>{opt}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>

                  {/* 1-Tap Action Buttons */}
                  <View style={styles.actionsBox}>
                    {!isCooking ? (
                      <TouchableOpacity
                        style={styles.startCookBtn}
                        onPress={() => storeActions.updateOrderStatus(order.id, 'COOKING')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.startCookBtnText}>▶ 1-TAP: เริ่มทำอาหาร</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.readyBtn}
                        onPress={() => storeActions.updateOrderStatus(order.id, 'READY')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.readyBtnText}>
                          ✓ 1-TAP: ปรุงเสร็จแล้ว (แจ้งเตือน นศ.)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Section 2: Predictive Cloud Holding Orders (Incoming) */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.cloudIcon}>☁️</Text>
            <Text style={styles.sectionTitle}>
              คิวล่วงหน้าบนคลาวด์ (Smart Holding - กำลังนับถอยหลัง) ({holdingOrders.length})
            </Text>
          </View>

          <Text style={styles.holdingExplanation}>
            ระบบหน่วงเวลาออเดอร์ไว้ล่วงหน้า จะเด้งขึ้นหน้าจอให้อัตโนมัติเมื่อถึงจังหวะเวลาที่ถูกต้อง
          </Text>

          <View style={styles.cardsGrid}>
            {holdingOrders.map((order) => (
              <View key={order.id} style={styles.holdingCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.holdingQueueNum}>คิว #{order.orderNumber}</Text>
                  <View style={styles.holdingCountdownPill}>
                    <Text style={styles.holdingCountdownText}>
                      ⏱️ ปล่อยเข้าจอใน {order.holdSecondsRemaining} วินาที
                    </Text>
                  </View>
                </View>

                <Text style={styles.holdingItemTitle}>
                  {order.items[0]?.name} x{order.items[0]?.qty}
                </Text>

                {order.items[0]?.options && (
                  <Text style={styles.holdingNotes}>
                    คำขอ: {order.items[0].options.join(', ')}
                  </Text>
                )}

                {/* Force Release Button for Vendor */}
                <TouchableOpacity
                  style={styles.forceReleaseBtn}
                  onPress={() => storeActions.updateOrderStatus(order.id, 'RELEASED_TO_KDS')}
                >
                  <Text style={styles.forceReleaseText}>
                    ⚡ ดึงเข้าจอทันที (ไม่ต้องรอระบบนับถอยหลัง)
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Section 3: Ready Orders waiting for student pickup */}
          {readyOrders.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.readyIcon}>🔔</Text>
                <Text style={styles.sectionTitle}>
                  ปรุงเสร็จแล้ว / รอรับอาหาร ({readyOrders.length})
                </Text>
              </View>

              <View style={styles.cardsGrid}>
                {readyOrders.map((order) => (
                  <View key={order.id} style={styles.readyCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.readyQueueNum}>คิว #{order.orderNumber}</Text>
                      <Text style={styles.readyPinText}>PIN: {order.pickupQrPin}</Text>
                    </View>
                    <Text style={styles.readyCustName}>
                      {order.studentName} • {order.items[0]?.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.completeHandoverBtn}
                      onPress={() => storeActions.updateOrderStatus(order.id, 'COMPLETED')}
                    >
                      <Text style={styles.completeHandoverText}>✓ มอบอาหารแล้ว</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        /* Grab & Go Inventory Management Tab */
        <ScrollView style={styles.kdsBody} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚡ สต็อกสินค้าพร้อมหยิบทันที (Grab & Go Fast-Lane)</Text>
          </View>
          <Text style={styles.holdingExplanation}>
            กด + หรือ - เพื่ออัปเดตจำนวนกล่องที่วางไว้หน้าร้านแบบ Real-time นักศึกษาจะเห็นจำนวนอัปเดตทันที
          </Text>

          <View style={styles.grabList}>
            {grabAndGoItems.map((item) => (
              <View key={item.id} style={styles.grabStockCard}>
                <View style={styles.grabLeft}>
                  <Text style={styles.grabEmoji}>{item.image || '🍱'}</Text>
                  <View style={styles.grabDetails}>
                    <Text style={styles.grabItemTitle}>{item.name}</Text>
                    <Text style={styles.grabItemLoc}>
                      📍 {item.canteenName} • {item.pickupSpot}
                    </Text>
                    <Text style={styles.grabItemPrice}>ราคา: ฿{item.price}</Text>
                  </View>
                </View>

                {/* Stock Controls */}
                <View style={styles.grabRight}>
                  <Text style={styles.stockCountLabel}>สต็อกหน้าร้าน</Text>
                  <View style={styles.counterRow}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => storeActions.updateGrabStock(item.id, -1)}
                    >
                      <Text style={styles.counterBtnText}>-</Text>
                    </TouchableOpacity>

                    <View style={styles.stockNumBox}>
                      <Text style={styles.stockNumText}>{item.stock}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => storeActions.updateGrabStock(item.id, 1)}
                    >
                      <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  kdsBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kdsBadge: {
    backgroundColor: COLORS.sutOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  kdsBadgeText: {
    color: COLORS.white,
    ...TYPOGRAPHY.black,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  stallNameTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    ...TYPOGRAPHY.bold,
  },
  stallSubTitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  topActions: {
    flexDirection: 'row',
  },
  tabButtons: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.sutOrange,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    ...TYPOGRAPHY.bold,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  stallSelectorRow: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  stallSelectorLabel: {
    color: COLORS.sutGold,
    fontSize: 11,
    ...TYPOGRAPHY.bold,
  },
  stallPillContainer: {
    gap: 8,
  },
  stallPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  stallPillActive: {
    backgroundColor: COLORS.sutOrangeBright,
    borderColor: COLORS.sutGold,
  },
  stallPillText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    ...TYPOGRAPHY.medium,
  },
  stallPillTextActive: {
    color: COLORS.white,
    ...TYPOGRAPHY.bold,
  },
  kdsBody: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  urgentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.red,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    ...TYPOGRAPHY.bold,
  },
  noOrdersCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
  },
  noOrdersText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  cardsGrid: {
    gap: 14,
  },
  kdsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.sutOrangeBright,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  kdsCardCooking: {
    borderColor: COLORS.green,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardQueueBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  queueBigNumber: {
    color: COLORS.sutGold,
    fontSize: 22,
    ...TYPOGRAPHY.black,
    letterSpacing: 1,
  },
  timeTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeTagText: {
    color: COLORS.red,
    fontSize: 12,
    ...TYPOGRAPHY.bold,
  },
  customerLine: {
    color: COLORS.textPrimary,
    fontSize: 13,
    ...TYPOGRAPHY.bold,
    marginBottom: 2,
  },
  customerSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 10,
  },
  orderItemsBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  kdsItemRow: {
    marginBottom: 6,
  },
  kdsItemName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    ...TYPOGRAPHY.bold,
    marginBottom: 4,
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  noteBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  noteText: {
    color: COLORS.sutGold,
    fontSize: 12,
    ...TYPOGRAPHY.bold,
  },
  actionsBox: {
    paddingTop: 4,
  },
  startCookBtn: {
    backgroundColor: COLORS.sutOrange,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  startCookBtnText: {
    color: COLORS.white,
    fontSize: 15,
    ...TYPOGRAPHY.black,
  },
  readyBtn: {
    backgroundColor: COLORS.green,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  readyBtnText: {
    color: COLORS.white,
    fontSize: 15,
    ...TYPOGRAPHY.black,
  },
  cloudIcon: {
    fontSize: 16,
  },
  holdingExplanation: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 10,
  },
  holdingCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  holdingQueueNum: {
    color: COLORS.textSecondary,
    fontSize: 16,
    ...TYPOGRAPHY.bold,
  },
  holdingCountdownPill: {
    backgroundColor: 'rgba(230, 81, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  holdingCountdownText: {
    color: COLORS.sutOrangeBright,
    fontSize: 11,
    ...TYPOGRAPHY.bold,
  },
  holdingItemTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  holdingNotes: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 8,
  },
  forceReleaseBtn: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  forceReleaseText: {
    color: COLORS.sutGold,
    fontSize: 11,
    fontWeight: '700',
  },
  readyIcon: {
    fontSize: 16,
  },
  readyCard: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.green,
    marginBottom: 8,
  },
  readyQueueNum: {
    color: COLORS.green,
    fontSize: 15,
    ...TYPOGRAPHY.bold,
  },
  readyPinText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  readyCustName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginVertical: 4,
  },
  completeHandoverBtn: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  completeHandoverText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  grabList: {
    gap: 12,
    paddingBottom: 40,
  },
  grabStockCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  grabLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  grabEmoji: {
    fontSize: 32,
  },
  grabDetails: {
    flex: 1,
  },
  grabItemTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  grabItemLoc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  grabItemPrice: {
    color: COLORS.sutOrangeBright,
    fontSize: 13,
    ...TYPOGRAPHY.bold,
  },
  grabRight: {
    alignItems: 'center',
  },
  stockCountLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 4,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  counterBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
  },
  counterBtnText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    ...TYPOGRAPHY.bold,
  },
  stockNumBox: {
    width: 38,
    alignItems: 'center',
  },
  stockNumText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    ...TYPOGRAPHY.black,
  },
});

// Merchant Queue Screen matching SUT Canteen Design System (Mobile-First Vertical UX)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Icon from '../../components/common/Icon';
import ModernSwitch from '../../components/common/ModernSwitch';
import dbService from '../../services/dbService';

export default function MerchantQueueScreen({
  storeState = {},
  storeActions = {},
  shopName = 'Kasalong Canteen',
  currentStall = null,
  currentUser = null,
  onOpenCreateStall = null,
}) {
  const orders = (storeState && Array.isArray(storeState.orders)) ? storeState.orders : [];
  const [isShopOpen, setIsShopOpen] = useState(
    currentStall ? currentStall.isOpen !== false : true
  );

  // Mobile-First Segmented Stage Filter: 'cooking' | 'almost_ready' | 'ready' | 'all'
  const [activeStageTab, setActiveStageTab] = useState('cooking');

  useEffect(() => {
    if (currentStall && typeof currentStall.isOpen !== 'undefined') {
      setIsShopOpen(currentStall.isOpen !== false);
    }
  }, [currentStall?.isOpen]);

  const handleToggleShopOpen = async (newVal) => {
    setIsShopOpen(newVal);
    if (currentStall?.id) {
      try {
        await dbService.updateStallStatus(currentStall.id, newVal);
        if (storeActions && typeof storeActions.reloadStalls === 'function') {
          await storeActions.reloadStalls();
        }
      } catch (err) {
        console.error('Failed to update stall status:', err);
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะร้านค้าได้: ' + err.message);
        setIsShopOpen(!newVal);
      }
    }
  };

  // Filter orders by stall if a stall is active, or show all
  const filteredOrders = currentStall?.id
    ? orders.filter((o) => !o.stallId || o.stallId === currentStall.id)
    : orders;

  // Group orders into stages
  const cookingOrders = filteredOrders.filter(
    (o) => o.status === 'RELEASED_TO_KDS' || o.status === 'COOKING'
  );
  const almostReadyOrders = filteredOrders.filter((o) => o.status === 'ALMOST_READY');
  const readyOrders = filteredOrders.filter(
    (o) => o.status === 'READY' || o.status === 'READY_FOR_PICKUP'
  );

  const totalActiveOrders = cookingOrders.length + almostReadyOrders.length + readyOrders.length;

  const handleSimulateNewOrder = () => {
    storeActions.createPredictiveOrder({
      canteen: { id: 'canteen-5', name: 'Kasalong Canteen' },
      stall: { id: currentStall?.id || 'stall-noodle-house', name: currentStall?.name || 'Noodle House' },
      items: [
        {
          name: 'ก๋วยเตี๋ยวเรือสูตรพิเศษ',
          qty: 1,
          price: 45,
          options: ['เส้นเล็ก', 'เนื้อวัวนุ่ม', 'ไม่ใส่ถั่วงอก'],
        },
      ],
      totalAmount: 45,
      departureOffsetMinutes: 0,
      walkingMinutes: 2,
      prepMinutes: 5,
      queueMinutes: 2,
      holdSecondsRemaining: 0,
    });
  };

  // Render individual full-width order card
  const renderOrderCard = (order, stage) => {
    const isCooking = stage === 'cooking';
    const isAlmostReady = stage === 'almost_ready';
    const isReady = stage === 'ready';

    return (
      <View
        key={order.id}
        style={[
          styles.orderCard,
          isAlmostReady && styles.orderCardAmber,
          isReady && styles.orderCardGreen,
        ]}
      >
        {/* Top Header: Order Number + Order Stage Tag */}
        <View style={styles.cardTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={[
                styles.orderNumber,
                isAlmostReady && { color: '#D97706' },
                isReady && { color: '#16A34A' },
              ]}
            >
              #{order.orderNumber}
            </Text>
            {order.type === 'GRAB_AND_GO' && (
              <View style={styles.grabTypePill}>
                <Text style={styles.grabTypeText}>Grab & Go</Text>
              </View>
            )}
          </View>

          {isCooking && (
            <View style={styles.timeTagCooking}>
              <Text style={styles.timeTagCookingText}>
                {order.status === 'COOKING' ? 'กำลังปรุง' : 'ออเดอร์ใหม่'}
              </Text>
            </View>
          )}

          {isAlmostReady && (
            <View style={styles.pulsingBadge}>
              <Text style={styles.pulsingText}>ลูกค้ากำลังเดินมา</Text>
            </View>
          )}

          {isReady && (
            <View style={styles.pinTag}>
              <Text style={styles.pinTagText}>PIN: {order.pickupQrPin || '1234'}</Text>
            </View>
          )}
        </View>

        {/* Customer Information */}
        <View style={styles.customerRow}>
          <Icon name="user" size={13} color={COLORS.textSecondary} strokeWidth={2} style={{ marginRight: 5 }} />
          <Text style={styles.customerText}>
            {order.studentName || 'ลูกค้าทั่วไป'} {order.studentPhone ? `(${order.studentPhone})` : ''}
          </Text>
        </View>

        {/* Order Items List */}
        <View style={styles.orderItemsBox}>
          {(order.items || []).map((it, idx) => (
            <View key={idx} style={styles.itemLine}>
              <Text style={styles.itemQty}>{it.qty || 1}x</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{it.name}</Text>
                {it.options && it.options.length > 0 && (
                  <Text style={styles.itemOptions}>{it.options.join(', ')}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Special Customer Notes (if any) */}
        {!!order.specialNotes && (
          <View style={styles.specialNotesBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Icon name="file-text" size={11} color="#C2410C" style={{ marginRight: 4 }} />
              <Text style={styles.specialNotesLabel}>โน้ตจากลูกค้า:</Text>
            </View>
            <Text style={styles.specialNotesText}>{order.specialNotes}</Text>
          </View>
        )}

        {/* Big 1-Tap Action Button */}
        {isCooking && (
          <TouchableOpacity
            style={styles.actionBtnAlmost}
            onPress={() => storeActions.updateOrderStatus(order.id, 'ALMOST_READY')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnAlmostText}>ใกล้เสร็จแล้ว (แจ้งเตือน นศ.)</Text>
            <Icon name="chevron-right" size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        )}

        {isAlmostReady && (
          <TouchableOpacity
            style={styles.actionBtnReady}
            onPress={() => storeActions.updateOrderStatus(order.id, 'READY')}
            activeOpacity={0.85}
          >
            <Icon name="check" size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnReadyText}>ปรุงเสร็จแล้ว (พร้อมรับอาหาร)</Text>
          </TouchableOpacity>
        )}

        {isReady && (
          <TouchableOpacity
            style={styles.actionBtnHandover}
            onPress={() => storeActions.updateOrderStatus(order.id, 'COMPLETED')}
            activeOpacity={0.85}
          >
            <Icon name="check" size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnHandoverText}>ส่งมอบอาหารแล้ว</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>คิวออเดอร์</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{shopName}</Text>
        </View>

        {/* Shop Open / Closed Toggle */}
        <View style={styles.toggleGroup}>
          <Text style={[styles.shopStatusText, isShopOpen ? styles.textGreen : styles.textMuted]}>
            {isShopOpen ? 'ร้านเปิด' : 'ร้านปิด'}
          </Text>
          <ModernSwitch
            value={isShopOpen}
            onValueChange={handleToggleShopOpen}
            activeTrackColor="#10B981"
            size="small"
          />
        </View>

        {/* Orders Count Badge */}
        <View style={styles.ordersBadge}>
          <Text style={styles.ordersBadgeText}>{totalActiveOrders} ออเดอร์</Text>
        </View>
      </View>

      {!currentStall ? (
        <View style={styles.noStallCardContainer}>
          <View style={styles.noStallIconCircle}>
            <Icon name="store" size={44} color={COLORS.primary} strokeWidth={2} />
          </View>
          <Text style={styles.noStallMainTitle}>
            ยินดีต้อนรับ{currentUser?.fullName ? `, คุณ${currentUser.fullName}` : ''}!
          </Text>
          <Text style={styles.noStallMainSubtitle}>
            คุณยังไม่มีร้านค้าในระบบโรงอาหาร มทส. กรุณากดปุ่มด้านล่างเพื่อลงทะเบียนเปิดร้านค้าของคุณและเริ่มรับออเดอร์
          </Text>
          {onOpenCreateStall && (
            <TouchableOpacity
              style={styles.openShopBigBtn}
              onPress={onOpenCreateStall}
              activeOpacity={0.85}
            >
              <Icon name="plus" size={18} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 8 }} />
              <Text style={styles.openShopBigBtnText}>ลงทะเบียนเปิดร้านค้าใหม่</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          {/* Mobile-First Segmented Stage Filter Tabs (No awkward horizontal column clipping!) */}
          <View style={styles.stageTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stageTabsScroll}
            >
              {[
                { key: 'cooking', label: 'กำลังทำ', count: cookingOrders.length, color: COLORS.primary },
                { key: 'almost_ready', label: 'ใกล้เสร็จ', count: almostReadyOrders.length, color: '#D97706' },
                { key: 'ready', label: 'พร้อมรับ', count: readyOrders.length, color: '#16A34A' },
                { key: 'all', label: 'ทั้งหมด', count: totalActiveOrders, color: '#0F172A' },
              ].map((tab) => {
                const isActive = activeStageTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.stageTabPill,
                      isActive && { backgroundColor: tab.color, borderColor: tab.color },
                    ]}
                    onPress={() => setActiveStageTab(tab.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.stageTabLabel, isActive && styles.stageTabLabelActive]}>
                      {tab.label}
                    </Text>
                    <View
                      style={[
                        styles.stageCountBadge,
                        isActive && styles.stageCountBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stageCountText,
                          isActive && { color: tab.color, fontWeight: '700' },
                        ]}
                      >
                        {tab.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Full-Width Vertical Scrollable Orders List (Clean 1-Thumb Mobile UX) */}
          <ScrollView
            style={styles.verticalScroll}
            contentContainerStyle={styles.verticalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeStageTab === 'cooking' && (
              <>
                {cookingOrders.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Icon name="coffee" size={32} color="#94A3B8" strokeWidth={1.8} style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyTitle}>ไม่มีออเดอร์ที่กำลังปรุง</Text>
                    <Text style={styles.emptySubtitle}>เมื่อมีคำสั่งซื้อใหม่เข้ามา รายการจะปรากฏที่นี่ทันที</Text>
                  </View>
                ) : (
                  cookingOrders.map((o) => renderOrderCard(o, 'cooking'))
                )}
              </>
            )}

            {activeStageTab === 'almost_ready' && (
              <>
                {almostReadyOrders.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Icon name="clock" size={32} color="#94A3B8" strokeWidth={1.8} style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyTitle}>ไม่มีออเดอร์ในสถานะใกล้เสร็จ</Text>
                    <Text style={styles.emptySubtitle}>เมื่อแม่ค้ากด "ใกล้เสร็จแล้ว" ระบบจะแจ้งเตือนให้นักศึกษาเริ่มเดินมารับ</Text>
                  </View>
                ) : (
                  almostReadyOrders.map((o) => renderOrderCard(o, 'almost_ready'))
                )}
              </>
            )}

            {activeStageTab === 'ready' && (
              <>
                {readyOrders.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Icon name="check" size={32} color="#94A3B8" strokeWidth={1.8} style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyTitle}>ไม่มีออเดอร์ที่พร้อมรับ</Text>
                    <Text style={styles.emptySubtitle}>ออเดอร์ที่ปรุงเสร็จแล้วและรอนักศึกษามาสแกนรับจะแสดงที่นี่</Text>
                  </View>
                ) : (
                  readyOrders.map((o) => renderOrderCard(o, 'ready'))
                )}
              </>
            )}

            {activeStageTab === 'all' && (
              <>
                {totalActiveOrders === 0 ? (
                  <View style={styles.emptyCard}>
                    <Icon name="inbox" size={32} color="#94A3B8" strokeWidth={1.8} style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyTitle}>ไม่มีออเดอร์ในระบบขณะนี้</Text>
                    <Text style={styles.emptySubtitle}>ร้านของคุณพร้อมรับออเดอร์แล้ว</Text>
                  </View>
                ) : (
                  <>
                    {cookingOrders.length > 0 && (
                      <View style={styles.sectionHeaderWrap}>
                        <View style={[styles.sectionDot, { backgroundColor: COLORS.primary }]} />
                        <Text style={styles.sectionHeading}>กำลังทำ ({cookingOrders.length})</Text>
                      </View>
                    )}
                    {cookingOrders.map((o) => renderOrderCard(o, 'cooking'))}

                    {almostReadyOrders.length > 0 && (
                      <View style={[styles.sectionHeaderWrap, { marginTop: 14 }]}>
                        <View style={[styles.sectionDot, { backgroundColor: '#D97706' }]} />
                        <Text style={styles.sectionHeading}>ใกล้เสร็จ ({almostReadyOrders.length})</Text>
                      </View>
                    )}
                    {almostReadyOrders.map((o) => renderOrderCard(o, 'almost_ready'))}

                    {readyOrders.length > 0 && (
                      <View style={[styles.sectionHeaderWrap, { marginTop: 14 }]}>
                        <View style={[styles.sectionDot, { backgroundColor: '#16A34A' }]} />
                        <Text style={styles.sectionHeading}>พร้อมรับ ({readyOrders.length})</Text>
                      </View>
                    )}
                    {readyOrders.map((o) => renderOrderCard(o, 'ready'))}
                  </>
                )}
              </>
            )}

            {/* Quick Order Simulation Bar */}
            <View style={styles.simulateBar}>
              <TouchableOpacity
                style={styles.simulateBtn}
                onPress={handleSimulateNewOrder}
                activeOpacity={0.85}
              >
                <Icon name="plus" size={15} color={COLORS.primary} strokeWidth={2.5} style={{ marginRight: 6 }} />
                <Text style={styles.simulateText}>ทดลองส่งออเดอร์ใหม่เข้าครัว (Simulate Order)</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    ...TYPOGRAPHY.black,
    marginBottom: 2,
  },
  headerSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    ...TYPOGRAPHY.medium,
  },
  toggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  shopStatusText: {
    fontSize: 12,
    ...TYPOGRAPHY.bold,
    marginRight: 4,
  },
  textGreen: {
    color: '#10B981',
  },
  textMuted: {
    color: '#94A3B8',
  },
  ordersBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  ordersBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    ...TYPOGRAPHY.bold,
  },
  // Stage Filter Tabs
  stageTabsContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 10,
  },
  stageTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  stageTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  stageTabLabel: {
    fontSize: 13,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  stageTabLabelActive: {
    color: '#FFFFFF',
  },
  stageCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  stageCountBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  stageCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  // Vertical Scroll Orders List
  verticalScroll: {
    flex: 1,
  },
  verticalScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 60,
  },
  sectionHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeading: {
    fontSize: 14,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  // Order Card
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  orderCardAmber: {
    borderColor: '#FDE68A',
  },
  orderCardGreen: {
    borderColor: '#BBF7D0',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    color: COLORS.primary,
    fontSize: 20,
    ...TYPOGRAPHY.black,
  },
  grabTypePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  grabTypeText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
  },
  timeTagCooking: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeTagCookingText: {
    color: COLORS.primary,
    fontSize: 11,
    ...TYPOGRAPHY.bold,
  },
  pulsingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pulsingText: {
    color: '#D97706',
    fontSize: 11,
    ...TYPOGRAPHY.bold,
  },
  pinTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pinTagText: {
    color: '#16A34A',
    fontSize: 11,
    ...TYPOGRAPHY.bold,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.medium,
  },
  orderItemsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  itemLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemQty: {
    color: COLORS.primary,
    fontSize: 13,
    ...TYPOGRAPHY.bold,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    ...TYPOGRAPHY.bold,
  },
  itemOptions: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  specialNotesBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  specialNotesLabel: {
    color: '#C2410C',
    fontSize: 11,
    ...TYPOGRAPHY.bold,
  },
  specialNotesText: {
    color: '#9A3412',
    fontSize: 12,
    lineHeight: 16,
  },
  actionBtnAlmost: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBtnAlmostText: {
    color: '#FFFFFF',
    fontSize: 13,
    ...TYPOGRAPHY.bold,
  },
  actionBtnReady: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBtnReadyText: {
    color: '#FFFFFF',
    fontSize: 13,
    ...TYPOGRAPHY.bold,
  },
  actionBtnHandover: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBtnHandoverText: {
    color: '#FFFFFF',
    fontSize: 13,
    ...TYPOGRAPHY.bold,
  },
  // Empty State
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  emptyTitle: {
    fontSize: 15,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Simulate Order Bar
  simulateBar: {
    marginTop: 10,
    marginBottom: 20,
  },
  simulateBtn: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulateText: {
    color: COLORS.primary,
    fontSize: 12,
    ...TYPOGRAPHY.bold,
  },
  // No Stall Container
  noStallCardContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noStallIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  noStallMainTitle: {
    fontSize: 18,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  noStallMainSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  openShopBigBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  openShopBigBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    ...TYPOGRAPHY.bold,
  },
});

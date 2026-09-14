// Merchant Queue Screen matching Reference Image 1 (คิวออเดอร์, ร้านเปิด, กำลังทำ / ใกล้เสร็จ)
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

  // Group orders into columns
  const cookingOrders = filteredOrders.filter((o) => o.status === 'RELEASED_TO_KDS' || o.status === 'COOKING');
  const almostReadyOrders = filteredOrders.filter((o) => o.status === 'ALMOST_READY');
  const readyOrders = filteredOrders.filter((o) => o.status === 'READY' || o.status === 'READY_FOR_PICKUP');

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
      holdSecondsRemaining: 0, // Immediately releases into KDS
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Header matching Image 1 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>คิวออเดอร์</Text>
          <Text style={styles.headerSub}>{shopName}</Text>
        </View>

        {/* Shop Open Toggle */}
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
          {/* Main Queue Columns ScrollView */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.columnsContainer}
          >
            {/* Column 1: ● กำลังทำ (Cooking) */}
            <View style={styles.column}>
              <View style={styles.columnHeader}>
                <View style={[styles.statusDot, { backgroundColor: '#C2410C' }]} />
                <Text style={styles.columnTitle}>กำลังทำ {cookingOrders.length}</Text>
              </View>

              {cookingOrders.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>ไม่มีออเดอร์</Text>
                </View>
              ) : (
                <ScrollView style={styles.cardList} showsVerticalScrollIndicator={false}>
                  {cookingOrders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                        <Text style={styles.timeTag}>
                          {order.status === 'COOKING' ? 'กำลังปรุง' : 'ออเดอร์ใหม่'}
                        </Text>
                      </View>

                      <View style={styles.customerRow}>
                        <Icon name="user" size={13} color={COLORS.textSecondary} strokeWidth={2} />
                        <Text style={styles.customerText}>
                          {order.studentName} ({order.studentPhone})
                        </Text>
                      </View>

                      <View style={styles.orderItemsBox}>
                        {order.items.map((it, idx) => (
                          <View key={idx} style={styles.itemLine}>
                            <Text style={styles.itemQty}>{it.qty}x</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.itemName}>{it.name}</Text>
                              {it.options && it.options.length > 0 && (
                                <Text style={styles.itemOptions}>
                                  {it.options.join(', ')}
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>

                      {!!order.specialNotes && (
                        <View style={styles.specialNotesBox}>
                          <Text style={styles.specialNotesLabel}>📝 โน้ตจากลูกค้า:</Text>
                          <Text style={styles.specialNotesText}>{order.specialNotes}</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.actionBtnAlmost}
                        onPress={() => storeActions.updateOrderStatus(order.id, 'ALMOST_READY')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionBtnAlmostText}>ใกล้เสร็จแล้ว (แจ้งเตือน)</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Column 2: ● ใกล้เสร็จ (Almost Ready) */}
            <View style={styles.column}>
              <View style={styles.columnHeader}>
                <View style={[styles.statusDot, { backgroundColor: '#EA580C' }]} />
                <Text style={styles.columnTitle}>ใกล้เสร็จ {almostReadyOrders.length}</Text>
              </View>

              {almostReadyOrders.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>ไม่มีออเดอร์</Text>
                </View>
              ) : (
                <ScrollView style={styles.cardList} showsVerticalScrollIndicator={false}>
                  {almostReadyOrders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                        <View style={styles.pulsingBadge}>
                          <Text style={styles.pulsingText}>ลูกค้ากำลังเดินมา</Text>
                        </View>
                      </View>

                      <View style={styles.customerRow}>
                        <Icon name="user" size={13} color={COLORS.textSecondary} strokeWidth={2} />
                        <Text style={styles.customerText}>
                          {order.studentName} ({order.studentPhone})
                        </Text>
                      </View>

                      <View style={styles.orderItemsBox}>
                        {order.items.map((it, idx) => (
                          <View key={idx} style={styles.itemLine}>
                            <Text style={styles.itemQty}>{it.qty}x</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.itemName}>{it.name}</Text>
                              {it.options && it.options.length > 0 && (
                                <Text style={styles.itemOptions}>
                                  {it.options.join(', ')}
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>

                      {!!order.specialNotes && (
                        <View style={styles.specialNotesBox}>
                          <Text style={styles.specialNotesLabel}>📝 โน้ตจากลูกค้า:</Text>
                          <Text style={styles.specialNotesText}>{order.specialNotes}</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.actionBtnReady}
                        onPress={() => storeActions.updateOrderStatus(order.id, 'READY')}
                        activeOpacity={0.8}
                      >
                        <Icon name="check" size={14} color={COLORS.textWhite} strokeWidth={2.5} />
                        <Text style={styles.actionBtnReadyText}>เสร็จแล้ว (แจ้ง นศ.)</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Column 3: ● เสร็จแล้ว (Ready for Pickup) */}
            <View style={styles.column}>
              <View style={styles.columnHeader}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.green }]} />
                <Text style={styles.columnTitle}>พร้อมรับ {readyOrders.length}</Text>
              </View>

              {readyOrders.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>ไม่มีออเดอร์</Text>
                </View>
              ) : (
                <ScrollView style={styles.cardList} showsVerticalScrollIndicator={false}>
                  {readyOrders.map((order) => (
                    <View key={order.id} style={[styles.orderCard, styles.orderCardGreen]}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.readyQueueNum}>#{order.orderNumber}</Text>
                        <Text style={styles.pinTag}>PIN: {order.pickupQrPin}</Text>
                      </View>

                      <View style={styles.customerRow}>
                        <Icon name="user" size={13} color={COLORS.textSecondary} strokeWidth={2} />
                        <Text style={styles.customerText}>
                          {order.studentName} • {order.items[0]?.name}
                        </Text>
                      </View>

                      {!!order.specialNotes && (
                        <View style={styles.specialNotesBoxSmall}>
                          <Text style={styles.specialNotesTextSmall} numberOfLines={1}>
                            📝 {order.specialNotes}
                          </Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.actionBtnHandover}
                        onPress={() => storeActions.updateOrderStatus(order.id, 'COMPLETED')}
                        activeOpacity={0.8}
                      >
                        <Icon name="check" size={14} color={COLORS.textWhite} strokeWidth={2.5} />
                        <Text style={styles.actionBtnHandoverText}>ส่งมอบอาหารแล้ว</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </ScrollView>

          {/* Quick Order Simulation Bar at Bottom */}
          <View style={styles.simulateBar}>
            <TouchableOpacity
              style={styles.simulateBtn}
              onPress={handleSimulateNewOrder}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="plus" size={15} color={COLORS.primary} strokeWidth={2.5} />
                <Text style={styles.simulateText}>ทดลองส่งออเดอร์ใหม่เข้าครัว (Simulate Order)</Text>
              </View>
            </TouchableOpacity>
          </View>
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
    fontSize: 11,
    ...TYPOGRAPHY.bold,
  },
  textGreen: {
    color: COLORS.green,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
  ordersBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ordersBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    ...TYPOGRAPHY.bold,
  },
  columnsContainer: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 12,
  },
  column: {
    width: 270,
    maxHeight: '88%',
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  columnTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    ...TYPOGRAPHY.bold,
  },
  emptyCard: {
    height: 120,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  cardList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  orderCardYellow: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  orderCardGreen: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderNumber: {
    color: COLORS.primary,
    fontSize: 18,
    ...TYPOGRAPHY.black,
  },
  readyQueueNum: {
    color: COLORS.green,
    fontSize: 18,
    ...TYPOGRAPHY.black,
  },
  timeTag: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    fontSize: 10,
    ...TYPOGRAPHY.bold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  almostTimeTag: {
    backgroundColor: COLORS.yellowLight,
    color: COLORS.yellow,
    fontSize: 10,
    ...TYPOGRAPHY.bold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pinTag: {
    backgroundColor: COLORS.greenLight,
    color: COLORS.green,
    fontSize: 11,
    ...TYPOGRAPHY.bold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  customerText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  itemsDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginBottom: 8,
  },
  itemBox: {
    marginBottom: 6,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    ...TYPOGRAPHY.bold,
  },
  itemNameBold: {
    color: COLORS.textPrimary,
    fontSize: 14,
    ...TYPOGRAPHY.bold,
    marginBottom: 8,
  },
  notesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  notePill: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  noteText: {
    color: '#C2410C',
    fontSize: 10,
    fontWeight: '700',
  },
  specialNotesBox: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.sutOrange,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  specialNotesLabel: {
    ...TYPOGRAPHY.bold,
    color: COLORS.sutOrangeBright,
    fontSize: 11,
    marginBottom: 2,
  },
  specialNotesText: {
    ...TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
    fontSize: 12,
    lineHeight: 16,
  },
  specialNotesBoxSmall: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 6,
  },
  specialNotesTextSmall: {
    ...TYPOGRAPHY.medium,
    color: COLORS.sutOrangeBright,
    fontSize: 10,
  },
  cardFooter: {
    marginTop: 8,
  },
  actionBtnAlmost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnAlmostText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnReady: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnReadyText: {
    color: COLORS.textWhite,
    fontSize: 12,
    ...TYPOGRAPHY.bold,
  },
  actionBtnHandover: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.green,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnHandoverText: {
    color: COLORS.textWhite,
    fontSize: 12,
    ...TYPOGRAPHY.bold,
  },
  simulateBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  simulateBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 58, 0.3)',
  },
  simulateText: {
    color: COLORS.primary,
    fontSize: 12,
    ...TYPOGRAPHY.bold,
  },
  noStallCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.background,
  },
  noStallIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 94, 58, 0.25)',
  },
  noStallMainTitle: {
    fontSize: 18,
    ...TYPOGRAPHY.black,
    color: COLORS.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  noStallMainSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 320,
  },
  openShopBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  openShopBigBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    ...TYPOGRAPHY.bold,
  },
});

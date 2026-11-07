// Consumer Orders & Activity Screen with Food-First Visuals & SUT Canteen Design System
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONT_FAMILY, TYPOGRAPHY } from '../../constants/typography';
import DigitalPassModal from '../../components/DigitalPassModal';
import Icon from '../../components/common/Icon';
import { getFoodImageFallback, getStallImageFallback } from '../../utils/imageUtils';

/**
 * Image thumbnail with error fallback handling
 */
function OrderStallThumbnail({ uri, fallbackUri, isGrabAndGo, size = 64 }) {
  const [currentUri, setCurrentUri] = useState(uri);
  const [hasError, setHasError] = useState(false);

  return (
    <View style={[styles.thumbnailWrapper, { width: size, height: size }]}>
      <Image
        source={{ uri: hasError ? fallbackUri : currentUri }}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setCurrentUri(fallbackUri);
          }
        }}
        style={[styles.thumbnailImage, { width: size, height: size }]}
        resizeMode="cover"
      />
      {isGrabAndGo && (
        <View style={styles.grabBadgeOverlay}>
          <Icon name="zap" size={9} color="#FFFFFF" variant="filled" />
        </View>
      )}
    </View>
  );
}

export default function OrderTrackingView({
  orders = [],
  currentUser = null,
  rewardsPoints = 0,
  walletBalance = 0,
  stalls = [],
  canteens = [],
  onNavigateHome,
  onSelectStall,
  onCompletePickup,
  onReleaseOrderNow,
}) {
  const [selectedPassOrder, setSelectedPassOrder] = useState(null);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [ratings, setRatings] = useState({}); // { [orderId]: number }

  // Separate active in-progress orders from completed past orders
  const activeOrders = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  // Format date helper in Thai (เช่น 10 ก.ย. 2026, 21:14 น.)
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

  // Resolve best matching stall / food image for an order
  const getOrderImage = (order) => {
    if (order.stallImage || order.stallImageUrl) {
      return order.stallImage || order.stallImageUrl;
    }
    if (order.items?.[0]?.image || order.items?.[0]?.imageUrl) {
      return order.items[0].image || order.items[0].imageUrl;
    }

    // Match stall in stalls array
    if (stalls && stalls.length > 0) {
      const matched = stalls.find(
        (s) =>
          (order.stallId && s.id === order.stallId) ||
          (order.stallName && (
            s.thaiName === order.stallName ||
            s.name === order.stallName ||
            order.stallName.includes(s.thaiName) ||
            (s.thaiName && s.thaiName.includes(order.stallName))
          ))
      );
      if (matched?.imageUrl) {
        return matched.imageUrl;
      }
    }

    // Fallback by stall name
    if (order.stallName) {
      return getStallImageFallback(order.stallName);
    }

    // Fallback by first food item
    const firstFood = order.items?.[0]?.name;
    if (firstFood) {
      return getFoodImageFallback(firstFood);
    }

    return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';
  };

  // Clean stall name for display (strip unnecessary prefixes)
  const getCleanStallName = (rawName) => {
    if (!rawName) return 'ร้านอาหาร มทส.';
    return rawName.replace(/^หน้าร้าน\s*/, '').trim() || rawName;
  };

  // Summarize items for list display
  const getItemsSummary = (items) => {
    if (!items || items.length === 0) return 'รายการอาหาร มทส.';
    return items
      .map((it) => `${it.name || 'อาหาร'}${it.qty > 1 ? ` x${it.qty}` : ''}`)
      .join(', ');
  };

  // Handle reorder click
  const handleReorder = (order) => {
    if (onSelectStall && stalls && stalls.length > 0) {
      const matched = stalls.find(
        (s) =>
          (order.stallId && s.id === order.stallId) ||
          (order.stallName && (
            s.thaiName === order.stallName ||
            s.name === order.stallName ||
            order.stallName.includes(s.thaiName) ||
            (s.thaiName && s.thaiName.includes(order.stallName))
          ))
      );

      if (matched) {
        if (matched.isOpen === false) {
          Alert.alert(
            'ร้านปิดชั่วคราว',
            `ร้าน "${matched.thaiName || matched.name}" ปิดให้บริการอยู่ในขณะนี้`
          );
          return;
        }
        onSelectStall(matched);
        return;
      }
    }

    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  // Handle rating tap
  const handleRateOrder = (order, starIndex) => {
    setRatings((prev) => ({
      ...prev,
      [order.id]: starIndex,
    }));
    Alert.alert(
      'ขอบคุณสำหรับการประเมิน',
      `คุณได้ให้คะแนนร้าน ${getCleanStallName(order.stallName)} จำนวน ${starIndex} ดาว`
    );
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
      {/* 1. Header with Title & Filter Switch */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTitle}>รายการ</Text>
          <Text style={styles.headerSubtitle}>ติดตามคิวและประวัติคำสั่งซื้อ</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.historyBtn,
            activeFilter === 'completed' && styles.historyBtnActive,
          ]}
          onPress={() => {
            setActiveFilter((prev) => (prev === 'completed' ? 'all' : 'completed'));
          }}
          activeOpacity={0.8}
        >
          <Icon
            name="clock"
            size={14}
            color={activeFilter === 'completed' ? '#FFFFFF' : COLORS.textPrimary}
            strokeWidth={2.2}
            style={{ marginRight: 5 }}
          />
          <Text
            style={[
              styles.historyBtnText,
              activeFilter === 'completed' && styles.historyBtnTextActive,
            ]}
          >
            ประวัติ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Segment Tabs */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'all' && styles.filterChipTextActive,
            ]}
          >
            ทั้งหมด ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'active' && styles.filterChipActive]}
          onPress={() => setActiveFilter('active')}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'active' && styles.filterChipTextActive,
            ]}
          >
            กำลังดำเนินการ ({activeOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'completed' && styles.filterChipActive]}
          onPress={() => setActiveFilter('completed')}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'completed' && styles.filterChipTextActive,
            ]}
          >
            สำเร็จแล้ว ({completedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* 2. SUT Rewards Points Card */}
        <View style={styles.rewardsCard}>
          <View style={styles.rewardsTopRow}>
            <View style={styles.giftIconCircle}>
              <Icon name="gift" size={22} color={COLORS.primary} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rewardsHeaderBadgeRow}>
                <Text style={styles.rewardsTitle}>
                  ขณะนี้คุณมี {rewardsPoints} SUT Points
                </Text>
              </View>
              <Text style={styles.rewardsSub}>
                ใช้คะแนนสะสมแลกสิทธิพิเศษและส่วนลดโรงอาหารได้มากมาย
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.findPointsLink}
            onPress={() => setShowRewardsModal(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.findPointsText}>ดูสิทธิพิเศษและส่วนลด</Text>
            <Icon name="arrow-right" size={13} color="#0284C7" strokeWidth={2.2} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* 3. Live Active Orders (ถ้ามีออเดอร์ที่กำลังปรุง/รอรับ) */}
        {(activeFilter === 'all' || activeFilter === 'active') && activeOrders.length > 0 && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionTitle}>กำลังดำเนินการ ({activeOrders.length})</Text>
            {activeOrders.map((order) => {
              const statusInfo = getStatusDisplay(order);
              const isFinished = order.status === 'READY' || order.status === 'READY_FOR_PICKUP';
              const stallImg = getOrderImage(order);
              const cleanTitle = getCleanStallName(order.stallName);

              return (
                <View key={order.id} style={styles.activeOrderCard}>
                  {/* Order Top Bar with Stall Image & Queue */}
                  <View style={styles.orderTopBar}>
                    <View style={styles.activeHeaderLeft}>
                      <OrderStallThumbnail
                        uri={stallImg}
                        fallbackUri={getStallImageFallback(cleanTitle)}
                        isGrabAndGo={order.type === 'GRAB_AND_GO'}
                        size={52}
                      />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.activeQueueNum}>คิว #{order.orderNumber}</Text>
                        <Text style={styles.activeShopName} numberOfLines={1}>{cleanTitle}</Text>
                        <Text style={styles.activeCanteenName} numberOfLines={1}>
                          {order.canteenName || 'โรงอาหาร มทส.'}
                        </Text>
                      </View>
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

                  {/* Shop and Items List */}
                  <View style={styles.shopInfoBox}>
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
                          โน้ตคำขอพิเศษ: {order.specialNotes}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Fast-Track Button (If Holding in Cloud) */}
                  {order.status === 'HOLDING_IN_CLOUD' && (
                    <TouchableOpacity
                      style={styles.fastTrackBtn}
                      onPress={() => onReleaseOrderNow && onReleaseOrderNow(order.id)}
                      activeOpacity={0.85}
                    >
                      <Icon name="zap" size={15} color="#FFFFFF" variant="filled" style={{ marginRight: 6 }} />
                      <Text style={styles.fastTrackBtnText}>
                        เร่งส่งเข้าครัวทันที (ไม่ต้องรอเวลา)
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

        {/* 4. Section Title: "ล่าสุด" (Recent) */}
        {(activeFilter === 'all' || activeFilter === 'completed') && (
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {activeFilter === 'completed' ? 'ประวัติคำสั่งซื้อ' : 'ล่าสุด'}
            </Text>
            {completedOrders.length > 0 && (
              <Text style={styles.sectionCounterText}>
                {completedOrders.length} รายการ
              </Text>
            )}
          </View>
        )}

        {/* 5. Empty State */}
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="orders" size={38} color={COLORS.primary} strokeWidth={2} />
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
              <Text style={styles.startOrderBtnText}>ค้นหาอาหารและสั่งเลย</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* 6. Food-First Orders List */
          <View style={styles.recentCardsContainer}>
            {(activeFilter === 'all' || activeFilter === 'completed') &&
              completedOrders.map((order) => {
                const stallImg = getOrderImage(order);
                const cleanTitle = getCleanStallName(order.stallName);
                const itemsSummary = getItemsSummary(order.items);
                const userRating = ratings[order.id] || 0;

                return (
                  <View key={order.id} style={styles.orderCard}>
                    {/* Top Row: Stall Photo + Shop Details + Price */}
                    <View style={styles.orderCardTopRow}>
                      {/* Left: Stall / Food Photo Thumbnail */}
                      <OrderStallThumbnail
                        uri={stallImg}
                        fallbackUri={getStallImageFallback(cleanTitle)}
                        isGrabAndGo={order.type === 'GRAB_AND_GO'}
                        size={64}
                      />

                      {/* Center: Stall info & Location */}
                      <View style={styles.orderCardCenterCol}>
                        <Text style={styles.stallTitleText} numberOfLines={1}>
                          {cleanTitle}
                        </Text>

                        <View style={styles.locationRow}>
                          <Icon name="location" size={11} color={COLORS.textMuted} style={{ marginRight: 3 }} />
                          <Text style={styles.canteenSubText} numberOfLines={1}>
                            {order.canteenName || 'โรงอาหาร มทส.'}
                          </Text>
                        </View>

                        <Text style={styles.orderDateText}>
                          {formatDateThai(order.createdAt)}
                        </Text>
                      </View>

                      {/* Right: Price & Status Tag */}
                      <View style={styles.orderCardRightCol}>
                        <Text style={styles.orderPriceText}>฿{order.totalAmount}</Text>
                        <View style={styles.completedTag}>
                          <Icon name="check" size={10} color={COLORS.green} strokeWidth={2.5} style={{ marginRight: 3 }} />
                          <Text style={styles.completedTagText}>สำเร็จ</Text>
                        </View>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.orderCardDivider} />

                    {/* Items Summary Row */}
                    <View style={styles.itemsSummaryRow}>
                      <Text style={styles.itemsSummaryLabel}>เมนู:</Text>
                      <Text style={styles.itemsSummaryText} numberOfLines={1}>
                        {itemsSummary}
                      </Text>
                    </View>

                    {/* Bottom Row: Rating + Reorder Button */}
                    <View style={styles.orderCardBottomRow}>
                      {/* Left: Interactive Rating Stars */}
                      <View style={styles.ratingSection}>
                        {userRating > 0 ? (
                          <View style={styles.ratedBox}>
                            <View style={styles.starsRow}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Icon
                                  key={s}
                                  name="star"
                                  size={13}
                                  color={s <= userRating ? '#F59E0B' : '#E2E8F0'}
                                  variant={s <= userRating ? 'filled' : 'outline'}
                                  strokeWidth={1.5}
                                  style={{ marginRight: 2 }}
                                />
                              ))}
                            </View>
                            <Text style={styles.ratedScoreText}>({userRating}.0)</Text>
                          </View>
                        ) : (
                          <View style={styles.unratedBox}>
                            <Text style={styles.ratePromptText}>ให้คะแนน:</Text>
                            <View style={styles.starsRow}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                  key={star}
                                  onPress={() => handleRateOrder(order, star)}
                                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                                  activeOpacity={0.7}
                                >
                                  <Icon
                                    name="star"
                                    size={14}
                                    color="#CBD5E1"
                                    strokeWidth={1.5}
                                    style={{ marginRight: 3 }}
                                  />
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>

                      {/* Right: Reorder Pill Button */}
                      <TouchableOpacity
                        style={styles.reorderPillBtn}
                        onPress={() => handleReorder(order)}
                        activeOpacity={0.8}
                      >
                        <Icon
                          name="refresh"
                          size={12}
                          color={COLORS.primary}
                          strokeWidth={2.2}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.reorderPillText}>สั่งซื้ออีกครั้ง</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

            {/* Wallet top-up transaction card if balance exists */}
            {(activeFilter === 'all' || activeFilter === 'completed') && walletBalance > 0 && (
              <View style={styles.walletCard}>
                <View style={styles.walletIconCircle}>
                  <Icon name="wallet" size={20} color={COLORS.primary} strokeWidth={2} />
                </View>
                <View style={styles.orderCardCenterCol}>
                  <Text style={styles.stallTitleText}>เติมเงิน SUT Canteen Wallet</Text>
                  <Text style={styles.orderDateText}>ยอดเงินพร้อมใช้งานในโรงอาหาร มทส.</Text>
                </View>
                <View style={styles.orderCardRightCol}>
                  <Text style={styles.walletPriceOrange}>฿{walletBalance}.00</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={{ height: 60 }} />

      {/* SUT Points Modal */}
      <Modal
        visible={showRewardsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRewardsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.rewardsModalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Icon name="gift" size={20} color={COLORS.primary} strokeWidth={2} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>SUT Points Rewards</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowRewardsModal(false)}
                style={styles.modalCloseBtn}
              >
                <Icon name="close" size={18} color={COLORS.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalPointsBadge}>
              <Text style={styles.modalPointsLabel}>คะแนนสะสมปัจจุบันของคุณ</Text>
              <Text style={styles.modalPointsNumber}>{rewardsPoints} แต้ม</Text>
            </View>

            <Text style={styles.modalSectionTitle}>สิทธิพิเศษที่สามารถแลกได้</Text>

            <View style={styles.rewardsList}>
              {[
                { title: 'ส่วนลดค่าอาหาร ฿10', pts: 100, desc: 'ใช้ได้กับทุกร้านค้าในโรงอาหาร มทส.' },
                { title: 'ส่วนลดค่าอาหาร ฿20', pts: 200, desc: 'สำหรับออเดอร์ขั้นต่ำ ฿60 ขึ้นไป' },
                { title: 'ฟรีท็อปปิ้งไข่ดาว 1 ฟอง', pts: 50, desc: 'ใช้แลกไข่ดาวสุก/ไม่สุกได้ทุกร้าน' },
                { title: 'ฟรีน้ำดื่ม มทส. 1 ขวด', pts: 40, desc: 'รับน้ำดื่มเย็นสดชื่นได้ที่จุดบริการ' },
              ].map((r, i) => {
                const canRedeem = rewardsPoints >= r.pts;
                return (
                  <View key={i} style={styles.rewardItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rewardItemTitle}>{r.title}</Text>
                      <Text style={styles.rewardItemDesc}>{r.desc}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.redeemActionBtn,
                        !canRedeem && styles.redeemActionBtnDisabled,
                      ]}
                      onPress={() => {
                        if (canRedeem) {
                          Alert.alert('แลกสิทธิพิเศษสำเร็จ', `ใช้ ${r.pts} แต้ม แลก "${r.title}" เรียบร้อยแล้ว`);
                          setShowRewardsModal(false);
                        } else {
                          Alert.alert('คะแนนสะสมไม่เพียงพอ', `คุณต้องมีอย่างน้อย ${r.pts} แต้ม เพื่อแลกรายการนี้`);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.redeemActionBtnText,
                          !canRedeem && styles.redeemActionBtnTextDisabled,
                        ]}
                      >
                        {r.pts} แต้ม
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setShowRewardsModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalDoneBtnText}>ตกลง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  },
  headerTitle: {
    ...TYPOGRAPHY.black,
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  historyBtnText: {
    ...TYPOGRAPHY.bold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  historyBtnTextActive: {
    color: '#FFFFFF',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: 'rgba(255, 94, 58, 0.35)',
  },
  filterChipText: {
    ...TYPOGRAPHY.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    ...TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  content: {
    padding: 16,
  },
  // Rewards Points Card
  rewardsCard: {
    backgroundColor: '#FFF8F1',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  rewardsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  giftIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  rewardsHeaderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rewardsTitle: {
    ...TYPOGRAPHY.extraBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  rewardsSub: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  findPointsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  findPointsText: {
    ...TYPOGRAPHY.bold,
    fontSize: 12,
    color: '#0284C7',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.black,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  sectionCounterText: {
    ...TYPOGRAPHY.medium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  // Empty State
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
    marginBottom: 16,
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
    maxWidth: 290,
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
  // Active Orders Section
  activeSection: {
    marginBottom: 22,
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
  activeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  orderTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activeQueueNum: {
    ...TYPOGRAPHY.black,
    fontSize: 17,
    color: COLORS.primary,
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
    ...TYPOGRAPHY.bold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  activeCanteenName: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
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
  // Order Card Container
  recentCardsContainer: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  orderCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnailWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  thumbnailImage: {
    borderRadius: 14,
  },
  grabBadgeOverlay: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCardCenterCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  stallTitleText: {
    ...TYPOGRAPHY.bold,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  canteenSubText: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  orderDateText: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  orderCardRightCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  orderPriceText: {
    ...TYPOGRAPHY.black,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  completedTagText: {
    ...TYPOGRAPHY.bold,
    fontSize: 10,
    color: COLORS.green,
  },
  orderCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  itemsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemsSummaryLabel: {
    ...TYPOGRAPHY.bold,
    fontSize: 11,
    color: COLORS.textMuted,
    marginRight: 4,
  },
  itemsSummaryText: {
    ...TYPOGRAPHY.regular,
    fontSize: 12,
    color: COLORS.textPrimary,
    flex: 1,
  },
  orderCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratedBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratedScoreText: {
    ...TYPOGRAPHY.bold,
    fontSize: 11,
    color: '#D97706',
    marginLeft: 4,
  },
  unratedBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratePromptText: {
    ...TYPOGRAPHY.medium,
    fontSize: 11,
    color: COLORS.textMuted,
    marginRight: 4,
  },
  reorderPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 58, 0.25)',
  },
  reorderPillText: {
    ...TYPOGRAPHY.bold,
    fontSize: 11,
    color: COLORS.primary,
  },
  // Wallet Card
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  walletIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 58, 0.2)',
  },
  walletPriceOrange: {
    ...TYPOGRAPHY.bold,
    fontSize: 15,
    color: COLORS.primary,
  },
  // Rewards Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rewardsModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    ...TYPOGRAPHY.black,
    fontSize: 17,
    color: COLORS.textPrimary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPointsBadge: {
    backgroundColor: '#FFF8F1',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalPointsLabel: {
    ...TYPOGRAPHY.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  modalPointsNumber: {
    ...TYPOGRAPHY.black,
    fontSize: 22,
    color: COLORS.primary,
  },
  modalSectionTitle: {
    ...TYPOGRAPHY.bold,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  rewardsList: {
    gap: 8,
    marginBottom: 18,
  },
  rewardItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rewardItemTitle: {
    ...TYPOGRAPHY.bold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  rewardItemDesc: {
    ...TYPOGRAPHY.regular,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  redeemActionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  redeemActionBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  redeemActionBtnText: {
    ...TYPOGRAPHY.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  redeemActionBtnTextDisabled: {
    color: '#94A3B8',
  },
  modalDoneBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalDoneBtnText: {
    ...TYPOGRAPHY.bold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
});

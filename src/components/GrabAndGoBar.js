// Fast-Lane Grab & Go Feature (วางไว้ก่อน Available Stalls ด้วยสีสันที่โดดเด่นสะดุดตา มองเห็นง่าย)
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';
import { getFoodImageFallback } from '../utils/imageUtils';

export default function GrabAndGoBar({ items = [], onQuickBuy }) {
  const hasItems = items && items.length > 0;

  return (
    <View style={styles.container}>
      {/* High-Impact Visual Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.expressBadge}>
            <Icon name="zap" size={13} color="#FFFFFF" variant="filled" />
            <Text style={styles.expressBadgeText}>FAST-LANE 0 นาที</Text>
          </View>
          <View style={styles.zeroWaitPill}>
            <Text style={styles.zeroWaitText} numberOfLines={1}>
              ปรุงเสร็จพร้อมหยิบ
            </Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>Grab & Go ด่วนพิเศษ</Text>
        <Text style={styles.subTitle}>
          อาหารกล่องปรุงสำเร็จตัดสต็อก Real-time สแกน QR แล้วหยิบจากจุดรับได้ทันที!
        </Text>
      </View>

      {hasItems ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {items.map((item) => {
            const isOutOfStock = item.stock <= 0;
            const imageUri = item.imageUrl || item.image || getFoodImageFallback(item.name);

            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  isOutOfStock ? styles.cardDisabled : styles.cardActive,
                ]}
              >
                {/* Food Image Banner */}
                <View style={styles.imageBannerWrapper}>
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.foodImageBanner}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.noImagePlaceholder}>
                      <Icon name="package" size={32} color="#EA580C" variant="filled" />
                      <Text style={styles.noImageText}>NO IMAGE</Text>
                    </View>
                  )}

                  {/* Overlaid Badges on Image */}
                  <View style={styles.bannerBadgeRow}>
                    <View style={styles.fastLaneBadge}>
                      <Icon name="zap" size={10} color="#FFFFFF" variant="filled" />
                      <Text style={styles.fastLaneBadgeText}>0 นาที</Text>
                    </View>

                    <View style={styles.stockBadgeOverlay}>
                      <Text style={[styles.stockTextOverlay, isOutOfStock && styles.textRed]}>
                        {isOutOfStock ? '● หมด' : (item.badge || '● สดใหม่')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Card Content Below Image */}
                <View style={styles.cardContent}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  {/* Stall & Pickup Spot */}
                  <View style={styles.tagRow}>
                    <Icon name="store" size={12} color="#EA580C" strokeWidth={2} />
                    <Text style={styles.spotTag} numberOfLines={1}>
                      {item.pickupSpot}
                    </Text>
                  </View>

                  <View style={styles.tagRow}>
                    <Icon name="location" size={11} color="#94A3B8" variant="filled" />
                    <Text style={styles.canteenTag} numberOfLines={1}>
                      {item.canteenName}
                    </Text>
                  </View>

                  {/* Bottom Price & Action Button */}
                  <View style={styles.bottomActionRow}>
                    <View>
                      <Text style={styles.priceLabel}>ราคาพิเศษ</Text>
                      <Text style={styles.priceValue}>฿{item.price}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.instantBuyBtn, isOutOfStock && styles.btnDisabled]}
                      disabled={isOutOfStock}
                      onPress={() => onQuickBuy(item)}
                      activeOpacity={0.85}
                    >
                      <Icon name="zap" size={13} color="#FFFFFF" variant="filled" />
                      <Text style={styles.instantBuyText}>
                        {isOutOfStock ? 'หมด' : 'หยิบทันที'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="package" size={26} color="#EA580C" variant="filled" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.emptyMainText}>ยังไม่มีเมนู Grab & Go ในโรงอาหารนี้</Text>
            <Text style={styles.emptySubText}>
              เมื่อร้านค้าปรุงอาหารเสร็จพร้อมหยิบและเปิดโหมด Grab & Go จะปรากฏที่นี่ทันที (0 นาที ไม่ต้องรอคิว)
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF7ED', // Warm peach-orange background to immediately stand out
    marginHorizontal: 16,
    marginVertical: 14,
    borderRadius: 22,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: '#FED7AA', // High contrast border
    overflow: 'hidden', // Prevents any badge or text from overflowing the rounded box
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  expressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C', // Bold Vivid Amber/Orange
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  expressBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    ...TYPOGRAPHY.black,
    letterSpacing: 0.3,
  },
  zeroWaitPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexShrink: 1,
  },
  zeroWaitText: {
    color: '#C2410C',
    fontSize: 10,
    ...TYPOGRAPHY.bold,
  },
  mainTitle: {
    color: '#7C2D12', // Deep brown-red for maximum contrast
    fontSize: 19,
    ...TYPOGRAPHY.black,
    marginBottom: 2,
  },
  subTitle: {
    color: '#9A3412',
    fontSize: 12,
    lineHeight: 16,
    ...TYPOGRAPHY.medium,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardActive: {
    borderColor: '#FDBA74',
  },
  cardDisabled: {
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  imageBannerWrapper: {
    width: '100%',
    height: 115,
    backgroundColor: '#FED7AA',
    position: 'relative',
    overflow: 'hidden',
  },
  foodImageBanner: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: '#9A3412',
    fontSize: 10,
    ...TYPOGRAPHY.bold,
    marginTop: 4,
  },
  bannerBadgeRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fastLaneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EA580C',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  fastLaneBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    ...TYPOGRAPHY.black,
  },
  stockBadgeOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  stockTextOverlay: {
    color: '#B45309',
    fontSize: 10,
    ...TYPOGRAPHY.bold,
  },
  textRed: {
    color: '#DC2626',
  },
  cardContent: {
    padding: 12,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    ...TYPOGRAPHY.bold,
    marginBottom: 4,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  spotTag: {
    color: '#EA580C',
    fontSize: 11,
    ...TYPOGRAPHY.bold,
  },
  canteenTag: {
    color: '#64748B',
    fontSize: 10,
    ...TYPOGRAPHY.medium,
  },
  bottomActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 6,
  },
  priceLabel: {
    color: '#94A3B8',
    fontSize: 9,
    ...TYPOGRAPHY.medium,
  },
  priceValue: {
    color: '#EA580C',
    fontSize: 18,
    ...TYPOGRAPHY.black,
  },
  instantBuyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  btnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
  },
  instantBuyText: {
    color: '#FFFFFF',
    fontSize: 12,
    ...TYPOGRAPHY.black,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderStyle: 'dashed',
    gap: 12,
  },
  emptyIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMainText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginBottom: 2,
  },
  emptySubText: {
    ...TYPOGRAPHY.regular,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
});

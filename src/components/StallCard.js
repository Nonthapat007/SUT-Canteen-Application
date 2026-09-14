import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT_FAMILY, TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';

export default function StallCard({ stall, onSelect }) {
  const isOpen = stall.isOpen !== false; // true by default, false when closed

  return (
    <TouchableOpacity
      style={[styles.card, !isOpen && styles.cardClosed]}
      onPress={() => onSelect(stall)}
      activeOpacity={isOpen ? 0.9 : 0.8}
    >
      {/* Food Photo Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              stall.imageUrl ||
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          }}
          style={[styles.foodImage, !isOpen && styles.foodImageClosed]}
          resizeMode="cover"
        />

        {/* Black & White Dark Overlay & Center Closed Badge */}
        {!isOpen && (
          <View style={styles.closedImageOverlay}>
            <View style={styles.closedPillBadge}>
              <Icon name="lock" size={13} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.closedPillText}>ร้านปิดชั่วคราว (Closed)</Text>
            </View>
          </View>
        )}

        {/* Top-Left: "● Open" or "● Closed" Badge */}
        {isOpen ? (
          <View style={styles.openBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.openText}>Open</Text>
          </View>
        ) : (
          <View style={styles.closedBadge}>
            <View style={styles.redDot} />
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}

        {/* Top-Right: Optional "FASTEST" Badge (only when open) */}
        {isOpen && stall.fastest && (
          <View style={styles.fastestBadge}>
            <Text style={styles.fastestText}>FASTEST</Text>
          </View>
        )}

        {/* Bottom overlay badges */}
        {isOpen ? (
          <View style={styles.imageBottomRow}>
            <View style={styles.timePillBadge}>
              <Icon name="clock" size={12} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.timePillText}>~{stall.waitMinutes} นาที</Text>
            </View>
            <View style={styles.queuePillBadge}>
              <Icon name="users" size={12} color={COLORS.textPrimary} strokeWidth={2.2} />
              <Text style={styles.queuePillText}>1 คิวอยู่ก่อน</Text>
            </View>
          </View>
        ) : (
          <View style={styles.imageBottomRow}>
            <View style={styles.closedNoticePill}>
              <Text style={styles.closedNoticeText}>งดรับออเดอร์ในขณะนี้</Text>
            </View>
          </View>
        )}
      </View>

      {/* Card Info & + Action */}
      <View style={styles.infoRow}>
        <View style={styles.textCol}>
          <Text style={[styles.stallTitle, !isOpen && styles.stallTitleClosed]}>
            {stall.name}
          </Text>
          
          <View style={styles.metaRow}>
            {isOpen ? (
              <>
                <Icon name="clock" size={13} color={COLORS.textSecondary} strokeWidth={2} />
                <Text style={styles.timeText}>{stall.waitMinutes} mins</Text>
                <Icon name="star" size={13} color="#F59E0B" variant="filled" />
                <Text style={styles.ratingText}>{stall.rating}</Text>
              </>
            ) : (
              <Text style={styles.closedMetaText}>ปิดให้บริการชั่วคราว • พักเบรก</Text>
            )}
          </View>
        </View>

        {/* Circular Action Button */}
        <TouchableOpacity
          style={[styles.plusBtn, !isOpen && styles.plusBtnClosed]}
          onPress={() => onSelect(stall)}
          activeOpacity={isOpen ? 0.8 : 0.6}
        >
          <Icon
            name={isOpen ? 'plus' : 'close'}
            size={isOpen ? 20 : 16}
            color={isOpen ? COLORS.textWhite : '#94A3B8'}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardClosed: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.88,
  },
  imageContainer: {
    width: '100%',
    height: 168,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  foodImageClosed: {
    opacity: 0.55,
    // @ts-ignore Web CSS filter for black & white grayscale
    filter: 'grayscale(100%) contrast(90%)',
  },
  closedImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  closedPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  closedPillText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  openBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 3,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  openText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    fontSize: 11,
  },
  closedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 3,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  closedText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 11,
  },
  fastestBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 3,
  },
  fastestText: {
    ...TYPOGRAPHY.black,
    color: COLORS.textWhite,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  imageBottomRow: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    zIndex: 3,
  },
  timePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 1,
  },
  timePillText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    fontSize: 11,
  },
  queuePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexShrink: 1,
  },
  queuePillText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    fontSize: 11,
  },
  closedNoticePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  closedNoticeText: {
    ...TYPOGRAPHY.bold,
    color: '#CBD5E1',
    fontSize: 11,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textCol: {
    flex: 1,
  },
  stallTitle: {
    ...TYPOGRAPHY.extraBold,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginBottom: 4,
  },
  stallTitleClosed: {
    color: '#64748B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    ...TYPOGRAPHY.medium,
    color: COLORS.textSecondary,
    fontSize: 12,
    marginRight: 8,
  },
  ratingText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  closedMetaText: {
    ...TYPOGRAPHY.medium,
    color: '#94A3B8',
    fontSize: 12,
  },
  plusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  plusBtnClosed: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
});

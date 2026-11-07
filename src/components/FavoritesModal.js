// SUT Canteen Express - Favorites Modal (Dishes & Stalls Dual System)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';
import { getFoodImageFallback, getStallImageFallback } from '../utils/imageUtils';

export default function FavoritesModal({
  visible,
  onClose,
  favoriteDishes = [],
  favoriteStallIds = [],
  stalls = [],
  onQuickOrderDish,
  onSelectStall,
  onToggleFavoriteDish,
  onToggleFavoriteStall,
}) {
  const [activeTab, setActiveTab] = useState('dishes'); // 'dishes' | 'stalls'

  if (!visible) return null;

  // Resolve favorite stall objects from IDs
  const resolvedFavoriteStalls = stalls.filter((s) => favoriteStallIds.includes(s.id));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Icon name="heart" size={18} color="#E11D48" variant="filled" style={{ marginRight: 6 }} />
              <Text style={styles.modalTitle}>รายการโปรดของคุณ</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.closeBtn}
            >
              <Icon name="close" size={18} color="#64748B" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Dual Segment Tabs (Dishes vs Stalls) */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'dishes' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('dishes')}
              activeOpacity={0.8}
            >
              <Icon
                name="utensils"
                size={13}
                color={activeTab === 'dishes' ? COLORS.primary : COLORS.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'dishes' && styles.segmentTextActive,
                ]}
              >
                เมนูอาหาร ({favoriteDishes.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'stalls' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('stalls')}
              activeOpacity={0.8}
            >
              <Icon
                name="store"
                size={13}
                color={activeTab === 'stalls' ? COLORS.primary : COLORS.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'stalls' && styles.segmentTextActive,
                ]}
              >
                ร้านค้า ({resolvedFavoriteStalls.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content ScrollView */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* TAB 1: FAVORITE DISHES */}
            {activeTab === 'dishes' && (
              <>
                {favoriteDishes.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                      <Icon name="heart" size={32} color="#CBD5E1" strokeWidth={1.6} />
                    </View>
                    <Text style={styles.emptyTitle}>ยังไม่มีเมนูโปรด</Text>
                    <Text style={styles.emptyDesc}>
                      กดที่ไอคอนหัวใจบนเมนูอาหารที่คุณชอบ เพื่อบันทึกไว้สำหรับกด "สั่งด่วน" ได้ทันที
                    </Text>
                  </View>
                ) : (
                  favoriteDishes.map((fav) => {
                    const fallbackImg = getFoodImageFallback(fav.name);
                    const imageUri = fav.imageUrl || fallbackImg;

                    return (
                      <View key={fav.id} style={styles.itemCard}>
                        {/* Food Image */}
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.itemImage}
                          resizeMode="cover"
                        />

                        {/* Details */}
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {fav.name}
                          </Text>
                          <View style={styles.stallRow}>
                            <Icon name="store" size={10} color="#64748B" strokeWidth={2} style={{ marginRight: 3 }} />
                            <Text style={styles.stallText} numberOfLines={1}>
                              {fav.stallName || 'ร้านอาหาร มทส.'}
                            </Text>
                          </View>
                          <Text style={styles.itemPrice}>฿{fav.price}</Text>
                        </View>

                        {/* Action Column */}
                        <View style={styles.actionCol}>
                          {/* Quick Order Button */}
                          <TouchableOpacity
                            style={styles.quickOrderBtn}
                            onPress={() => {
                              if (onQuickOrderDish) {
                                onQuickOrderDish(fav);
                              }
                            }}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.quickOrderText}>+ สั่งด่วน</Text>
                          </TouchableOpacity>

                          {/* Remove Favorite Button */}
                          {onToggleFavoriteDish && (
                            <TouchableOpacity
                              style={styles.removeFavBtn}
                              onPress={() => onToggleFavoriteDish(fav)}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                              activeOpacity={0.7}
                            >
                              <Icon name="heart" size={14} color="#E11D48" variant="filled" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}

            {/* TAB 2: FAVORITE STALLS */}
            {activeTab === 'stalls' && (
              <>
                {resolvedFavoriteStalls.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                      <Icon name="store" size={32} color="#CBD5E1" strokeWidth={1.6} />
                    </View>
                    <Text style={styles.emptyTitle}>ยังไม่มีร้านโปรด</Text>
                    <Text style={styles.emptyDesc}>
                      กดที่ไอคอนหัวใจบนการ์ดร้านค้า เพื่อติดตามสถานะเปิด/ปิด และเวลาคิวของร้านประจำ
                    </Text>
                  </View>
                ) : (
                  resolvedFavoriteStalls.map((stall) => {
                    const fallbackImg = getStallImageFallback(stall.thaiName || stall.name);
                    const imageUri = stall.imageUrl || fallbackImg;
                    const isOpen = stall.isOpen !== false;

                    return (
                      <View key={stall.id} style={styles.itemCard}>
                        {/* Stall Image */}
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.itemImage}
                          resizeMode="cover"
                        />

                        {/* Details */}
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {stall.thaiName || stall.name}
                          </Text>
                          <View style={styles.stallRow}>
                            <Icon name="location" size={10} color="#64748B" strokeWidth={2} style={{ marginRight: 3 }} />
                            <Text style={styles.stallText} numberOfLines={1}>
                              {stall.canteenName || 'โรงอาหาร มทส.'}
                            </Text>
                          </View>

                          {/* Status and Wait Time */}
                          <View style={styles.stallMetaRow}>
                            <View style={[styles.statusDot, isOpen ? styles.statusOpen : styles.statusClosed]} />
                            <Text style={[styles.statusText, isOpen ? styles.textOpen : styles.textClosed]}>
                              {isOpen ? 'Open' : 'Closed'}
                            </Text>
                            <Text style={styles.metaDivider}>•</Text>
                            <Icon name="clock" size={10} color="#64748B" style={{ marginRight: 2 }} />
                            <Text style={styles.waitTimeText}>~{stall.waitMinutes || 5} นาที</Text>
                          </View>
                        </View>

                        {/* Action Column */}
                        <View style={styles.actionCol}>
                          <TouchableOpacity
                            style={[styles.viewStallBtn, !isOpen && styles.viewStallBtnClosed]}
                            onPress={() => {
                              if (onSelectStall) {
                                onSelectStall(stall);
                              }
                            }}
                            activeOpacity={0.85}
                          >
                            <Text style={[styles.viewStallText, !isOpen && styles.viewStallTextClosed]}>
                              {isOpen ? 'เข้าร้าน' : 'ร้านปิด'}
                            </Text>
                          </TouchableOpacity>

                          {/* Remove Favorite Button */}
                          {onToggleFavoriteStall && (
                            <TouchableOpacity
                              style={styles.removeFavBtn}
                              onPress={() => onToggleFavoriteStall(stall)}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                              activeOpacity={0.7}
                            >
                              <Icon name="heart" size={14} color="#E11D48" variant="filled" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
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
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    ...TYPOGRAPHY.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Dual Segment Tabs
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentText: {
    ...TYPOGRAPHY.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    ...TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  scrollArea: {
    maxHeight: 380,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 8,
  },
  // Item Card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  itemImage: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  itemName: {
    ...TYPOGRAPHY.bold,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  stallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  stallText: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  itemPrice: {
    ...TYPOGRAPHY.bold,
    fontSize: 13,
    color: COLORS.primary,
  },
  stallMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusOpen: {
    backgroundColor: '#10B981',
  },
  statusClosed: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    ...TYPOGRAPHY.bold,
    fontSize: 10,
  },
  textOpen: {
    color: '#059669',
  },
  textClosed: {
    color: '#DC2626',
  },
  metaDivider: {
    marginHorizontal: 4,
    color: '#94A3B8',
    fontSize: 10,
  },
  waitTimeText: {
    ...TYPOGRAPHY.regular,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    marginLeft: 8,
  },
  quickOrderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  quickOrderText: {
    ...TYPOGRAPHY.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  viewStallBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 58, 0.3)',
  },
  viewStallBtnClosed: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  viewStallText: {
    ...TYPOGRAPHY.bold,
    fontSize: 11,
    color: COLORS.primary,
  },
  viewStallTextClosed: {
    color: '#94A3B8',
  },
  removeFavBtn: {
    padding: 3,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    ...TYPOGRAPHY.bold,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptyDesc: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 240,
  },
});


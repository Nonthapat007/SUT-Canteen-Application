import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { FONT_FAMILY, TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';
import dbService from '../services/dbService';

export default function StallDetailModal({
  visible,
  stall,
  onClose,
  onSelectMenu,
}) {
  const [liveMenus, setLiveMenus] = useState(stall?.menus || []);

  const fetchLiveMenus = async () => {
    if (!stall?.id) return;
    try {
      const freshMenus = await dbService.getMenusByStall(stall.id);
      if (Array.isArray(freshMenus)) {
        setLiveMenus(freshMenus);
      }
    } catch (err) {
      console.warn('Failed to fetch live menus in StallDetailModal:', err);
    }
  };

  useEffect(() => {
    if (visible && stall?.id) {
      setLiveMenus(stall.menus || []);
      fetchLiveMenus();

      const unsubscribe = dbService.subscribeToMenus(() => {
        fetchLiveMenus();
      });

      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [visible, stall?.id, stall?.menus]);

  if (!visible || !stall) return null;

  const isOpen = stall.isOpen !== false;
  const menus = liveMenus;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Cover Header Image */}
          <View style={styles.coverWrapper}>
            <Image
              source={{
                uri:
                  stall.imageUrl ||
                  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
              }}
              style={styles.coverImage}
              resizeMode="cover"
            />

            {/* Dynamic Rich SVG LinearGradient Overlay for 100% legibility */}
            <View style={styles.gradientOverlay} pointerEvents="none">
              <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="coverGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#0F172A" stopOpacity="0.4" />
                    <Stop offset="45%" stopColor="#0F172A" stopOpacity="0.55" />
                    <Stop offset="80%" stopColor="#0F172A" stopOpacity="0.88" />
                    <Stop offset="100%" stopColor="#0F172A" stopOpacity="0.98" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#coverGrad)" />
              </Svg>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close" size={20} color={COLORS.textWhite} strokeWidth={2.5} />
            </TouchableOpacity>

            {/* Header Shop Info inside Translucent Contrast Card */}
            <View style={styles.coverInfo}>
              <View style={styles.coverInfoCard}>
                <View style={styles.badgeRow}>
                  <View style={[styles.statusPill, isOpen ? styles.pillGreen : styles.pillRed]}>
                    <View style={[styles.dot, isOpen ? styles.dotGreen : styles.dotRed]} />
                    <Text style={[styles.pillText, isOpen ? styles.textGreen : styles.textRed]}>
                      {isOpen ? 'เปิดให้บริการ' : 'ปิดชั่วคราว'}
                    </Text>
                  </View>

                  <View style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{stall.category || 'อาหารตามสั่ง'}</Text>
                  </View>
                </View>

                <Text style={styles.shopTitle} numberOfLines={2}>
                  {stall.thaiName || stall.name}
                </Text>

                <View style={styles.metaRow}>
                  <Icon name="clock" size={13} color="#F1F5F9" strokeWidth={2} />
                  <Text style={styles.metaText}>รอประมาณ ~{stall.waitMinutes || 5} นาที</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Icon name="star" size={13} color="#FBBF24" variant="filled" />
                  <Text style={styles.metaText}>{stall.rating || '5.0'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Menu Items Section */}
          <View style={styles.contentHeader}>
            <Text style={styles.sectionTitle}>
              รายการอาหาร ({menus.length} เมนู)
            </Text>
            <Text style={styles.sectionSub}>แตะที่เมนูเพื่อเลือกความเผ็ดและตัวเลือกเสริม</Text>
          </View>

          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            {menus.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Icon name="menu" size={32} color={COLORS.primary} strokeWidth={2} />
                </View>
                <Text style={styles.emptyTitle}>ร้านนี้ยังไม่มีรายการอาหาร</Text>
                <Text style={styles.emptySub}>
                  ร้านค้ายังไม่ได้ลงทะเบียนเมนูอาหารในระบบ โปรดกลับมาตรวจสอบอีกครั้ง
                </Text>
              </View>
            ) : (
              <View style={styles.menuList}>
                {menus.map((item) => {
                  const isAvailable = item.available !== false;
                  const canOrder = isOpen && isAvailable;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.menuCard, !canOrder && styles.menuCardDisabled]}
                      onPress={() => {
                        if (canOrder) {
                          onSelectMenu(item);
                        }
                      }}
                      activeOpacity={canOrder ? 0.75 : 1}
                    >
                      {item.imageUrl || item.image ? (
                        <Image
                          source={{ uri: item.imageUrl || item.image }}
                          style={[styles.menuImg, !canOrder && styles.menuImgDisabled]}
                        />
                      ) : (
                        <View style={[styles.noImageMenuImg, !canOrder && styles.menuImgDisabled]}>
                          <Icon name="camera" size={22} color="#94A3B8" strokeWidth={1.8} />
                          <View style={styles.noImageMenuBadge}>
                            <Text style={styles.noImageMenuBadgeText}>NO IMAGE</Text>
                          </View>
                        </View>
                      )}

                      <View style={styles.menuInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={[styles.menuName, !canOrder && styles.textDisabled]}>
                            {item.name}
                          </Text>
                          {item.popular && (
                            <View style={styles.popularBadge}>
                              <Text style={styles.popularText}>แนะนำ</Text>
                            </View>
                          )}
                        </View>

                        {item.desc ? (
                          <Text style={styles.menuDesc} numberOfLines={2}>
                            {item.desc}
                          </Text>
                        ) : null}

                        <View style={styles.menuMetaRow}>
                          <Icon name="clock" size={11} color={COLORS.textMuted} strokeWidth={2} />
                          <Text style={styles.menuPrep}>~{item.prepTime || 5} นาที</Text>
                        </View>

                        <Text style={[styles.menuPrice, !canOrder && styles.textDisabled]}>
                          ฿{item.price}
                        </Text>
                      </View>

                      {/* Right Action Button */}
                      <View style={styles.actionCol}>
                        {canOrder ? (
                          <View style={styles.orderBtn}>
                            <Icon name="plus" size={13} color={COLORS.textWhite} strokeWidth={2.5} />
                            <Text style={styles.orderBtnText}>สั่ง</Text>
                          </View>
                        ) : (
                          <View style={styles.outOfStockBadge}>
                            <Text style={styles.outOfStockText}>
                              {!isOpen ? 'ร้านปิด' : 'หมด'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '92%',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  coverWrapper: {
    height: 200,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  coverInfo: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    zIndex: 2,
  },
  coverInfoCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.68)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  pillRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotRed: {
    backgroundColor: '#EF4444',
  },
  pillText: {
    ...TYPOGRAPHY.bold,
    fontSize: 11,
  },
  textGreen: {
    color: '#A7F3D0',
  },
  textRed: {
    color: '#FECDD3',
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagPillText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 11,
  },
  shopTitle: {
    ...TYPOGRAPHY.black,
    fontSize: 19,
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...TYPOGRAPHY.medium,
    fontSize: 12,
    color: '#F1F5F9',
  },
  metaDot: {
    color: '#94A3B8',
    fontSize: 10,
  },
  contentHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    ...TYPOGRAPHY.extraBold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  sectionSub: {
    ...TYPOGRAPHY.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  menuList: {
    gap: 12,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  menuCardDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.surfaceSubtle,
  },
  menuImg: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSubtle,
  },
  menuImgDisabled: {
    opacity: 0.5,
  },
  noImageMenuImg: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  noImageMenuBadge: {
    backgroundColor: '#64748B',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 3,
  },
  noImageMenuBadgeText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  menuInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  menuName: {
    ...TYPOGRAPHY.extraBold,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
  popularBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  popularText: {
    ...TYPOGRAPHY.bold,
    color: '#EA580C',
    fontSize: 10,
  },
  menuDesc: {
    ...TYPOGRAPHY.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  menuMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  menuPrep: {
    ...TYPOGRAPHY.medium,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  menuPrice: {
    ...TYPOGRAPHY.black,
    fontSize: 16,
    color: COLORS.primary,
  },
  actionCol: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  orderBtnText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    fontSize: 13,
  },
  outOfStockBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  outOfStockText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  emptyContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    ...TYPOGRAPHY.extraBold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    ...TYPOGRAPHY.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

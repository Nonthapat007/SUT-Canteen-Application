// Merchant Menu Management Screen connected to Supabase Realtime & Mood & Tone Design System
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Icon from '../../components/common/Icon';
import ModernSwitch from '../../components/common/ModernSwitch';
import CreateMenuModal from '../../components/merchant/CreateMenuModal';
import EditMenuModal from '../../components/merchant/EditMenuModal';
import dbService from '../../services/dbService';

export default function MerchantMenuScreen({
  shopName = 'ร้านค้าของคุณ',
  currentStall = null,
  onOpenCreateStall = null,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Load menus from Supabase
  const loadMenus = async () => {
    if (!currentStall?.id) {
      setMenuItems([]);
      return;
    }
    try {
      setLoading(true);
      const data = await dbService.getMenusByStall(currentStall.id);
      setMenuItems(data);
    } catch (err) {
      console.error('Error loading menus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();

    // Subscribe to realtime changes in menus
    const unsubscribe = dbService.subscribeToMenus(() => {
      loadMenus();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentStall?.id]);

  const toggleAvailability = async (id, currentVal) => {
    // Optimistic update
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !currentVal } : item
      )
    );

    try {
      await dbService.toggleMenuAvailable(id, !currentVal);
    } catch (err) {
      console.error('Failed to update menu status in Supabase:', err);
      // Revert on error
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, available: currentVal } : item
        )
      );
    }
  };

  const handleDeleteMenu = (item) => {
    const doDelete = async () => {
      try {
        await dbService.deleteMenu(item.id);
        setMenuItems((prev) => prev.filter((m) => m.id !== item.id));
      } catch (err) {
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบเมนูได้: ' + err.message);
      }
    };

    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm(`ต้องการลบเมนู "${item.name}" ใช่หรือไม่?`)) {
        doDelete();
      }
    } else {
      Alert.alert('ยืนยันการลบ', `ต้องการลบเมนู "${item.name}" ใช่หรือไม่?`, [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ลบเมนู', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const categories = ['ทั้งหมด', 'ก๋วยเตี๋ยว', 'ข้าว', 'เครื่องดื่ม', 'ของทานเล่น'];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      activeCategory === 'ทั้งหมด' ||
      (item.category && item.category === activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Header matching Image 2 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>จัดการเมนู</Text>
          <Text style={styles.headerSub}>
            {currentStall ? currentStall.thaiName || currentStall.name : shopName}
          </Text>
        </View>

        {currentStall && (
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.85}
          >
            <Icon name="plus" size={16} color={COLORS.textWhite} strokeWidth={2.5} style={{ marginRight: 4 }} />
            <Text style={styles.headerAddBtnText}>เพิ่มเมนู</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* If no stall exists yet */}
        {!currentStall ? (
          <View style={styles.noStallCard}>
            <View style={styles.noStallIconCircle}>
              <Icon name="store" size={36} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={styles.noStallTitle}>ยังไม่มีข้อมูลร้านค้า</Text>
            <Text style={styles.noStallSubtitle}>
              คุณต้องลงทะเบียนเปิดร้านค้าในโรงอาหาร มทส. ก่อน จึงจะสามารถจัดการเมนูอาหารได้
            </Text>
            {onOpenCreateStall && (
              <TouchableOpacity
                style={styles.createStallBtn}
                onPress={onOpenCreateStall}
                activeOpacity={0.85}
              >
                <Icon name="plus" size={18} color={COLORS.textWhite} strokeWidth={2.5} style={{ marginRight: 6 }} />
                <Text style={styles.createStallBtnText}>ลงทะเบียนเปิดร้านค้าทันที</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {/* Search Bar */}
            <View style={styles.searchWrapper}>
              <Icon name="search" size={18} color={COLORS.textSecondary} strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="ค้นหาเมนู..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Category Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                    onPress={() => setActiveCategory(cat)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isActive ? styles.categoryTextActive : styles.categoryTextInactive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Menu Items List */}
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>กำลังโหลดเมนูอาหารจากฐานข้อมูล...</Text>
              </View>
            ) : filteredItems.length === 0 ? (
              <View style={styles.emptyMenuBox}>
                <View style={styles.emptyIconCircle}>
                  <Icon name="menu" size={32} color={COLORS.primary} strokeWidth={2} />
                </View>
                <Text style={styles.emptyMenuTitle}>ยังไม่มีรายการอาหาร</Text>
                <Text style={styles.emptyMenuSub}>
                  ร้านของคุณยังไม่มีเมนูอาหาร กดปุ่ม "เพิ่มเมนู" ด้านล่างเพื่อเพิ่มอาหารจานแรกเลย!
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => setShowAddModal(true)}
                  activeOpacity={0.85}
                >
                  <Icon name="plus" size={16} color={COLORS.textWhite} strokeWidth={2.5} style={{ marginRight: 6 }} />
                  <Text style={styles.emptyAddBtnText}>เพิ่มเมนูอาหารแรก</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.menuList}>
                {filteredItems.map((item) => (
                  <View key={item.id} style={styles.menuCard}>
                    <TouchableOpacity
                      onPress={() => setEditingItem(item)}
                      style={styles.menuCardLeft}
                      activeOpacity={0.8}
                    >
                      {item.imageUrl || item.image ? (
                        <Image
                          source={{ uri: item.imageUrl || item.image }}
                          style={styles.menuThumb}
                        />
                      ) : (
                        <View style={styles.noImageThumb}>
                          <Icon name="camera" size={20} color="#94A3B8" strokeWidth={1.8} />
                          <View style={styles.noImageThumbBadge}>
                            <Text style={styles.noImageThumbBadgeText}>NO IMAGE</Text>
                          </View>
                        </View>
                      )}

                      <View style={styles.menuInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={styles.menuName}>{item.name}</Text>
                          {item.popular && (
                            <View style={styles.popularBadge}>
                              <Text style={styles.popularBadgeText}>แนะนำ</Text>
                            </View>
                          )}
                          {item.isGrabAndGo && (
                            <View style={styles.grabAndGoBadge}>
                              <Text style={styles.grabAndGoBadgeText}>⚡ Grab & Go</Text>
                            </View>
                          )}
                          {!item.imageUrl && (
                            <View style={styles.noPhotoTag}>
                              <Text style={styles.noPhotoTagText}>+ ใส่รูปภาพ</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.menuDesc} numberOfLines={1}>
                          {item.desc || `ใช้เวลาปรุงประมาณ ~${item.prepTime || 5} นาที`}
                        </Text>
                        <Text style={styles.menuPrice}>฿{item.price}</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Actions: Edit, Delete & Switch */}
                    <View style={styles.actionsCol}>
                      <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                          onPress={() => setEditingItem(item)}
                          style={styles.editBtn}
                          activeOpacity={0.7}
                        >
                          <Icon name="pencil" size={14} color={COLORS.primary} strokeWidth={2.2} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleDeleteMenu(item)}
                          style={styles.deleteBtn}
                          activeOpacity={0.7}
                        >
                          <Icon name="close" size={15} color={COLORS.textSecondary} strokeWidth={2} />
                        </TouchableOpacity>
                      </View>

                      <ModernSwitch
                        value={item.available}
                        onValueChange={() => toggleAvailability(item.id, item.available)}
                        activeTrackColor={COLORS.primary}
                        size="small"
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button (+) */}
      {currentStall && (
        <TouchableOpacity
          style={styles.fabBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <Icon name="plus" size={26} color={COLORS.textWhite} strokeWidth={2.5} />
        </TouchableOpacity>
      )}

      {/* Create Menu Modal */}
      {currentStall && (
        <CreateMenuModal
          visible={showAddModal}
          stallId={currentStall.id}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => loadMenus()}
        />
      )}

      {/* Edit Menu Modal */}
      <EditMenuModal
        visible={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSuccess={(updated) => {
          setMenuItems((prev) =>
            prev.map((it) => (it.id === updated.id ? { ...it, ...updated } : it))
          );
          setEditingItem(null);
          loadMenus();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    ...TYPOGRAPHY.black,
    marginBottom: 2,
  },
  headerSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    ...TYPOGRAPHY.medium,
  },
  headerAddBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  headerAddBtnText: {
    color: COLORS.textWhite,
    fontSize: 13,
    ...TYPOGRAPHY.bold,
  },
  scrollArea: {
    flex: 1,
  },
  noStallCard: {
    backgroundColor: COLORS.surface,
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  noStallIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noStallTitle: {
    fontSize: 18,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  noStallSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createStallBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  createStallBtnText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    height: '100%',
    marginLeft: 8,
  },
  categoryRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  categoryTextInactive: {
    color: COLORS.textSecondary,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyMenuBox: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyMenuTitle: {
    fontSize: 16,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptyMenuSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyAddBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: COLORS.textWhite,
    fontSize: 13,
    ...TYPOGRAPHY.bold,
  },
  menuList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  menuCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuThumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
  },
  noImageThumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  noImageThumbBadge: {
    backgroundColor: '#64748B',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 3,
  },
  noImageThumbBadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    ...TYPOGRAPHY.bold,
    letterSpacing: 0.5,
  },
  menuInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  menuName: {
    fontSize: 14,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  popularBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  popularBadgeText: {
    color: '#EA580C',
    fontSize: 10,
    ...TYPOGRAPHY.bold,
  },
  grabAndGoBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  grabAndGoBadgeText: {
    color: '#059669',
    fontSize: 10,
    ...TYPOGRAPHY.bold,
  },
  noPhotoTag: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  noPhotoTagText: {
    color: '#2563EB',
    fontSize: 10,
    ...TYPOGRAPHY.bold,
  },
  menuDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  menuPrice: {
    fontSize: 14,
    ...TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  actionsCol: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 12,
    marginLeft: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});

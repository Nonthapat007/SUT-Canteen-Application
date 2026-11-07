// Search Screen for Mobile App with live Supabase dishes & modern Food Delivery UX/UI
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Icon from '../../components/common/Icon';
import { getFoodImageFallback } from '../../utils/imageUtils';
import { parseMenuDescription } from '../../services/dbService';
import { SUT_CANTEENS, SUT_BUILDINGS } from '../../constants/campusData';
import FoodItemModal from '../../components/FoodItemModal';
import ClassSyncModal from '../../components/ClassSyncModal';

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'popular', label: 'แนะนำ', icon: 'flame', iconColor: '#FF5E3A' },
  { id: 'grab', label: 'พร้อมหยิบ', icon: 'zap', iconColor: '#10B981' },
  { id: 'rice', label: 'ข้าว/ตามสั่ง' },
  { id: 'noodle', label: 'ก๋วยเตี๋ยว' },
  { id: 'drink', label: 'เครื่องดื่ม' },
  { id: 'dessert', label: 'ของหวาน' },
];

export default function SearchScreen({
  stalls = [],
  storeState,
  storeActions,
  currentUser,
  onSelectStall,
  onRequireTopUp,
  onNavigateTracking,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Ordering Modals state
  const [selectedDish, setSelectedDish] = useState(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [customOptions, setCustomOptions] = useState([]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [insufficientModalData, setInsufficientModalData] = useState(null);

  // Extract all dishes across live stalls & canteens
  const allDishes = useMemo(() => {
    const dishes = [];
    (stalls || []).forEach((stall) => {
      const canteen = SUT_CANTEENS.find((c) => c.id === stall.canteenId);
      const canteenShort = canteen?.shortName || canteen?.thaiName || '';
      (stall.menus || []).forEach((menu) => {
        const parsed = parseMenuDescription(menu.description || menu.desc, menu.thaiName || menu.name);
        const foodImage =
          menu.imageUrl ||
          menu.image ||
          getFoodImageFallback(menu.thaiName || menu.name);

        dishes.push({
          ...menu,
          thaiName: menu.thaiName || menu.name,
          cleanDesc: parsed.desc || '',
          options: parsed.options || [],
          isGrabAndGo: menu.isGrabAndGo || parsed.isGrabAndGo || false,
          isPopular: menu.isPopular || menu.popular || false,
          foodImage,
          stall,
          canteen,
          canteenShort,
        });
      });
    });
    return dishes;
  }, [stalls]);

  // Filter dishes by search text and category chips
  const filteredDishes = useMemo(() => {
    return allDishes.filter((dish) => {
      // 1. Category Filter
      if (selectedCategory === 'popular' && !dish.isPopular) return false;
      if (selectedCategory === 'grab' && !dish.isGrabAndGo) return false;

      const name = (dish.thaiName || dish.name || '').toLowerCase();
      const cat = (dish.category || dish.stall?.category || '').toLowerCase();

      if (selectedCategory === 'noodle') {
        const isNoodle =
          name.includes('เตี๋ยว') ||
          name.includes('เส้น') ||
          name.includes('บะหมี่') ||
          name.includes('ต้มยำ') ||
          name.includes('มาม่า') ||
          name.includes('ราเมน') ||
          cat.includes('noodle');
        if (!isNoodle) return false;
      }

      if (selectedCategory === 'rice') {
        const isRice =
          name.includes('ข้าว') ||
          name.includes('กะเพรา') ||
          name.includes('ผัด') ||
          name.includes('ทอด') ||
          name.includes('ลาบ') ||
          name.includes('ยำ') ||
          cat.includes('made-to-order');
        if (!isRice) return false;
      }

      if (selectedCategory === 'drink') {
        const isDrink =
          name.includes('น้ำ') ||
          name.includes('ชา') ||
          name.includes('กาแฟ') ||
          name.includes('นม') ||
          name.includes('ปั่น') ||
          name.includes('โซดา') ||
          cat.includes('beverage');
        if (!isDrink) return false;
      }

      if (selectedCategory === 'dessert') {
        const isDessert =
          name.includes('ขนม') ||
          name.includes('ถ้วย') ||
          name.includes('หวาน') ||
          name.includes('เค้ก') ||
          cat.includes('dessert');
        if (!isDessert) return false;
      }

      // 2. Search Text Filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        name.includes(q) ||
        (dish.cleanDesc && dish.cleanDesc.toLowerCase().includes(q)) ||
        (dish.stall?.name && dish.stall.name.toLowerCase().includes(q)) ||
        (dish.stall?.thaiName && dish.stall.thaiName.toLowerCase().includes(q)) ||
        (dish.canteenShort && dish.canteenShort.toLowerCase().includes(q))
      );
    });
  }, [allDishes, searchQuery, selectedCategory]);

  // Click on a dish to order
  const handleSelectDish = (dish) => {
    if (dish.stall?.isOpen === false) {
      Alert.alert(
        'ร้านปิดให้บริการ',
        `ร้าน "${dish.stall.thaiName || dish.stall.name}" ปิดให้บริการอยู่ในขณะนี้`
      );
      return;
    }
    setSelectedDish(dish);
    setShowFoodModal(true);
  };

  // Proceed from Food options to Class sync
  const handleProceedToSync = ({ menuItem, customOptions: options, specialNote, quantity = 1 }) => {
    setCustomOptions(options);
    setSpecialNotes(specialNote || '');
    setSelectedQuantity(quantity);
    setShowFoodModal(false);
    setShowSyncModal(true);
  };

  // Confirm order with Predictive Slotting
  const handleConfirmPredictiveOrder = (orderParams) => {
    const requiredAmount = orderParams.totalAmount || 0;
    const currentBalance = storeState?.walletBalance || 0;

    if (currentBalance < requiredAmount) {
      setShowSyncModal(false);
      setShowFoodModal(false);
      setInsufficientModalData({
        requiredAmount,
        currentBalance,
        itemName: orderParams.items?.[0]?.name || selectedDish?.thaiName || 'รายการอาหาร',
      });
      return;
    }

    if (storeActions?.createPredictiveOrder) {
      storeActions.createPredictiveOrder({
        ...orderParams,
        currentUser,
      });
      setShowSyncModal(false);
      setShowFoodModal(false);
      if (typeof onNavigateTracking === 'function') {
        onNavigateTracking();
      }
    } else if (typeof onSelectStall === 'function') {
      setShowSyncModal(false);
      setShowFoodModal(false);
      onSelectStall(selectedDish?.stall);
    }
  };

  const currentCanteen =
    selectedDish?.canteen ||
    storeState?.selectedCanteen ||
    SUT_CANTEENS[0];

  const currentBuilding =
    storeState?.currentBuilding ||
    SUT_BUILDINGS[0];

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={COLORS.primary} strokeWidth={2.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาเมนู, ร้านค้า, ก๋วยเตี๋ยว, กะเพรา..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Icon name="close" size={16} color={COLORS.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                {cat.icon ? (
                  <Icon
                    name={cat.icon}
                    size={13}
                    color={isActive ? '#FFFFFF' : cat.iconColor || COLORS.textSecondary}
                    variant="filled"
                    style={{ marginRight: 4 }}
                  />
                ) : null}
                <Text
                  style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results List */}
      <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
        {allDishes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="search" size={32} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>ยังไม่มีรายการอาหารในระบบ</Text>
            <Text style={styles.emptySub}>
              เมื่อร้านค้าเพิ่มเมนูอาหารในระบบ รายการจะมาปรากฏให้ค้นหาและสั่งซื้อได้ทันทีที่นี่
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeaderRow}>
              <Text style={styles.resultsCount}>
                {searchQuery
                  ? `ผลการค้นหา "${searchQuery}" (${filteredDishes.length})`
                  : `เมนูทั้งหมด (${filteredDishes.length} รายการ)`}
              </Text>
              {selectedCategory !== 'all' && (
                <TouchableOpacity
                  onPress={() => setSelectedCategory('all')}
                  style={styles.resetFilterBtn}
                >
                  <Text style={styles.resetFilterText}>ล้างตัวกรอง</Text>
                </TouchableOpacity>
              )}
            </View>

            {filteredDishes.length === 0 ? (
              <View style={styles.emptySearchContainer}>
                <View style={styles.emptySearchIconCircle}>
                  <Icon name="search" size={28} color={COLORS.textMuted} strokeWidth={2} />
                </View>
                <Text style={styles.emptySearchTitle}>ไม่พบเมนูที่ตรงกับคำค้นหา</Text>
                <Text style={styles.emptySearchSub}>
                  ลองแตะค้นหาด่วนด้วยคำค้นยอดนิยมด้านล่างนี้ดูสิ:
                </Text>
                <View style={styles.suggestionRow}>
                  {['กะเพรา', 'ก๋วยเตี๋ยว', 'ต้มยำ', 'ชาไทย', 'ขนมถ้วย'].map((word) => (
                    <TouchableOpacity
                      key={word}
                      style={styles.suggestionChip}
                      onPress={() => {
                        setSelectedCategory('all');
                        setSearchQuery(word);
                      }}
                    >
                      <Text style={styles.suggestionText}>+ {word}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              filteredDishes.map((item) => {
                const isClosed = item.stall?.isOpen === false;
                return (
                  <TouchableOpacity
                    key={`${item.stall?.id}_${item.id}`}
                    style={[styles.dishCard, isClosed && styles.dishCardClosed]}
                    onPress={() => handleSelectDish(item)}
                    activeOpacity={0.88}
                  >
                    {/* Food Image with Badges */}
                    <View style={styles.imageWrapper}>
                      <Image
                        source={{ uri: item.foodImage }}
                        style={styles.foodImage}
                        resizeMode="cover"
                      />
                      {item.isPopular ? (
                        <View style={styles.popularBadge}>
                          <Icon name="flame" size={9} color="#FFFFFF" variant="filled" />
                          <Text style={styles.popularBadgeText}>แนะนำ</Text>
                        </View>
                      ) : null}
                      {item.isGrabAndGo ? (
                        <View style={styles.grabBadge}>
                          <Icon name="zap" size={9} color="#FFFFFF" variant="filled" />
                          <Text style={styles.grabBadgeText}>พร้อมหยิบ</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Content Details */}
                    <View style={styles.dishContent}>
                      <Text style={styles.dishName} numberOfLines={1}>
                        {item.thaiName || item.name}
                      </Text>

                      {/* Stall & Canteen Name */}
                      <TouchableOpacity
                        style={styles.stallRow}
                        onPress={() => {
                          if (typeof onSelectStall === 'function') {
                            onSelectStall(item.stall);
                          }
                        }}
                      >
                        <Icon name="store" size={11} color={COLORS.primary} strokeWidth={2} />
                        <Text style={styles.stallName} numberOfLines={1}>
                          {item.stall.thaiName || item.stall.name}
                          {item.canteenShort ? ` • ${item.canteenShort}` : ''}
                        </Text>
                      </TouchableOpacity>

                      {/* Clean Short Description */}
                      {item.cleanDesc ? (
                        <Text style={styles.dishDesc} numberOfLines={1}>
                          {item.cleanDesc}
                        </Text>
                      ) : null}

                      {/* Meta Tags: Prep Time & Open Status */}
                      <View style={styles.metaRow}>
                        <View style={styles.prepBadge}>
                          <Icon name="clock" size={10} color={COLORS.textSecondary} strokeWidth={2} />
                          <Text style={styles.prepText}>~{item.prepTime || 5} นาที</Text>
                        </View>
                        {isClosed && (
                          <View style={styles.closedBadge}>
                            <Text style={styles.closedText}>ร้านปิด</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Price & Action */}
                    <View style={styles.actionCol}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.dishPrice}>฿{item.price}</Text>
                        {storeActions?.toggleFavoriteDish && (
                          <TouchableOpacity
                            style={styles.favDishBtn}
                            onPress={(e) => {
                              e.stopPropagation?.();
                              storeActions.toggleFavoriteDish(item, item.stall);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Icon
                              name="heart"
                              size={15}
                              color={storeActions?.isFavoriteDish?.(item.id, item.thaiName || item.name) ? '#EF4444' : '#CBD5E1'}
                              variant={storeActions?.isFavoriteDish?.(item.id, item.thaiName || item.name) ? 'filled' : 'outline'}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                      {isClosed ? (
                        <View style={styles.closedBtn}>
                          <Text style={styles.closedBtnText}>ปิด</Text>
                        </View>
                      ) : (
                        <View style={styles.orderBtn}>
                          <Icon name="plus" size={11} color="#FFFFFF" strokeWidth={2.5} />
                          <Text style={styles.orderBtnText}>สั่ง</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Food Customize Modal */}
      {selectedDish && (
        <FoodItemModal
          visible={showFoodModal}
          onClose={() => setShowFoodModal(false)}
          stall={selectedDish.stall}
          menuItem={selectedDish}
          isFavoriteDish={storeActions?.isFavoriteDish ? storeActions.isFavoriteDish(selectedDish.id, selectedDish.name) : false}
          onToggleFavoriteDish={() => storeActions?.toggleFavoriteDish && storeActions.toggleFavoriteDish(selectedDish, selectedDish.stall)}
          onProceedToSync={handleProceedToSync}
        />
      )}

      {/* Class Sync & Predictive Slotting Modal */}
      {selectedDish && (
        <ClassSyncModal
          visible={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          selectedCanteen={currentCanteen}
          selectedStall={selectedDish.stall}
          selectedMenu={selectedDish}
          currentBuilding={currentBuilding}
          customOptions={customOptions}
          specialNotes={specialNotes}
          quantity={selectedQuantity}
          onConfirmOrder={handleConfirmPredictiveOrder}
        />
      )}

      {/* Insufficient Balance Modal */}
      <Modal
        visible={!!insufficientModalData}
        transparent
        animationType="fade"
        onRequestClose={() => setInsufficientModalData(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.insufficientCard}>
            <View style={styles.warningIconCircle}>
              <Icon name="wallet" size={32} color="#EA580C" variant="filled" />
            </View>
            <Text style={styles.insufficientTitle}>ยอดเงินใน Wallet ไม่เพียงพอ</Text>
            <Text style={styles.insufficientDesc}>
              คุณต้องการสั่ง{' '}
              <Text style={{ fontWeight: 'bold', color: COLORS.textPrimary }}>
                "{insufficientModalData?.itemName}"
              </Text>{' '}
              แต่ยอดเงินในกระเป๋าของคุณไม่เพียงพอ
            </Text>

            <View style={styles.balanceComparisonBox}>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>ยอดคำสั่งซื้อ:</Text>
                <Text style={styles.comparisonValueBold}>
                  ฿{insufficientModalData?.requiredAmount}
                </Text>
              </View>
              <View style={styles.comparisonDivider} />
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>ยอดเงินในกระเป๋า:</Text>
                <Text style={styles.comparisonValueRed}>
                  ฿{insufficientModalData?.currentBalance || 0}
                </Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>ต้องเติมเพิ่มอีก:</Text>
                <Text style={styles.comparisonValueOrange}>
                  ฿
                  {Math.max(
                    0,
                    (insufficientModalData?.requiredAmount || 0) -
                      (insufficientModalData?.currentBalance || 0)
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.insufficientBtnGroup}>
              <TouchableOpacity
                style={styles.goToTopUpBtn}
                onPress={() => {
                  setInsufficientModalData(null);
                  if (typeof onRequireTopUp === 'function') {
                    onRequireTopUp();
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.goToTopUpBtnText}>ไปเติมเงินทันที</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelPopupBtn}
                onPress={() => setInsufficientModalData(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelPopupBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  clearBtn: {
    padding: 6,
  },
  categoryScroll: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  resetFilterBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  resetFilterText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  dishCardClosed: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
  },
  imageWrapper: {
    width: 88,
    height: 88,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  popularBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  grabBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  grabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  dishContent: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  dishName: {
    fontSize: 15,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  stallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  stallName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.medium,
    flex: 1,
  },
  dishDesc: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 3,
  },
  prepText: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  closedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  closedText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '700',
  },
  favDishBtn: {
    padding: 3,
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 2,
    height: 78,
  },
  dishPrice: {
    fontSize: 16,
    ...TYPOGRAPHY.black,
    color: COLORS.primary,
  },
  orderBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  orderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    ...TYPOGRAPHY.bold,
  },
  closedBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  closedBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  emptyTitle: {
    fontSize: 16,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptySearchContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptySearchIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptySearchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySearchSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestionText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  insufficientCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  warningIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  insufficientTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  insufficientDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  balanceComparisonBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  comparisonLabel: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
  },
  comparisonValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  comparisonValueRed: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  comparisonValueOrange: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  comparisonDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  insufficientBtnGroup: {
    width: '100%',
    gap: 10,
  },
  goToTopUpBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  goToTopUpBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelPopupBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelPopupBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});

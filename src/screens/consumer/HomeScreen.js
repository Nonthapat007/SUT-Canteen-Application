import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONT_FAMILY, TYPOGRAPHY } from '../../constants/typography';
import Icon from '../../components/common/Icon';
import MobileHeader from '../../components/MobileHeader';
import GrabAndGoBar from '../../components/GrabAndGoBar';
import RecommendedMenusSection from '../../components/RecommendedMenusSection';
import StallCard from '../../components/StallCard';
import FoodItemModal from '../../components/FoodItemModal';
import ClassSyncModal from '../../components/ClassSyncModal';
import DigitalPassModal from '../../components/DigitalPassModal';
import EmptyStallsCard from '../../components/EmptyStallsCard';
import StallDetailModal from '../../components/StallDetailModal';
import { getFoodImageFallback } from '../../utils/imageUtils';

export default function HomeScreen({
  storeState,
  storeActions,
  currentUser,
  onOpenSearch,
  onNavigateTracking,
  onRequireTopUp,
  onOpenProfile,
}) {
  const { selectedCanteen, currentBuilding, grabAndGoItems } = storeState;

  // Selected state for food ordering
  const [selectedStall, setSelectedStall] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [customOptions, setCustomOptions] = useState([]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [showStallModal, setShowStallModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [activePassOrder, setActivePassOrder] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Insufficient Balance In-App Pop-Up Modal State
  const [insufficientModalData, setInsufficientModalData] = useState(null);

  // Time filter tier (low, medium, high)
  const [waitTierFilter, setWaitTierFilter] = useState(null);

  const stalls = selectedCanteen?.stalls || [];
  
  // Extract all menus across stalls in selected canteen for Version B (Food-First)
  const allMenuItems = [];
  stalls.forEach((stall) => {
    (stall.menus || []).forEach((m) => {
      allMenuItems.push({ menu: m, stall });
    });
  });

  // Recommended Menus: menus where isPopular or popular is true
  const recommendedItems = allMenuItems.filter(
    ({ menu }) => menu.isPopular || menu.popular
  );

  // Grab & Go Menus: menus where isGrabAndGo is true
  const merchantGrabAndGoItems = allMenuItems
    .filter(({ menu }) => menu.isGrabAndGo)
    .map(({ menu, stall }) => {
      const foodImg = menu.imageUrl || menu.image || getFoodImageFallback(menu.thaiName || menu.name);
      return {
        id: menu.id,
        name: menu.thaiName || menu.name,
        price: menu.price,
        imageUrl: foodImg,
        image: foodImg,
        canteenName: selectedCanteen?.thaiName || selectedCanteen?.name || 'โรงอาหาร มทส.',
        pickupSpot: `หน้าร้าน ${stall.thaiName || stall.name}`,
        packedTime: 'พร้อมหยิบทันที',
        badge: '● สดใหม่',
        stock: 10,
        stall,
        menu,
      };
    });

  // Filter stalls if a wait tier is selected
  const filteredStalls = stalls.filter((stall) => {
    if (!waitTierFilter) return true;
    if (waitTierFilter === 'low') return stall.waitMinutes <= 10;
    if (waitTierFilter === 'medium') return stall.waitMinutes > 10 && stall.waitMinutes <= 20;
    if (waitTierFilter === 'high') return stall.waitMinutes > 20;
    return true;
  });

  const handleSelectStall = (stall) => {
    if (stall.isOpen === false) {
      Alert.alert('ร้านปิดให้บริการ', `ร้าน "${stall.thaiName || stall.name}" ปิดให้บริการอยู่ในขณะนี้ (Closed)`);
      return;
    }
    setSelectedStall(stall);
    setShowStallModal(true);
  };

  const handleSelectRecommendedMenu = (menu, stall) => {
    if (stall.isOpen === false) {
      Alert.alert('ร้านปิดให้บริการ', `ร้าน "${stall.thaiName || stall.name}" ปิดให้บริการอยู่ในขณะนี้`);
      return;
    }
    setSelectedStall(stall);
    setSelectedMenu(menu);
    setShowFoodModal(true);
  };

  const handleSelectMenuFromStall = (menuItem) => {
    setSelectedMenu(menuItem);
    setShowStallModal(false);
    setShowFoodModal(true);
  };

  const handleProceedToSync = ({ menuItem, customOptions: options, specialNote, quantity = 1 }) => {
    setSelectedMenu(menuItem);
    setCustomOptions(options);
    setSpecialNotes(specialNote || '');
    setSelectedQuantity(quantity);
    setShowFoodModal(false);
    setShowSyncModal(true);
  };

  const handleConfirmPredictiveOrder = (orderParams) => {
    const requiredAmount = orderParams.totalAmount || 0;
    const currentBalance = storeState.walletBalance || 0;

    if (currentBalance < requiredAmount) {
      setShowSyncModal(false);
      setShowFoodModal(false);
      setShowStallModal(false);

      setInsufficientModalData({
        requiredAmount,
        currentBalance,
        itemName: orderParams.items?.[0]?.name || selectedMenu?.name || 'รายการอาหาร',
      });
      return;
    }

    storeActions.createPredictiveOrder({
      ...orderParams,
      currentUser,
    });
    onNavigateTracking();
  };

  const handleQuickGrabAndGoBuy = (item) => {
    const stall =
      item.stall ||
      stalls.find(
        (s) =>
          s.id === item.stallId ||
          (s.menus || []).some((m) => m.id === item.id || m.name === item.name)
      );

    const menu =
      item.menu ||
      (stall?.menus || []).find((m) => m.id === item.id || m.name === item.name) || {
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description || '',
        image: item.imageUrl || item.image,
        imageUrl: item.imageUrl || item.image,
      };

    if (stall && stall.isOpen === false) {
      Alert.alert(
        'ร้านปิดให้บริการ',
        `ร้าน "${stall.thaiName || stall.name}" ปิดให้บริการอยู่ในขณะนี้`
      );
      return;
    }

    setSelectedStall(stall || { name: item.pickupSpot || 'ร้านค้า มทส.' });
    setSelectedMenu(menu);
    setShowFoodModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Mobile Header (Greeting with registered user name, avatar photo, Canteen, Search) */}
        <MobileHeader
          userName={currentUser?.fullName || 'ผู้ใช้งาน'}
          avatarUri={currentUser?.avatarUri}
          selectedCanteen={selectedCanteen}
          onSelectCanteen={storeActions.setSelectedCanteen}
          onOpenSearch={onOpenSearch}
          onOpenProfile={onOpenProfile}
        />

        {/* 2. GRAB & GO FEATURE (Fast-Lane 0 นาที ดึงจากเมนูที่แม่ค้าเปิดโหมด Grab & Go) */}
        <GrabAndGoBar
          items={merchantGrabAndGoItems}
          onQuickBuy={handleQuickGrabAndGoBuy}
        />

        {/* 3. ✨ เมนูแนะนำ (Recommended Menus) - อยู่เหนือหัวข้อ "แนะนำสำหรับคุณ" */}
        <RecommendedMenusSection
          items={recommendedItems}
          onSelectMenu={handleSelectRecommendedMenu}
        />

        {/* 4. แคปซูลกรองเวลารอด่วน (Version B: ตัวกรองเสริม ไม่บังคับผ่าน) */}
        <View style={styles.filterChipsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsScroll}
          >
            {[
              { key: null, label: '🍽️ ทั้งหมด' },
              { key: 'low', label: '⚡ รอไม่เกิน 10 นาที' },
              { key: 'medium', label: '⏳ 10–20 นาที' },
              { key: 'high', label: '🍱 สั่งล่วงหน้า (>20 น.)' },
            ].map((chip) => {
              const isActive = waitTierFilter === chip.key;
              return (
                <TouchableOpacity
                  key={String(chip.key)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setWaitTierFilter(chip.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 5. แนะนำสำหรับคุณ / AVAILABLE STALLS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>แนะนำสำหรับคุณ (ร้านค้าทั้งหมด)</Text>
          <TouchableOpacity onPress={onOpenSearch} activeOpacity={0.7}>
            <Text style={styles.viewMapText}>ดูทั้งหมด</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Stalls List or Empty State */}
        {filteredStalls.length === 0 ? (
          <EmptyStallsCard
            canteenName={selectedCanteen?.thaiName || selectedCanteen?.name}
            onRefresh={() => storeActions.reloadStalls && storeActions.reloadStalls()}
          />
        ) : (
          <View style={styles.stallsList}>
            {filteredStalls.map((stall) => (
              <StallCard
                key={stall.id}
                stall={stall}
                onSelect={handleSelectStall}
              />
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modals */}
      <StallDetailModal
        visible={showStallModal}
        stall={stalls.find((s) => s.id === selectedStall?.id) || selectedStall}
        onClose={() => setShowStallModal(false)}
        onSelectMenu={handleSelectMenuFromStall}
      />

      <FoodItemModal
        visible={showFoodModal}
        onClose={() => {
          setShowFoodModal(false);
          if (selectedStall) setShowStallModal(true);
        }}
        stall={selectedStall}
        menuItem={selectedMenu}
        onProceedToSync={handleProceedToSync}
      />

      <ClassSyncModal
        visible={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        selectedCanteen={selectedCanteen}
        selectedStall={selectedStall}
        selectedMenu={selectedMenu}
        currentBuilding={currentBuilding}
        customOptions={customOptions}
        specialNotes={specialNotes}
        quantity={selectedQuantity}
        onConfirmOrder={handleConfirmPredictiveOrder}
      />

      <DigitalPassModal
        visible={!!activePassOrder}
        onClose={() => setActivePassOrder(null)}
        order={activePassOrder}
        onCompletePickup={(orderId) => storeActions.updateOrderStatus(orderId, 'COMPLETED')}
      />

      {/* Grab & Go Quick Quantity & Instant Checkout Modal */}


      {/* Insufficient Balance In-App Pop-Up Modal (เด้งเตือนขึ้นมาสวยงาม ไม่วาร์ปเอง) */}
      <Modal
        visible={!!insufficientModalData}
        transparent
        animationType="fade"
        onRequestClose={() => setInsufficientModalData(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.insufficientCard}>
            {/* Warning Icon Badge */}
            <View style={styles.warningIconCircle}>
              <Icon name="wallet" size={32} color="#EA580C" variant="filled" />
            </View>

            {/* Title */}
            <Text style={styles.insufficientTitle}>ยอดเงินใน Wallet ไม่เพียงพอ</Text>

            {/* Subtitle / Item description */}
            <Text style={styles.insufficientDesc}>
              คุณต้องการสั่ง <Text style={styles.textBoldDark}>"{insufficientModalData?.itemName}"</Text> แต่ยอดเงินในกระเป๋าของคุณไม่เพียงพอ
            </Text>

            {/* Amount Comparison Box */}
            <View style={styles.balanceComparisonBox}>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>ยอดคำสั่งซื้อ:</Text>
                <Text style={styles.comparisonValueBold}>฿{insufficientModalData?.requiredAmount}</Text>
              </View>
              <View style={styles.comparisonDivider} />
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>ยอดเงินในกระเป๋าของคุณ:</Text>
                <Text style={styles.comparisonValueRed}>฿{insufficientModalData?.currentBalance || 0}</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>ยอดเงินที่ต้องเติมเพิ่ม:</Text>
                <Text style={styles.comparisonValueOrange}>
                  ฿{Math.max(0, (insufficientModalData?.requiredAmount || 0) - (insufficientModalData?.currentBalance || 0))}
                </Text>
              </View>
            </View>

            <Text style={styles.insufficientHint}>
              💡 กรุณาเติมเงินเข้ากระเป๋า SUT Canteen Wallet เพื่อดำเนินการต่อ
            </Text>

            {/* Action Buttons */}
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
                <Icon name="wallet" size={16} color="#FFFFFF" variant="filled" style={{ marginRight: 6 }} />
                <Text style={styles.goToTopUpBtnText}>ไปเติมเงินทันที 💳</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelPopupBtn}
                onPress={() => setInsufficientModalData(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelPopupBtnText}>ไว้ทีหลัง / ยกเลิก</Text>
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    ...TYPOGRAPHY.black,
    color: COLORS.textPrimary,
    fontSize: 18,
  },
  viewMapText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.primary,
    fontSize: 13,
  },
  filterChipsRow: {
    marginVertical: 6,
  },
  filterChipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.bold,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  stallsList: {
    gap: 2,
  },
  bottomSpacer: {
    height: 30,
  },
  // In-App Insufficient Balance Pop-Up Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  insufficientCard: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  warningIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  insufficientTitle: {
    ...TYPOGRAPHY.black,
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  insufficientDesc: {
    ...TYPOGRAPHY.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  textBoldDark: {
    ...TYPOGRAPHY.bold,
    color: '#0F172A',
  },
  balanceComparisonBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  comparisonLabel: {
    ...TYPOGRAPHY.medium,
    fontSize: 12,
    color: '#64748B',
  },
  comparisonValueBold: {
    ...TYPOGRAPHY.bold,
    fontSize: 14,
    color: '#0F172A',
  },
  comparisonValueRed: {
    ...TYPOGRAPHY.black,
    fontSize: 14,
    color: '#DC2626',
  },
  comparisonValueOrange: {
    ...TYPOGRAPHY.black,
    fontSize: 14,
    color: '#EA580C',
  },
  comparisonDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  insufficientHint: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
  },
  insufficientBtnGroup: {
    width: '100%',
    gap: 10,
  },
  goToTopUpBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  goToTopUpBtnText: {
    ...TYPOGRAPHY.bold,
    color: '#FFFFFF',
    fontSize: 14,
  },
  cancelPopupBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPopupBtnText: {
    ...TYPOGRAPHY.bold,
    color: '#64748B',
    fontSize: 13,
  },
});

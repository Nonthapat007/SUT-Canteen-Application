// Merchant Mobile App Root Container with Supabase Stalls & Realtime
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { COLORS } from '../../constants/colors';
import Icon from '../../components/common/Icon';
import MerchantBottomNav from '../../components/merchant/MerchantBottomNav';
import MerchantQueueScreen from './MerchantQueueScreen';
import MerchantMenuScreen from './MerchantMenuScreen';
import MerchantSummaryScreen from './MerchantSummaryScreen';
import MerchantProfileScreen from './MerchantProfileScreen';
import CreateStallModal from '../../components/merchant/CreateStallModal';
import dbService from '../../services/dbService';

export default function MerchantApp({
  storeState = {},
  storeActions = {},
  currentUser = null,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'menu' | 'summary' | 'profile'
  const [stalls, setStalls] = useState([]);
  const [currentStall, setCurrentStall] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadStalls = async () => {
    try {
      const data = await dbService.getStalls();
      const safeData = Array.isArray(data) ? data : [];
      setStalls(safeData);

      // Filter stalls belonging to current logged in merchant
      const userEmail = (currentUser?.email || '').trim().toLowerCase();
      const userId = (currentUser?.studentId || '').trim().toLowerCase();

      const myStalls = safeData.filter((s) => {
        const owner = (s.ownerPhone || '').trim().toLowerCase();
        if (!owner) return false;
        return (userEmail && owner === userEmail) || (userId && owner === userId);
      });

      if (myStalls.length > 0) {
        setCurrentStall((prev) => {
          if (prev && myStalls.some((s) => s.id === prev.id)) {
            return myStalls.find((s) => s.id === prev.id);
          }
          return myStalls[0];
        });
      } else {
        setCurrentStall(null);
      }
    } catch (err) {
      console.error('Failed to load merchant stalls:', err);
      setCurrentStall(null);
    }
  };

  useEffect(() => {
    loadStalls();

    // Subscribe to realtime changes in stalls
    const unsubscribe = dbService.subscribeToStalls(() => {
      loadStalls();
      if (storeActions && typeof storeActions.reloadStalls === 'function') {
        storeActions.reloadStalls();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentUser?.email, currentUser?.studentId]);

  const handleStallCreated = (newStall) => {
    if (newStall) {
      setCurrentStall(newStall);
    }
    loadStalls();
    if (storeActions && typeof storeActions.reloadStalls === 'function') {
      storeActions.reloadStalls();
    }
  };

  const handleUpdateStallImage = async (stallId, newImageUrl) => {
    try {
      await dbService.updateStall(stallId, { imageUrl: newImageUrl });
      setCurrentStall((prev) => (prev ? { ...prev, imageUrl: newImageUrl } : prev));
      setStalls((prev) =>
        prev.map((s) => (s.id === stallId ? { ...s, imageUrl: newImageUrl } : s))
      );
      if (storeActions?.updateStallImage) {
        storeActions.updateStallImage(stallId, newImageUrl);
      }
      return { success: true };
    } catch (e) {
      console.error('Failed to update stall image:', e);
      return { error: e.message || 'เกิดข้อผิดพลาดในการบันทึกรูปภาพ' };
    }
  };

  const safeOrders = (storeState && Array.isArray(storeState.orders)) ? storeState.orders : [];
  const activeOrdersCount = safeOrders.filter(
    (o) => o.status === 'RELEASED_TO_KDS' || o.status === 'COOKING' || o.status === 'ALMOST_READY'
  ).length;

  const currentShopName = currentStall
    ? currentStall.thaiName || currentStall.name
    : 'ยังไม่มีร้านค้า';

  return (
    <View style={styles.container}>
      {/* Universal Top Merchant Bar */}
      <View style={styles.merchantTopBar}>
        <View style={styles.topShopBadge}>
          <Icon name="store" size={14} color={COLORS.primary} strokeWidth={2.2} style={{ marginRight: 6 }} />
          <Text style={styles.topShopNameText} numberOfLines={1}>
            {currentShopName}
          </Text>
        </View>

        {/* Quick Logout Button */}
        <TouchableOpacity
          style={styles.merchantLogoutBtn}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Icon name="logout" size={14} color="#FCA5A5" strokeWidth={2} style={{ marginRight: 5 }} />
          <Text style={styles.merchantLogoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>

      {/* Notice if No Stall Created Yet */}
      {!currentStall && (
        <View style={styles.topAlertBar}>
          <Icon name="store" size={16} color={COLORS.primary} strokeWidth={2} style={{ marginRight: 8 }} />
          <Text style={styles.topAlertText} numberOfLines={1}>
            คุณยังไม่มีร้านค้าในระบบ
          </Text>
          <TouchableOpacity
            style={styles.topAlertBtn}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.topAlertBtnText}>+ เปิดร้านใหม่</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Tab Screen Content */}
      <View style={styles.body}>
        {activeTab === 'queue' && (
          <MerchantQueueScreen
            storeState={storeState}
            storeActions={storeActions}
            shopName={currentShopName}
            currentStall={currentStall}
            currentUser={currentUser}
            onOpenCreateStall={() => setShowCreateModal(true)}
          />
        )}

        {activeTab === 'menu' && (
          <MerchantMenuScreen
            shopName={currentShopName}
            currentStall={currentStall}
            onOpenCreateStall={() => setShowCreateModal(true)}
          />
        )}

        {activeTab === 'summary' && (
          <MerchantSummaryScreen
            currentStall={currentStall}
          />
        )}

        {activeTab === 'profile' && (
          <MerchantProfileScreen
            shopName={currentShopName}
            currentStall={currentStall}
            currentUser={currentUser}
            onOpenCreateStall={() => setShowCreateModal(true)}
            onUpdateStallImage={handleUpdateStallImage}
            onLogout={onLogout}
          />
        )}
      </View>

      {/* Merchant Bottom Navigation Bar */}
      <MerchantBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        queueCount={activeOrdersCount}
      />

      {/* Modal for creating a new stall */}
      <CreateStallModal
        visible={showCreateModal}
        currentUser={currentUser}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleStallCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  merchantTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  merchantLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  merchantLogoutText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '700',
  },
  topShopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    maxWidth: '50%',
  },
  topShopNameText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  topAlertBar: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 94, 58, 0.2)',
  },
  topAlertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  topAlertBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  topAlertBtnText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
});

// Global Header for SUT Canteen Express
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { SUT_BUILDINGS } from '../constants/campusData';

export default function Header({
  currentRole,
  onRoleChange,
  currentBuilding,
  onSelectBuilding,
  activeToast,
  activeOrdersCount = 0,
  onViewOrders,
}) {
  const [showBuildingModal, setShowBuildingModal] = useState(false);

  return (
    <View style={styles.container}>
      {/* Toast Notification Banner */}
      {activeToast && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{activeToast}</Text>
        </View>
      )}

      {/* Brand & Mode Bar */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>SUT</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Canteen Express</Text>
            <Text style={styles.brandSubtitle}>มทส. Zero-Wait • Zero-GP</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {/* Active Orders Tracker Pill */}
          {currentRole === 'consumer' && (
            <TouchableOpacity
              style={[styles.ordersPill, activeOrdersCount > 0 && styles.ordersPillActive]}
              onPress={onViewOrders}
              activeOpacity={0.8}
            >
              <Text style={styles.ordersPillText}>
                {activeOrdersCount > 0 ? `🔥 ติดตามคิว (${activeOrdersCount})` : '📋 ออเดอร์'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Role Switcher Toggle */}
          <TouchableOpacity
            style={[
              styles.roleToggle,
              currentRole === 'vendor' ? styles.roleToggleVendor : styles.roleToggleConsumer,
            ]}
            onPress={() => onRoleChange(currentRole === 'consumer' ? 'vendor' : 'consumer')}
            activeOpacity={0.85}
          >
            <Text style={styles.roleToggleIcon}>
              {currentRole === 'consumer' ? '👨‍🍳' : '📱'}
            </Text>
            <Text style={styles.roleToggleText}>
              {currentRole === 'consumer' ? 'จอแม่ค้า (KDS)' : 'โหมดนักศึกษา'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Geofence / Location Strip (Consumer only) */}
      {currentRole === 'consumer' && (
        <View style={styles.locationStrip}>
          <View style={styles.locationLeft}>
            <View style={styles.gpsPulseDot} />
            <Text style={styles.locationLabel}>พิกัดอาคารปัจจุบัน:</Text>
            <Text style={styles.locationName} numberOfLines={1}>
              {currentBuilding.name}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.changeLocBtn}
            onPress={() => setShowBuildingModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.changeLocText}>เปลี่ยนจุด ⇄</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Building Selection Modal (GPS Simulation) */}
      <Modal visible={showBuildingModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📍 ระบุอาคารเรียนของคุณใน มทส.</Text>
              <Text style={styles.modalSubtitle}>
                ระบบ Geofence จะคำนวณโรงอาหารใกล้สุดและเวลาเดินเท้าให้อัตโนมัติ
              </Text>
            </View>

            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {SUT_BUILDINGS.map((bld) => {
                const isSelected = bld.id === currentBuilding.id;
                return (
                  <TouchableOpacity
                    key={bld.id}
                    style={[styles.buildingOption, isSelected && styles.buildingOptionActive]}
                    onPress={() => {
                      onSelectBuilding(bld);
                      setShowBuildingModal(false);
                    }}
                  >
                    <View style={styles.buildingInfo}>
                      <Text style={[styles.buildingName, isSelected && styles.textOrange]}>
                        {bld.name}
                      </Text>
                      <Text style={styles.buildingZone}>
                        โซน: {bld.zone} • รหัส: {bld.code}
                      </Text>
                    </View>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowBuildingModal(false)}
            >
              <Text style={styles.modalCloseText}>ปิด</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  toastBanner: {
    backgroundColor: COLORS.sutOrangeBright,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toastText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    backgroundColor: COLORS.sutOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.sutGold,
  },
  logoText: {
    color: COLORS.white,
    ...TYPOGRAPHY.black,
    fontSize: 15,
    letterSpacing: 1,
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    ...TYPOGRAPHY.bold,
  },
  brandSubtitle: {
    color: COLORS.sutGold,
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ordersPill: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorderLight,
  },
  ordersPillActive: {
    backgroundColor: 'rgba(230, 81, 0, 0.25)',
    borderColor: COLORS.sutOrangeBright,
  },
  ordersPillText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  roleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleToggleConsumer: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.sutOrange,
  },
  roleToggleVendor: {
    backgroundColor: COLORS.sutOrange,
  },
  roleToggleIcon: {
    fontSize: 13,
  },
  roleToggleText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  locationStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  gpsPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  locationLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  locationName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
  },
  changeLocBtn: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
  },
  changeLocText: {
    color: COLORS.sutGold,
    fontSize: 11,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalHeader: {
    marginBottom: 14,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    ...TYPOGRAPHY.bold,
    marginBottom: 4,
  },
  modalSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  modalList: {
    marginBottom: 14,
  },
  buildingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  buildingOptionActive: {
    borderColor: COLORS.sutOrangeBright,
    backgroundColor: 'rgba(230, 81, 0, 0.12)',
  },
  buildingInfo: {
    flex: 1,
  },
  buildingName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  textOrange: {
    color: COLORS.sutOrangeBright,
  },
  buildingZone: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  checkMark: {
    color: COLORS.sutOrangeBright,
    fontSize: 16,
    ...TYPOGRAPHY.black,
    marginLeft: 10,
  },
  modalCloseBtn: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});

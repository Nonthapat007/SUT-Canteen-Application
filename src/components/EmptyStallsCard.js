import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';

export default function EmptyStallsCard({
  canteenName = 'โรงอาหาร',
  onRefresh,
  onSwitchToActiveCanteen,
  activeCanteenName,
  activeStallsCount = 0,
}) {
  return (
    <View style={styles.card}>
      {/* Decorative Soft Badge */}
      <View style={styles.iconCircle}>
        <Icon name="store" size={38} color={COLORS.primary} strokeWidth={2} />
      </View>

      <Text style={styles.title}>ยังไม่มีร้านค้าเปิดให้บริการ</Text>
      <Text style={styles.subtitle}>
        {canteenName} ยังไม่มีร้านค้าเปิดรับออเดอร์ในระบบขณะนี้
      </Text>

      {/* Primary Action: 1-Tap Switch to Canteen that currently has open stalls */}
      {onSwitchToActiveCanteen && activeCanteenName && activeStallsCount > 0 && (
        <TouchableOpacity
          style={styles.primarySwitchBtn}
          onPress={onSwitchToActiveCanteen}
          activeOpacity={0.85}
        >
          <Text style={styles.primarySwitchBtnText}>
            ไปยัง {activeCanteenName} ({activeStallsCount} ร้านเปิดอยู่)
          </Text>
          <Icon name="chevron-right" size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      )}

      {/* Customer Action: Refresh button */}
      {onRefresh && (
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onRefresh}
          activeOpacity={0.8}
        >
          <Icon name="refresh" size={15} color={COLORS.textSecondary} strokeWidth={2} style={{ marginRight: 6 }} />
          <Text style={styles.secondaryBtnText}>รีเฟรชข้อมูล</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  primarySwitchBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 10,
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primarySwitchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    ...TYPOGRAPHY.bold,
  },
  secondaryBtn: {
    backgroundColor: COLORS.surfaceSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});

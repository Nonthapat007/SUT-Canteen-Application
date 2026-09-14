import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';

export default function EmptyStallsCard({
  canteenName = 'โรงอาหาร',
  onRefresh,
}) {
  return (
    <View style={styles.card}>
      {/* Decorative Soft Badge */}
      <View style={styles.iconCircle}>
        <Icon name="store" size={38} color={COLORS.primary} strokeWidth={2} />
      </View>

      <Text style={styles.title}>ยังไม่มีร้านค้าในขณะนี้</Text>
      <Text style={styles.subtitle}>
        {canteenName} ยังไม่มีร้านค้าเปิดให้บริการในขณะนี้ โปรดตรวจสอบอีกครั้งในภายหลัง
      </Text>

      {/* Customer Action: Refresh button */}
      {onRefresh && (
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onRefresh}
          activeOpacity={0.8}
        >
          <Icon name="refresh" size={16} color={COLORS.textSecondary} strokeWidth={2} style={{ marginRight: 6 }} />
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
    padding: 26,
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
    width: 76,
    height: 76,
    borderRadius: 38,
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
  secondaryBtn: {
    backgroundColor: COLORS.surfaceSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});

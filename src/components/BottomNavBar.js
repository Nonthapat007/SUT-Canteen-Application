import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';

export default function BottomNavBar({ activeTab, onSelectTab, ordersCount = 0 }) {
  const tabs = [
    { key: 'home', label: 'หน้าหลัก', iconName: 'home' },
    { key: 'search', label: 'ค้นหา', iconName: 'search' },
    { key: 'orders', label: 'คำสั่งซื้อ', iconName: 'orders', badge: ordersCount },
    { key: 'profile', label: 'โปรไฟล์', iconName: 'profile' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrapper}>
              <Icon
                name={tab.iconName}
                size={22}
                color={isActive ? COLORS.textWhite : COLORS.textSecondary}
                variant={isActive ? 'filled' : 'outline'}
                strokeWidth={2}
              />
              {tab.badge > 0 && !isActive && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>

            <Text
              style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 2,
  },
  iconText: {
    fontSize: 18,
  },
  iconTextActive: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 11,
    ...TYPOGRAPHY.bold,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: COLORS.textWhite,
  },
  tabLabelInactive: {
    color: COLORS.textSecondary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.red,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: COLORS.textWhite,
    fontSize: 9,
    ...TYPOGRAPHY.black,
  },
});

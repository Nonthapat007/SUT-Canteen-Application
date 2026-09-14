// Time Budget, Advance Date Selector & Wait Time Ranking matching the Cyan Cirled Area
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

export default function TimeBudgetSection({
  onFilterChange,
  onSelectWaitTier,
}) {
  // State for "คุณมีเวลาเท่าไหร่?"
  const [selectedTimeBudget, setSelectedTimeBudget] = useState('unlimited'); // '10', '20', '30', 'unlimited'
  
  // State for "สั่งล่วงหน้าสำหรับวันไหน?"
  const [selectedDate, setSelectedDate] = useState('today'); // 'today', 'tomorrow', 'next'
  
  // State for Filter Pills
  const [selectedPill, setSelectedPill] = useState('recommended'); // 'recommended', 'fast', 'low_crowd'

  // State for "จัดอันดับตามเวลารอ"
  const [selectedWaitTier, setSelectedWaitTier] = useState(null); // 'low', 'medium', 'high'

  const timeBudgets = [
    { key: '10', label: '10 นาที' },
    { key: '20', label: '20 นาที' },
    { key: '30', label: '30 นาที' },
    { key: 'unlimited', label: 'ไม่จำกัด' },
  ];

  const dateOptions = [
    { key: 'today', title: 'วันนี้', sub: '8 ก.ย.' },
    { key: 'tomorrow', title: 'พรุ่งนี้', sub: '9 ก.ย.' },
    { key: 'next', title: 'วันถัดไป', sub: '10 ก.ย.' },
  ];

  const quickPills = [
    { key: 'recommended', label: 'แนะนำสำหรับคุณ' },
    { key: 'fast', label: 'รอไม่นาน' },
    { key: 'low_crowd', label: 'คนสั่งน้อย' },
  ];

  const waitTiers = [
    {
      key: 'low',
      title: 'รอน้อยที่สุด',
      range: '1–10 นาที',
      countText: '3 เมนู',
      color: '#10B981',
      bgLight: '#ECFDF5',
      images: [
        'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=100&q=80',
      ],
    },
    {
      key: 'medium',
      title: 'รอปานกลาง',
      range: '11–20 นาที',
      countText: '2 เมนู',
      color: '#EA580C',
      bgLight: '#FFF7ED',
      images: [
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=100&q=80',
      ],
    },
    {
      key: 'high',
      title: 'รอนาน',
      range: '20 นาทีขึ้นไป',
      countText: '2 เมนู',
      color: '#DC2626',
      bgLight: '#FEF2F2',
      images: [
        'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=100&q=80',
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* 1. คุณมีเวลาเท่าไหร่? */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>คุณมีเวลาเท่าไหร่?</Text>
        <View style={styles.budgetRow}>
          {timeBudgets.map((item) => {
            const isSelected = selectedTimeBudget === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.budgetPill,
                  isSelected && styles.budgetPillActive,
                ]}
                onPress={() => {
                  setSelectedTimeBudget(item.key);
                  if (onFilterChange) onFilterChange('timeBudget', item.key);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.budgetText,
                    isSelected && styles.budgetTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. สั่งล่วงหน้าสำหรับวันไหน? */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>สั่งล่วงหน้าสำหรับวันไหน?</Text>
        <View style={styles.datesRow}>
          {dateOptions.map((item) => {
            const isSelected = selectedDate === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.dateCard,
                  isSelected ? styles.dateCardActive : styles.dateCardInactive,
                ]}
                onPress={() => {
                  setSelectedDate(item.key);
                  if (onFilterChange) onFilterChange('date', item.key);
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.dateTitle, isSelected && styles.textWhite]}>
                  {item.title}
                </Text>
                <Text style={[styles.dateSub, isSelected && styles.textWhiteSub]}>
                  {item.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Filter Pills (แนะนำสำหรับคุณ, รอไม่นาน, คนสั่งน้อย) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsRow}
      >
        {quickPills.map((p) => {
          const isSelected = selectedPill === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.quickPill,
                isSelected ? styles.quickPillActive : styles.quickPillInactive,
              ]}
              onPress={() => {
                setSelectedPill(p.key);
                if (onFilterChange) onFilterChange('quickPill', p.key);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.quickPillText,
                  isSelected ? styles.textWhite : styles.textDark,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 4. จัดอันดับตามเวลารอ */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>จัดอันดับตามเวลารอ</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tiersScroll}
        >
          {waitTiers.map((tier) => {
            const isSelected = selectedWaitTier === tier.key;
            return (
              <TouchableOpacity
                key={tier.key}
                style={[
                  styles.tierCard,
                  isSelected && { borderColor: tier.color, borderWidth: 2 },
                ]}
                onPress={() => {
                  const next = isSelected ? null : tier.key;
                  setSelectedWaitTier(next);
                  if (onSelectWaitTier) onSelectWaitTier(next);
                }}
                activeOpacity={0.85}
              >
                <View style={styles.tierHeader}>
                  <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
                  <Text style={styles.tierTitle}>{tier.title}</Text>
                </View>

                <Text style={styles.tierRange}>{tier.range}</Text>
                <Text style={[styles.tierCount, { color: tier.color }]}>
                  {tier.countText}
                </Text>

                {/* Overlapping circular food avatars */}
                <View style={styles.avatarStack}>
                  {tier.images.map((img, i) => (
                    <Image
                      key={i}
                      source={{ uri: img }}
                      style={[styles.stackAvatar, { left: i * 20 }]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    ...TYPOGRAPHY.black,
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  budgetPill: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetPillActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF7ED',
  },
  budgetText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    ...TYPOGRAPHY.bold,
    textAlign: 'center',
  },
  budgetTextActive: {
    color: COLORS.primary,
    ...TYPOGRAPHY.extraBold,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dateCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  dateCardInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  dateTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    ...TYPOGRAPHY.bold,
    marginBottom: 2,
    textAlign: 'center',
  },
  dateSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    ...TYPOGRAPHY.medium,
    textAlign: 'center',
  },
  textWhite: {
    color: COLORS.textWhite,
  },
  textWhiteSub: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  textDark: {
    color: COLORS.textPrimary,
  },
  pillsRow: {
    gap: 10,
    marginBottom: 22,
  },
  quickPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
  },
  quickPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickPillInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: COLORS.border,
  },
  quickPillText: {
    fontSize: 13,
    ...TYPOGRAPHY.bold,
  },
  tiersScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  tierCard: {
    width: 142,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tierTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    ...TYPOGRAPHY.bold,
  },
  tierRange: {
    color: COLORS.textSecondary,
    fontSize: 11,
    ...TYPOGRAPHY.medium,
    marginBottom: 4,
  },
  tierCount: {
    fontSize: 12,
    ...TYPOGRAPHY.bold,
    marginBottom: 10,
  },
  avatarStack: {
    height: 28,
    position: 'relative',
  },
  stackAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.surface,
    backgroundColor: '#CBD5E1',
  },
});

// Search Screen for Mobile App with live Supabase dishes & design system
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Icon from '../../components/common/Icon';

export default function SearchScreen({ stalls = [], onSelectStall }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all dishes across live stalls
  const allDishes = [];
  (stalls || []).forEach((stall) => {
    (stall.menus || []).forEach((menu) => {
      allDishes.push({
        ...menu,
        stall,
        canteenName: stall.thaiName || stall.name,
      });
    });
  });

  const filteredDishes = allDishes.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.desc && d.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.stall && d.stall.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.stall && d.stall.thaiName && d.stall.thaiName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={COLORS.textSecondary} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาร้านค้า, เมนูอาหาร, ก๋วยเตี๋ยว..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Icon name="close" size={16} color={COLORS.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
        {allDishes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="search" size={36} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>ยังไม่มีรายการอาหารในระบบ</Text>
            <Text style={styles.emptySub}>
              ขณะนี้ยังไม่มีร้านค้าหรือเมนูอาหารเปิดให้บริการในระบบ เมื่อร้านค้าสร้างเมนู รายการจะค้นหาได้ทันทีที่นี่
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {searchQuery ? `ผลการค้นหา (${filteredDishes.length} รายการ)` : 'เมนูอาหารทั้งหมดในระบบ'}
            </Text>

            {filteredDishes.length === 0 ? (
              <View style={styles.emptySearchContainer}>
                <Text style={styles.emptySearchTitle}>ไม่พบเมนูที่ตรงกับคำค้นหา</Text>
                <Text style={styles.emptySearchSub}>ลองค้นหาด้วยคำอื่น เช่น ข้าว, กะเพรา, ไก่ หรือชื่อร้านค้า</Text>
              </View>
            ) : (
              filteredDishes.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.dishCard}
                  onPress={() => onSelectStall(item.stall)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dishInfo}>
                    <Text style={styles.dishName}>{item.name}</Text>
                    <View style={styles.dishMetaRow}>
                      <Icon name="store" size={12} color={COLORS.primary} strokeWidth={2} />
                      <Text style={styles.dishMeta}>{item.stall.thaiName || item.stall.name}</Text>
                    </View>
                    {item.desc ? (
                      <Text style={styles.dishDesc} numberOfLines={1}>{item.desc}</Text>
                    ) : null}
                    <View style={styles.dishPrepRow}>
                      <Icon name="clock" size={11} color={COLORS.textMuted} strokeWidth={2} />
                      <Text style={styles.dishPrep}>เวลาปรุง: ~{item.prepTime || 5} นาที</Text>
                    </View>
                  </View>

                  <View style={styles.dishRight}>
                    <Text style={styles.dishPrice}>฿{item.price}</Text>
                    <View style={styles.addBtn}>
                      <Icon name="plus" size={12} color={COLORS.textWhite} strokeWidth={2.5} />
                      <Text style={styles.addBtnText}>สั่ง</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  clearBtn: {
    padding: 4,
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  dishInfo: {
    flex: 1,
    marginRight: 12,
  },
  dishName: {
    fontSize: 15,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  dishMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  dishMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.medium,
  },
  dishDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  dishPrepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dishPrep: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  dishRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dishPrice: {
    fontSize: 16,
    ...TYPOGRAPHY.black,
    color: COLORS.primary,
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: COLORS.textWhite,
    fontSize: 12,
    ...TYPOGRAPHY.bold,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  emptySearchContainer: {
    padding: 30,
    alignItems: 'center',
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
  },
});

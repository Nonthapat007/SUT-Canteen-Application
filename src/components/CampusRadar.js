// Campus Load Balancing Radar (เปรียบเทียบสถานะความหนาแน่นและเวลารอของทั้ง 6 โรงอาหารใน มทส.)
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { getQueueStatusBadge } from '../services/predictiveSlotting';

export default function CampusRadar({
  canteensWithProximity,
  selectedCanteen,
  onSelectCanteen,
  currentBuilding,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <View style={styles.titleWithBadge}>
            <Text style={styles.title}>📡 Campus Load Balancing</Text>
            <View style={styles.livePill}>
              <View style={styles.pulseGreen} />
              <Text style={styles.liveText}>ซิงก์คิว Real-time</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            สถานะคิวสะสม 6 โรงอาหาร (คำนวณจาก {currentBuilding.name})
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {canteensWithProximity.map((canteen) => {
          const isSelected = selectedCanteen?.id === canteen.id;
          const status = getQueueStatusBadge(canteen.baseQueueMinutes);

          return (
            <TouchableOpacity
              key={canteen.id}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                { borderTopColor: status.color, borderTopWidth: 3 },
              ]}
              onPress={() => onSelectCanteen(canteen)}
              activeOpacity={0.8}
            >
              {/* Proximity / Nearest Tag */}
              {canteen.walkingMinutes <= 2 && (
                <View style={styles.nearestBadge}>
                  <Text style={styles.nearestText}>🎯 ใกล้สุด</Text>
                </View>
              )}

              <Text style={styles.canteenShortName} numberOfLines={1}>
                {canteen.shortName}
              </Text>
              <Text style={styles.canteenSub} numberOfLines={1}>
                {canteen.locationNote}
              </Text>

              {/* Status Indicator */}
              <View style={[styles.statusPill, { backgroundColor: status.badgeBg }]}>
                <View style={[styles.trafficDot, { backgroundColor: status.color }]} />
                <Text style={[styles.statusText, { color: status.color }]}>
                  รอ {canteen.baseQueueMinutes} นาที
                </Text>
              </View>

              {/* Walking Time Info */}
              <View style={styles.walkingRow}>
                <Text style={styles.walkingIcon}>🚶‍♂️</Text>
                <Text style={styles.walkingText}>
                  เดิน {canteen.walkingMinutes} นาที
                </Text>
              </View>

              {/* Select Indicator */}
              <View
                style={[
                  styles.selectBtn,
                  isSelected ? styles.selectBtnActive : styles.selectBtnInactive,
                ]}
              >
                <Text
                  style={[
                    styles.selectBtnText,
                    isSelected ? styles.selectBtnTextActive : styles.selectBtnTextInactive,
                  ]}
                >
                  {isSelected ? 'กำลังดูร้าน' : 'เลือกโรงนี้'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    ...TYPOGRAPHY.bold,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pulseGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  liveText: {
    color: COLORS.green,
    fontSize: 10,
    ...TYPOGRAPHY.bold,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    width: 146,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: 'relative',
  },
  cardSelected: {
    borderColor: COLORS.sutOrangeBright,
    backgroundColor: COLORS.surfaceElevated,
    shadowColor: COLORS.sutOrange,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  nearestBadge: {
    position: 'absolute',
    top: -10,
    right: 8,
    backgroundColor: COLORS.sutOrange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nearestText: {
    color: COLORS.white,
    fontSize: 9,
    ...TYPOGRAPHY.bold,
  },
  canteenShortName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    ...TYPOGRAPHY.bold,
    marginBottom: 2,
  },
  canteenSub: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
    marginBottom: 8,
  },
  trafficDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  walkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  walkingIcon: {
    fontSize: 11,
  },
  walkingText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  selectBtn: {
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectBtnActive: {
    backgroundColor: COLORS.sutOrange,
  },
  selectBtnInactive: {
    backgroundColor: COLORS.surfaceLight,
  },
  selectBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  selectBtnTextActive: {
    color: COLORS.white,
  },
  selectBtnTextInactive: {
    color: COLORS.textSecondary,
  },
});

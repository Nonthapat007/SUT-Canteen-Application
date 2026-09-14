// Canteen Status Card matching Image 3 (Status Bar, Wait Time, Crowd Badge)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

export default function CanteenStatusCard({ selectedCanteen }) {
  const waitMinutes = selectedCanteen?.baseQueueMinutes || 15;
  const queueLevel = selectedCanteen?.queueLevel || 'Medium';

  // Compute progress bar color and width
  let barColor = COLORS.yellow;
  let barPercent = '50%';
  if (waitMinutes <= 5) {
    barColor = COLORS.green;
    barPercent = '25%';
  } else if (waitMinutes >= 20) {
    barColor = COLORS.red;
    barPercent = '85%';
  }

  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <Text style={styles.title}>Canteen Status</Text>
        <Text style={styles.subText}>~ {waitMinutes} min avg wait time</Text>

        {/* Status Bar Row */}
        <View style={styles.barRow}>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: barPercent, backgroundColor: barColor }]} />
          </View>
          <Text style={[styles.levelLabel, { color: barColor }]}>{queueLevel}</Text>
        </View>
      </View>

      {/* Right Crowd Icon */}
      <View style={styles.iconBox}>
        <Text style={styles.crowdEmoji}>👥</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leftCol: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    ...TYPOGRAPHY.bold,
    marginBottom: 4,
  },
  subText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceSubtle,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 46,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crowdEmoji: {
    fontSize: 22,
  },
});

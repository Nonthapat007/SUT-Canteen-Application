// Merchant Sales & Analytics Summary Screen matching Reference Image 3
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Icon from '../../components/common/Icon';

export default function MerchantSummaryScreen() {
  // Mock monthly data for the bar chart
  const monthlyBars = [
    { month: 'ต.ค.', height: 50 },
    { month: 'พ.ย.', height: 56 },
    { month: 'ธ.ค.', height: 48 },
    { month: 'ม.ค.', height: 68 },
    { month: 'ก.พ.', height: 72 },
    { month: 'มี.ค.', height: 54 },
    { month: 'เม.ย.', height: 78 },
    { month: 'พ.ค.', height: 84 },
    { month: 'มิ.ย.', height: 62 },
    { month: 'ก.ค.', height: 92 },
    { month: 'ส.ค.', height: 100, active: true },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header matching Image 3 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>สรุปยอดวันนี้</Text>
        <Text style={styles.headerDate}>วันอังคารที่ 8 กันยายน</Text>
      </View>

      <View style={styles.content}>
        {/* 2x2 Metric Cards Grid */}
        <View style={styles.grid}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            {/* Card 1: จำนวนออเดอร์ */}
            <View style={styles.metricCard}>
              <View style={styles.iconCirclePeach}>
                <Icon name="package" size={18} color="#EA580C" variant="filled" />
              </View>
              <Text style={styles.metricLabel}>จำนวนออเดอร์</Text>
              <Text style={styles.metricBigValue}>42</Text>
              <Text style={styles.trendGreen}>▲ 12% จากเมื่อวาน</Text>
            </View>

            {/* Card 2: ยอดขาย */}
            <View style={styles.metricCard}>
              <View style={styles.iconCirclePeach}>
                <Icon name="wallet" size={18} color="#EA580C" variant="filled" />
              </View>
              <Text style={styles.metricLabel}>ยอดขาย</Text>
              <Text style={styles.metricBigValue}>฿3,240</Text>
              <Text style={styles.trendGreen}>▲ 8% จากเมื่อวาน</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.gridRow}>
            {/* Card 3: เมนูขายดี */}
            <View style={styles.metricCard}>
              <View style={styles.iconCirclePeach}>
                <Icon name="flame" size={18} color="#EA580C" variant="filled" />
              </View>
              <Text style={styles.metricLabel}>เมนูขายดี</Text>
              <Text style={styles.metricValueMedium} numberOfLines={2}>
                ก๋วยเตี๋ยวเรือสูตรพิเศษ
              </Text>
              <Text style={styles.metricSub}>18 ครั้งวันนี้</Text>
            </View>

            {/* Card 4: เวลาเตรียมเฉลี่ย */}
            <View style={styles.metricCard}>
              <View style={styles.iconCircleBlue}>
                <Icon name="clock" size={18} color="#0284C7" strokeWidth={2.2} />
              </View>
              <Text style={styles.metricLabel}>เวลาเตรียมเฉลี่ย</Text>
              <Text style={styles.metricBigValue}>8 นาที</Text>
              <Text style={styles.trendGreen}>▼ 1 นาที จากเมื่อวาน</Text>
            </View>
          </View>
        </View>

        {/* Monthly Sales Card & Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <View>
              <Text style={styles.chartTitle}>ยอดขายรายเดือน</Text>
              <Text style={styles.chartSub}>ย้อนหลัง 12 เดือน (หน่วย: บาท)</Text>
            </View>
            <Text style={styles.compareText}>▼ 100% จากเดือนที่แล้ว</Text>
          </View>

          {/* Highlight Badge */}
          <View style={styles.highlightBadge}>
            <Text style={styles.badgeMonth}>ส.ค. 2569</Text>
            <Text style={styles.badgeAmount}>฿90,200 • 1156 ออเดอร์</Text>
          </View>

          {/* Bar Chart Visualization */}
          <View style={styles.barChartContainer}>
            {monthlyBars.map((b, idx) => (
              <View key={idx} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    { height: b.height },
                    b.active ? styles.barActive : styles.barInactive,
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    ...TYPOGRAPHY.black,
    marginBottom: 2,
  },
  headerDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
    ...TYPOGRAPHY.medium,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  grid: {
    gap: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  iconCirclePeach: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircleBlue: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconEmoji: {
    fontSize: 16,
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    ...TYPOGRAPHY.bold,
    marginBottom: 6,
  },
  metricBigValue: {
    color: COLORS.textPrimary,
    fontSize: 22,
    ...TYPOGRAPHY.black,
    marginBottom: 4,
  },
  metricValueMedium: {
    color: COLORS.textPrimary,
    fontSize: 14,
    ...TYPOGRAPHY.bold,
    marginBottom: 4,
    minHeight: 36,
  },
  trendGreen: {
    color: '#059669',
    fontSize: 10,
    ...TYPOGRAPHY.bold,
  },
  metricSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    ...TYPOGRAPHY.medium,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  chartTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    ...TYPOGRAPHY.bold,
    marginBottom: 2,
  },
  chartSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  compareText: {
    color: '#991B1B',
    fontSize: 10,
    ...TYPOGRAPHY.bold,
    textAlign: 'right',
  },
  highlightBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeMonth: {
    color: COLORS.textPrimary,
    fontSize: 12,
    ...TYPOGRAPHY.bold,
  },
  badgeAmount: {
    color: COLORS.textPrimary,
    fontSize: 12,
    ...TYPOGRAPHY.bold,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 18,
    borderRadius: 4,
  },
  barInactive: {
    backgroundColor: '#FFEDD5',
  },
  barActive: {
    backgroundColor: '#FFEDD5',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
});

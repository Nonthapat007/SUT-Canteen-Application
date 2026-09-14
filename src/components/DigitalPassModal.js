import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT_FAMILY, TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';

export default function DigitalPassModal({ visible, onClose, order, onCompletePickup }) {
  if (!visible || !order) return null;

  const isGrabAndGo = order.type === 'GRAB_AND_GO';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.typeBadge,
                  isGrabAndGo ? styles.badgePurple : styles.badgeOrange,
                ]}
              >
                {isGrabAndGo ? (
                  <Icon name="zap" size={12} color="#FFFFFF" variant="filled" />
                ) : (
                  <Icon name="clock" size={12} color="#FFFFFF" strokeWidth={2.2} />
                )}
                <Text style={styles.typeBadgeText}>
                  {isGrabAndGo ? 'FAST-LANE 0 นาที' : 'PREDICTIVE SLOTTING'}
                </Text>
              </View>
              <Text style={styles.passTitle}>SUT Express Pass</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={18} color={COLORS.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Order Identity Bar */}
          <View style={styles.orderIdBar}>
            <Text style={styles.orderNumber}>คิวที่ {order.orderNumber}</Text>
            <Text style={styles.orderIdSub}>รหัส: {order.id}</Text>
          </View>

          {/* Simulated Animated QR Box */}
          <View style={styles.qrContainer}>
            <View style={styles.qrMatrix}>
              {/* Modern styled QR simulation with corner markers */}
              <View style={[styles.qrCorner, styles.qrCornerTL]} />
              <View style={[styles.qrCorner, styles.qrCornerTR]} />
              <View style={[styles.qrCorner, styles.qrCornerBL]} />
              
              <View style={styles.qrCenterBox}>
                <Text style={styles.qrCenterLogo}>มทส.</Text>
                <Text style={styles.qrCenterSub}>EXPRESS</Text>
              </View>
            </View>

            <View style={styles.pinDisplay}>
              <Text style={styles.pinLabel}>PIN สำหรับกดตู้ / ยืนยันแม่ค้า:</Text>
              <Text style={styles.pinCode}>{order.pickupQrPin || '8821'}</Text>
            </View>
          </View>

          {/* Pickup Instructions */}
          <View style={styles.instructionsBox}>
            <View style={styles.infoLine}>
              <Icon name="location" size={12} color={COLORS.primary} variant="filled" />
              <Text style={styles.canteenTitle}>{order.canteenName}</Text>
            </View>
            <View style={styles.infoLine}>
              <Icon name="store" size={12} color={COLORS.primary} strokeWidth={2} />
              <Text style={styles.stallTitle}>{order.stallName}</Text>
            </View>
            {order.pickupSpot && (
              <View style={styles.infoLine}>
                <Icon name="box" size={12} color={COLORS.green} strokeWidth={2} />
                <Text style={styles.spotHighlight}>{order.pickupSpot}</Text>
              </View>
            )}

            <View style={styles.itemsList}>
              {order.items.map((it, idx) => (
                <Text key={idx} style={styles.itemLine}>
                  • {it.name} x{it.qty} (฿{it.price})
                </Text>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={() => {
                onCompletePickup(order.id);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.completeBtnContent}>
                <Icon name="check" size={15} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.completeBtnText}>
                  สแกนรับของเรียบร้อยแล้ว (จำลองการรับ)
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePurple: {
    backgroundColor: COLORS.expressPurple,
  },
  badgeOrange: {
    backgroundColor: COLORS.sutOrange,
  },
  typeBadgeText: {
    ...TYPOGRAPHY.black,
    color: COLORS.white,
    fontSize: 10,
  },
  passTitle: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
  },
  closeText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  orderIdBar: {
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  orderNumber: {
    ...TYPOGRAPHY.black,
    color: COLORS.sutGold,
    fontSize: 22,
    letterSpacing: 1,
  },
  orderIdSub: {
    ...TYPOGRAPHY.regular,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  qrMatrix: {
    width: 170,
    height: 170,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBorderLight,
  },
  qrCorner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderWidth: 6,
    borderColor: COLORS.black,
  },
  qrCornerTL: {
    top: 10,
    left: 10,
  },
  qrCornerTR: {
    top: 10,
    right: 10,
  },
  qrCornerBL: {
    bottom: 10,
    left: 10,
  },
  qrCenterBox: {
    backgroundColor: COLORS.sutOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  qrCenterLogo: {
    ...TYPOGRAPHY.black,
    color: COLORS.white,
    fontSize: 13,
  },
  qrCenterSub: {
    ...TYPOGRAPHY.extraBold,
    color: COLORS.sutGoldLight,
    fontSize: 8,
  },
  pinDisplay: {
    marginTop: 10,
    alignItems: 'center',
  },
  pinLabel: {
    ...TYPOGRAPHY.regular,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  pinCode: {
    ...TYPOGRAPHY.black,
    color: COLORS.textPrimary,
    fontSize: 20,
    letterSpacing: 4,
  },
  instructionsBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  canteenTitle: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  stallTitle: {
    ...TYPOGRAPHY.bold,
    color: COLORS.sutGold,
    fontSize: 12,
  },
  spotHighlight: {
    ...TYPOGRAPHY.bold,
    color: COLORS.green,
    fontSize: 11,
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 6,
    marginTop: 4,
  },
  itemLine: {
    ...TYPOGRAPHY.regular,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  footer: {
    paddingTop: 4,
  },
  completeBtn: {
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completeBtnText: {
    ...TYPOGRAPHY.extraBold,
    color: COLORS.white,
    fontSize: 13,
  },
});

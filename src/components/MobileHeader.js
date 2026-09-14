// Mobile Header matching Image 3 (Avatar, Greeting, Canteen Selector, Search)
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT_FAMILY, TYPOGRAPHY } from '../constants/typography';
import { SUT_CANTEENS } from '../constants/campusData';
import Icon from './common/Icon';
import CanteenSelectModal from './CanteenSelectModal';
import { sanitizeAvatarUri } from '../utils/imageUtils';

export default function MobileHeader({
  userName = 'Sarawut',
  avatarUri = null,
  selectedCanteen,
  onSelectCanteen,
  onOpenSearch,
  onOpenProfile,
}) {
  const [showCanteenPicker, setShowCanteenPicker] = useState(false);
  const cleanAvatarUri = sanitizeAvatarUri(avatarUri);

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {/* User Avatar with photo if available, links to Profile on press */}
        <TouchableOpacity
          style={styles.avatarIconWrap}
          onPress={onOpenProfile}
          activeOpacity={0.8}
        >
          {cleanAvatarUri ? (
            <Image source={{ uri: cleanAvatarUri }} style={styles.avatarImg} />
          ) : (
            <Icon name="user" size={20} color={COLORS.primary} strokeWidth={2.2} />
          )}
        </TouchableOpacity>

        {/* Greeting & Canteen Location */}
        <View style={styles.textCol}>
          <Text style={styles.greetingText}>สวัสดี, {userName}!</Text>
          
          <TouchableOpacity
            style={styles.locationPill}
            onPress={() => setShowCanteenPicker(true)}
            activeOpacity={0.7}
          >
            <Icon name="location" size={12} color={COLORS.primary} variant="filled" />
            <Text style={styles.locationText} numberOfLines={1}>
              {selectedCanteen?.thaiName || selectedCanteen?.shortName || 'โรงอาหารกาสะลองคำ'}
            </Text>
            <Icon name="chevron-down" size={10} color={COLORS.textSecondary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Circular Search Button */}
      <TouchableOpacity style={styles.searchBtn} onPress={onOpenSearch} activeOpacity={0.8}>
        <Icon name="search" size={18} color={COLORS.textPrimary} strokeWidth={2} />
      </TouchableOpacity>

      {/* Modern Canteen Selector Modal matching Reference Image 2 */}
      <CanteenSelectModal
        visible={showCanteenPicker}
        onClose={() => setShowCanteenPicker(false)}
        selectedCanteen={selectedCanteen}
        onSelectCanteen={onSelectCanteen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  avatarIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 94, 58, 0.25)',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  greetingText: {
    ...TYPOGRAPHY.extraBold,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 2,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  pinIcon: {
    fontSize: 11,
  },
  locationText: {
    ...TYPOGRAPHY.medium,
    color: COLORS.textSecondary,
    fontSize: 12,
    flexShrink: 1,
  },
  dropdownChevron: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginLeft: 2,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  modalTitle: {
    ...TYPOGRAPHY.extraBold,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  modalCloseText: {
    ...TYPOGRAPHY.bold,
    color: COLORS.textSecondary,
    fontSize: 16,
    padding: 4,
  },
  canteenList: {
    marginBottom: 10,
  },
  canteenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  canteenItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  canteenInfo: {
    flex: 1,
  },
  canteenName: {
    ...TYPOGRAPHY.extraBold,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 2,
  },
  canteenNameActive: {
    color: COLORS.primary,
  },
  canteenSub: {
    ...TYPOGRAPHY.regular,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  queueNote: {
    ...TYPOGRAPHY.medium,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  checkIcon: {
    ...TYPOGRAPHY.black,
    color: COLORS.primary,
    fontSize: 18,
    marginLeft: 10,
  },
});

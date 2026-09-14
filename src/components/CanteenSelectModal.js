// Canteen Select Modal matching Reference Image 2 (Select Delivery Canteen)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { SUT_CANTEENS } from '../constants/campusData';
import { TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';

export default function CanteenSelectModal({
  visible = false,
  onClose,
  selectedCanteen,
  onSelectCanteen,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCanteens = SUT_CANTEENS.filter((canteen) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      canteen.name.toLowerCase().includes(query) ||
      canteen.thaiName.toLowerCase().includes(query) ||
      (canteen.locationNote && canteen.locationNote.toLowerCase().includes(query))
    );
  });

  const handleSelect = (canteen) => {
    if (onSelectCanteen) {
      onSelectCanteen(canteen);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* 1. Header Bar matching Image 2 */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="close" size={22} color="#0F172A" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Delivery Canteen</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* 2. Search Bar matching Image 2 */}
          <View style={styles.searchContainer}>
            <View style={styles.searchWrapper}>
              <Icon name="search" size={18} color="#64748B" strokeWidth={2} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a canteen..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <Icon name="close" size={14} color="#64748B" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 3. CURRENT SELECTION Section matching Image 2 */}
            <View style={styles.sectionHeaderWrap}>
              <Text style={styles.sectionLabel}>CURRENT SELECTION</Text>
            </View>

            <TouchableOpacity
              style={styles.currentCard}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <View style={styles.currentCardLeft}>
                <View style={styles.pinCircle}>
                  <Icon name="location" size={20} color={COLORS.primary} variant="filled" />
                </View>
                <View style={styles.currentCardTextCol}>
                  <Text style={styles.currentCanteenName} numberOfLines={2}>
                    {selectedCanteen?.thaiName || 'โรงอาหารอาคารเรียนรวม 2'}
                  </Text>
                  {selectedCanteen?.locationNote && (
                    <Text style={styles.currentCanteenSub}>
                      {selectedCanteen.locationNote}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.checkCircleActive}>
                <Icon name="check" size={13} color="#FFFFFF" strokeWidth={3} />
              </View>
            </TouchableOpacity>

            {/* 4. ALL CANTEENS Section matching Image 2 (2-Column Grid) */}
            <View style={[styles.sectionHeaderWrap, { marginTop: 24 }]}>
              <Text style={styles.sectionLabel}>ALL CANTEENS</Text>
            </View>

            <View style={styles.gridContainer}>
              {filteredCanteens.map((canteen) => {
                const isSelected = canteen.id === selectedCanteen?.id;
                return (
                  <TouchableOpacity
                    key={canteen.id}
                    style={[styles.canteenGridCard, isSelected && styles.canteenGridCardSelected]}
                    onPress={() => handleSelect(canteen)}
                    activeOpacity={0.85}
                  >
                    {/* Canteen Photo */}
                    <View style={styles.canteenImageWrap}>
                      <Image
                        source={{ uri: canteen.imageUrl }}
                        style={styles.canteenImage}
                        resizeMode="cover"
                      />

                      {/* Selected Checkmark Badge on photo top-right */}
                      {isSelected && (
                        <View style={styles.cardCheckmarkBadge}>
                          <Icon name="check" size={12} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </View>

                    {/* Canteen Name */}
                    <View style={styles.canteenCardInfo}>
                      <Text
                        style={[styles.gridThaiName, isSelected && styles.gridThaiNameSelected]}
                        numberOfLines={2}
                      >
                        {canteen.thaiName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  // Top Header Bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 17,
    ...TYPOGRAPHY.bold,
  },
  // Search Bar
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    height: '100%',
    ...TYPOGRAPHY.regular,
  },
  clearSearchBtn: {
    padding: 6,
  },
  // Content
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeaderWrap: {
    marginTop: 14,
    marginBottom: 8,
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    ...TYPOGRAPHY.bold,
    letterSpacing: 0.6,
  },
  // CURRENT SELECTION Card
  currentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  currentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  pinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentCardTextCol: {
    flex: 1,
  },
  currentCanteenName: {
    color: '#0F172A',
    fontSize: 15,
    ...TYPOGRAPHY.bold,
    lineHeight: 20,
  },
  currentCanteenSub: {
    color: '#64748B',
    fontSize: 11,
    ...TYPOGRAPHY.medium,
    marginTop: 2,
  },
  checkCircleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ALL CANTEENS 2-Column Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  canteenGridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  canteenGridCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  canteenImageWrap: {
    width: '100%',
    height: 112,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  canteenImage: {
    width: '100%',
    height: '100%',
  },
  cardCheckmarkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  canteenCardInfo: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  gridThaiName: {
    color: '#0F172A',
    fontSize: 13,
    ...TYPOGRAPHY.bold,
    lineHeight: 18,
  },
  gridThaiNameSelected: {
    color: COLORS.primary,
  },
});

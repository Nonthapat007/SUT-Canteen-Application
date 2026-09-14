import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import Icon from './common/Icon';
import { getFoodImageFallback } from '../utils/imageUtils';

export default function RecommendedMenusSection({
  items = [],
  onSelectMenu,
}) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.fireBadge}>
            <Icon name="flame" size={13} color="#FFFFFF" variant="filled" />
          </View>
          <Text style={styles.sectionTitle}>เมนูแนะนำ</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          เมนูยอดนิยมจากร้านค้า ปรุงสดใหม่พร้อมเสิร์ฟ
        </Text>
      </View>

      {/* Menus List or Empty State */}
      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Icon name="star" size={24} color="#EA580C" strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyTitle}>ยังไม่มีเมนูแนะนำในโรงอาหารนี้</Text>
            <Text style={styles.emptyDesc}>
              ร้านค้าสามารถเปิดปุ่ม "เมนูแนะนำ" ในหน้าจัดการเมนู เพื่อนำเมนูมาแสดงที่นี่ได้ทันที
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {items.map(({ menu, stall }) => {
            const imageUri = menu.imageUrl || menu.image || getFoodImageFallback(menu.thaiName || menu.name);
            const queueCount = stall.currentQueueCount || Math.floor(Math.random() * 3) + 1;
            const waitTime = stall.waitMinutes || (queueCount * 3);

            return (
              <TouchableOpacity
                key={`${stall.id}_${menu.id}`}
                style={styles.foodCard}
                onPress={() => onSelectMenu(menu, stall)}
                activeOpacity={0.85}
              >
                {/* Food Image Container */}
                <View style={styles.imageContainer}>
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.foodImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.noImagePlaceholder}>
                      <Icon name="burger" size={32} color={COLORS.primary} strokeWidth={1.5} />
                    </View>
                  )}

                  {/* Popular Badge */}
                  <View style={styles.popularBadge}>
                    <Icon name="star" size={10} color="#FFFFFF" variant="filled" />
                    <Text style={styles.popularBadgeText}>แนะนำ</Text>
                  </View>

                  {/* Price Tag Overlay */}
                  <View style={styles.priceTag}>
                    <Text style={styles.priceTagText}>฿{menu.price}</Text>
                  </View>
                </View>

                {/* Food Card Details */}
                <View style={styles.cardDetails}>
                  <Text style={styles.foodName} numberOfLines={1}>
                    {menu.thaiName || menu.name}
                  </Text>

                  {/* Stall Info: "อยู่ร้านไหน" */}
                  <View style={styles.stallRow}>
                    <Icon name="store" size={12} color={COLORS.sutGold} strokeWidth={2} />
                    <Text style={styles.stallName} numberOfLines={1}>
                      {stall.thaiName || stall.name}
                    </Text>
                  </View>

                  {/* Queue Info: "มีกี่คิว" */}
                  <View style={styles.queueBadgeRow}>
                    <View style={styles.queuePill}>
                      <Icon name="clock" size={11} color="#C2410C" strokeWidth={2.2} />
                      <Text style={styles.queueText}>
                        {queueCount} คิวหน้าร้าน (~{waitTime} น.)
                      </Text>
                    </View>
                  </View>

                  {/* Quick Order Button */}
                  <TouchableOpacity
                    style={styles.orderBtn}
                    onPress={() => onSelectMenu(menu, stall)}
                    activeOpacity={0.8}
                  >
                    <Icon name="plus" size={13} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.orderBtnText}>สั่งเลย</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  fireBadge: {
    backgroundColor: '#EA580C',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.extraBold,
    fontSize: 17,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  foodCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#FFF7ED',
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EA580C',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularBadgeText: {
    ...TYPOGRAPHY.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priceTagText: {
    ...TYPOGRAPHY.black,
    fontSize: 13,
    color: '#FFFFFF',
  },
  cardDetails: {
    padding: 12,
  },
  foodName: {
    ...TYPOGRAPHY.extraBold,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  stallName: {
    ...TYPOGRAPHY.medium,
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  queueBadgeRow: {
    marginBottom: 10,
  },
  queuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignSelf: 'flex-start',
  },
  queueText: {
    ...TYPOGRAPHY.bold,
    fontSize: 10,
    color: '#C2410C',
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  orderBtnText: {
    ...TYPOGRAPHY.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    gap: 12,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...TYPOGRAPHY.bold,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  emptyDesc: {
    ...TYPOGRAPHY.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
});

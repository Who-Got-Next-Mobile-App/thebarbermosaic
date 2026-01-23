import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../context/BookingContext';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { SERVICES, formatPrice, formatDuration } from '../utils/services';
import { Service, ServiceCategory } from '../types';

interface ServicesScreenProps {
  navigation: any;
}

const CATEGORIES: { key: ServiceCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'haircut', label: 'Haircuts' },
  { key: 'beard', label: 'Beard' },
  { key: 'combo', label: 'Combos' },
  { key: 'kids', label: 'Kids' },
  { key: 'specialty', label: 'Specialty' },
];

export const ServicesScreen: React.FC<ServicesScreenProps> = ({ navigation }) => {
  const { setSelectedService } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');

  const filteredServices = selectedCategory === 'all'
    ? SERVICES.filter(s => s.isActive)
    : SERVICES.filter(s => s.category === selectedCategory && s.isActive);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    navigation.navigate('Booking');
  };

  const renderServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleSelectService(item)}
    >
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.serviceDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{formatDuration(item.duration)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.servicePriceContainer}>
        <Text style={styles.servicePrice}>{formatPrice(item.price)}</Text>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => handleSelectService(item)}
        >
          <Ionicons name="add" size={20} color={colors.black} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Services</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Category Filter */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.key && styles.categoryTextActive,
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Services List */}
      <FlatList
        data={filteredServices}
        renderItem={renderServiceCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  categoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: colors.black,
  },
  servicesList: {
    padding: spacing.lg,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  serviceName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  servicePriceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  servicePrice: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
  },
  selectButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


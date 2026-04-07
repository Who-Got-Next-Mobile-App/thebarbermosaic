import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ProStackParamList } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { BadgeChip } from '../../../components';
import { StarRatingDisplay } from '../../../components';
import { PROFESSION_LABELS } from '../../../utils/badges';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Nav = NativeStackNavigationProp<ProStackParamList>;

export const ProProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { barberProfile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!barberProfile) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.header}>
          {barberProfile.photoURL ? (
            <Image source={{ uri: barberProfile.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={40} color={colors.textMuted} />
            </View>
          )}
          <Text style={styles.name}>{barberProfile.displayName}</Text>
          <Text style={styles.professions}>{barberProfile.professions.map((p) => PROFESSION_LABELS[p]).join(' · ')}</Text>
          <StarRatingDisplay rating={barberProfile.rating} reviewCount={barberProfile.reviewCount} size={16} />
        </View>

        {/* Badges */}
        {barberProfile.selectedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Badges</Text>
            <View style={styles.badgeRow}>
              {barberProfile.selectedBadges.map((id) => <BadgeChip key={id} badgeId={id} selected />)}
            </View>
          </View>
        )}

        {barberProfile.platformBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earned Badges</Text>
            <View style={styles.badgeRow}>
              {barberProfile.platformBadges.map((id) => <BadgeChip key={id} badgeId={id} platform />)}
            </View>
          </View>
        )}

        {/* Booking link */}
        {barberProfile.bookingSlug && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Link</Text>
            <View style={styles.linkCard}>
              <Text style={styles.linkText}>barberflow.com/book/{barberProfile.bookingSlug}</Text>
            </View>
          </View>
        )}

        {/* Menu items */}
        <View style={styles.menu}>
          {MENU_ITEMS.map(({ icon, label, screen }) => (
            <TouchableOpacity key={label} style={styles.menuItem} onPress={() => navigation.navigate(screen as any)}>
              <Ionicons name={icon as any} size={20} color={colors.textSecondary} />
              <Text style={styles.menuLabel}>{label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.menuItem, styles.signOutItem]} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.menuLabel, styles.signOutLabel]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'Edit Profile', screen: 'Settings' },
  { icon: 'cut-outline', label: 'Services', screen: 'ServiceManager' },
  { icon: 'calendar-outline', label: 'Availability', screen: 'AvailabilityManager' },
  { icon: 'ribbon-outline', label: 'Badges', screen: 'BadgeManager' },
  { icon: 'images-outline', label: 'Portfolio', screen: 'Portfolio' },
  { icon: 'calculator-outline', label: 'TaxFlow™', screen: 'TaxFlowDashboard' },
  { icon: 'pricetag-outline', label: 'Promo Codes', screen: 'PromoCodeManager' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  professions: { color: colors.textSecondary, fontSize: fontSize.md },
  section: { marginBottom: spacing.xl },
  sectionTitle: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  linkCard: { backgroundColor: colors.primaryMuted, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.primary },
  linkText: { color: colors.primary, fontSize: fontSize.sm },
  menu: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { flex: 1, color: colors.text, fontSize: fontSize.md },
  signOutItem: { borderBottomWidth: 0 },
  signOutLabel: { color: colors.error },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Barber } from '../types';
import { BadgeChip } from './BadgeChip';
import { colors, borderRadius, fontSize, spacing, shadow } from '../theme';
import { PROFESSION_LABELS } from '../utils/badges';

interface ProfessionalCardProps {
  barber: Barber;
  distanceMiles?: number;
  nextSlot?: string; // e.g. "Today 3:00 PM"
  onPress: () => void;
  onBookNow: () => void;
  style?: ViewStyle;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  barber,
  distanceMiles,
  nextSlot,
  onPress,
  onBookNow,
  style,
}) => {
  const professionLabels = barber.professions.map((p) => PROFESSION_LABELS[p]).join(' · ');

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
      {/* Photo */}
      <View style={styles.photoContainer}>
        {barber.photoURL ? (
          <Image source={{ uri: barber.photoURL }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Ionicons name="person" size={32} color={colors.textMuted} />
          </View>
        )}
        {barber.acceptsWalkIns && (
          <View style={styles.walkInBadge}>
            <Text style={styles.walkInText}>Walk-ins</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {/* Row 1: Name + Distance */}
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{barber.displayName}</Text>
          {distanceMiles !== undefined && (
            <Text style={styles.distance}>{distanceMiles.toFixed(1)} mi</Text>
          )}
        </View>

        {/* Row 2: Professions */}
        <Text style={styles.professions} numberOfLines={1}>{professionLabels}</Text>

        {/* Row 3: Rating + Review count */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.primary} />
          <Text style={styles.rating}>{barber.rating > 0 ? barber.rating.toFixed(1) : 'New'}</Text>
          {barber.reviewCount > 0 && (
            <Text style={styles.reviewCount}>({barber.reviewCount})</Text>
          )}
        </View>

        {/* Badges: top 3 self-selected */}
        {barber.selectedBadges.length > 0 && (
          <View style={styles.badgeRow}>
            {barber.selectedBadges.slice(0, 3).map((id) => (
              <BadgeChip key={id} badgeId={id} style={styles.badgeChip} />
            ))}
          </View>
        )}

        {/* Platform badges row */}
        {barber.platformBadges.length > 0 && (
          <View style={styles.badgeRow}>
            {barber.platformBadges.slice(0, 2).map((id) => (
              <BadgeChip key={id} badgeId={id} platform style={styles.badgeChip} />
            ))}
          </View>
        )}

        {/* Next slot + Book Now */}
        <View style={styles.footer}>
          {nextSlot ? (
            <View style={styles.nextSlot}>
              <Ionicons name="calendar-outline" size={12} color={colors.success} />
              <Text style={styles.nextSlotText}>{nextSlot}</Text>
            </View>
          ) : (
            <Text style={styles.noSlot}>No upcoming slots</Text>
          )}
          <TouchableOpacity style={styles.bookBtn} onPress={onBookNow}>
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Compact version for favorites list ──────────────────────────────────────

interface FavoriteCardProps {
  barber: Barber;
  nextSlot?: string;
  onPress: () => void;
  onBook: () => void;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = ({
  barber,
  nextSlot,
  onPress,
  onBook,
}) => (
  <TouchableOpacity style={styles.favCard} onPress={onPress} activeOpacity={0.8}>
    {barber.photoURL ? (
      <Image source={{ uri: barber.photoURL }} style={styles.favPhoto} />
    ) : (
      <View style={[styles.favPhoto, styles.photoPlaceholder]}>
        <Ionicons name="person" size={22} color={colors.textMuted} />
      </View>
    )}
    <View style={styles.favInfo}>
      <Text style={styles.favName} numberOfLines={1}>{barber.displayName}</Text>
      {nextSlot ? (
        <Text style={styles.favSlot}>{nextSlot}</Text>
      ) : (
        <Text style={styles.noSlot}>No upcoming slots</Text>
      )}
    </View>
    <TouchableOpacity style={styles.favBookBtn} onPress={onBook}>
      <Text style={styles.bookBtnText}>Book</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surfaceLight,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkInBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  walkInText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  info: {
    padding: spacing.md,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    flex: 1,
  },
  distance: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
  professions: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  reviewCount: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badgeChip: {},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextSlotText: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  noSlot: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  bookBtnText: {
    color: colors.black,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },

  // Favorite card
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  favPhoto: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
  },
  favInfo: {
    flex: 1,
  },
  favName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  favSlot: {
    color: colors.success,
    fontSize: fontSize.sm,
  },
  favBookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
});

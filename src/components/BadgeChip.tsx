import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { BadgeId } from '../types';
import { BADGE_MAP } from '../utils/badges';
import { colors, borderRadius, fontSize, spacing } from '../theme';

interface BadgeChipProps {
  badgeId: BadgeId;
  selected?: boolean;
  disabled?: boolean;
  platform?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const BadgeChip: React.FC<BadgeChipProps> = ({
  badgeId,
  selected = false,
  disabled = false,
  platform = false,
  onPress,
  style,
}) => {
  const badge = BADGE_MAP[badgeId];
  if (!badge) return null;

  const containerStyle = [
    styles.chip,
    selected && styles.chipSelected,
    platform && styles.chipPlatform,
    disabled && !selected && styles.chipDisabled,
    style,
  ];

  const content = (
    <View style={containerStyle}>
      <Text style={styles.emoji}>{badge.emoji}</Text>
      <Text style={[styles.label, selected && styles.labelSelected, disabled && !selected && styles.labelDisabled]}>
        {badge.label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled && !selected} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

// ─── Full badge card for the badge picker ────────────────────────────────────

interface BadgeCardProps {
  badgeId: BadgeId;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badgeId,
  selected,
  disabled,
  onPress,
}) => {
  const badge = BADGE_MAP[badgeId];
  if (!badge) return null;

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected, disabled && !selected && styles.cardDisabled]}
      onPress={onPress}
      disabled={disabled && !selected}
      activeOpacity={0.75}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{badge.emoji}</Text>
        {selected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
      <Text style={[styles.cardLabel, selected && styles.cardLabelSelected, disabled && !selected && styles.cardLabelDisabled]}>
        {badge.label}
      </Text>
      <Text style={[styles.cardDesc, disabled && !selected && styles.cardDescDisabled]} numberOfLines={2}>
        {badge.description}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Chip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  chipSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipPlatform: {
    backgroundColor: 'rgba(205, 127, 50, 0.15)',
    borderColor: colors.accent,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.primary,
  },
  labelDisabled: {
    color: colors.textMuted,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: '47%',
    marginBottom: spacing.sm,
  },
  cardSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  cardDisabled: {
    opacity: 0.35,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardEmoji: {
    fontSize: 24,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.black,
    fontSize: 11,
    fontWeight: '700',
  },
  cardLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardLabelSelected: {
    color: colors.primary,
  },
  cardLabelDisabled: {
    color: colors.textMuted,
  },
  cardDesc: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  cardDescDisabled: {
    color: colors.textMuted,
  },
});

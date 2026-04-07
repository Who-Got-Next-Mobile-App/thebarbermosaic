import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Profession } from '../types';
import { PROFESSION_LABELS, PROFESSION_EMOJIS } from '../utils/badges';
import { colors, borderRadius, fontSize, spacing } from '../theme';

interface ProfessionCardProps {
  profession: Profession;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const ProfessionCard: React.FC<ProfessionCardProps> = ({
  profession,
  selected,
  onPress,
  style,
}) => (
  <TouchableOpacity
    style={[styles.card, selected && styles.cardSelected, style]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Text style={styles.emoji}>{PROFESSION_EMOJIS[profession]}</Text>
    <Text style={[styles.label, selected && styles.labelSelected]}>
      {PROFESSION_LABELS[profession]}
    </Text>
    {selected && (
      <View style={styles.checkmark}>
        <Text style={styles.checkText}>✓</Text>
      </View>
    )}
  </TouchableOpacity>
);

// ─── Full grid of 5 profession cards ─────────────────────────────────────────

interface ProfessionSelectorProps {
  selected: Profession[];
  onToggle: (profession: Profession) => void;
  style?: ViewStyle;
}

const ALL_PROFESSIONS: Profession[] = [
  'barber',
  'hair_stylist',
  'nail_tech',
  'lash_tech',
  'makeup_artist',
];

export const ProfessionSelector: React.FC<ProfessionSelectorProps> = ({
  selected,
  onToggle,
  style,
}) => (
  <View style={[styles.grid, style]}>
    {ALL_PROFESSIONS.map((p) => (
      <ProfessionCard
        key={p}
        profession={p}
        selected={selected.includes(p)}
        onPress={() => onToggle(p)}
        style={styles.gridCard}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
  },
  cardSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridCard: {
    width: '47%',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing } from '../theme';

// ─── Display-only star rating ─────────────────────────────────────────────────

interface StarRatingDisplayProps {
  rating: number; // 0–5
  reviewCount?: number;
  size?: number;
  style?: ViewStyle;
}

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({
  rating,
  reviewCount,
  size = 14,
  style,
}) => (
  <View style={[styles.row, style]}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star-outline'}
        size={size}
        color={rating >= star - 0.5 ? colors.primary : colors.textMuted}
      />
    ))}
    {reviewCount !== undefined && (
      <Text style={[styles.count, { fontSize: size - 2 }]}>
        {rating > 0 ? rating.toFixed(1) : 'New'} {reviewCount > 0 && `(${reviewCount})`}
      </Text>
    )}
  </View>
);

// ─── Interactive star rating input ───────────────────────────────────────────

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  style?: ViewStyle;
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  size = 36,
  style,
}) => (
  <View style={[styles.row, styles.inputRow, style]}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => onChange(star)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
        <Ionicons
          name={value >= star ? 'star' : 'star-outline'}
          size={size}
          color={value >= star ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>
    ))}
  </View>
);

// ─── Star count labels (for review prompt) ────────────────────────────────────

const STAR_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent!',
};

interface StarRatingWithLabelProps {
  value: number;
  onChange: (rating: number) => void;
}

export const StarRatingWithLabel: React.FC<StarRatingWithLabelProps> = ({ value, onChange }) => (
  <View style={styles.withLabel}>
    <StarRatingInput value={value} onChange={onChange} size={40} />
    {value > 0 && (
      <Text style={styles.label}>{STAR_LABELS[value]}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inputRow: {
    gap: spacing.sm,
  },
  count: {
    color: colors.textSecondary,
    marginLeft: 4,
  },
  withLabel: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});

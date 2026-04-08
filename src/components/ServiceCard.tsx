import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Service } from '../types';
import { colors, borderRadius, fontSize, spacing } from '../theme';
import { formatCents } from '../utils/taxCalc';
import { PROFESSION_LABELS } from '../utils/badges';

// ─── Service card for client booking flow ────────────────────────────────────

interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  selected = false,
  onPress,
  style,
}) => (
  <TouchableOpacity
    style={[styles.card, selected && styles.cardSelected, style]}
    onPress={onPress}
    activeOpacity={0.75}
    disabled={!onPress}
  >
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={[styles.name, selected && styles.nameSelected]}>{service.name}</Text>
        {service.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {service.description}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={styles.metaText}>{service.durationMins} min</Text>
          </View>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{PROFESSION_LABELS[service.profession]}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.price, selected && styles.priceSelected]}>
          {formatCents(service.price)}
        </Text>
        {service.depositPercent > 0 ? (
          <Text style={styles.deposit}>
            {service.depositPercent}% deposit
          </Text>
        ) : null}
        {selected && (
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={14} color={colors.black} />
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Service card for barber dashboard (editable) ─────────────────────────────

interface DashboardServiceCardProps {
  service: Service;
  onEdit: () => void;
  onToggleActive: (active: boolean) => void;
}

export const DashboardServiceCard: React.FC<DashboardServiceCardProps> = ({
  service,
  onEdit,
  onToggleActive,
}) => (
  <View style={styles.dashCard}>
    <View style={styles.dashLeft}>
      <Text style={[styles.name, !service.isActive && styles.inactive]}>{service.name}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{formatCents(service.price)}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaText}>{service.durationMins} min</Text>
      </View>
    </View>
    <View style={styles.dashRight}>
      <Switch
        value={service.isActive}
        onValueChange={onToggleActive}
        trackColor={{ false: colors.border, true: colors.primaryMuted }}
        thumbColor={service.isActive ? colors.primary : colors.textMuted}
      />
      <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
        <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  // Client card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginRight: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  nameSelected: {
    color: colors.primary,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: 6,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  price: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  priceSelected: {
    color: colors.primary,
  },
  deposit: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  // Dashboard card
  dashCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  dashLeft: {
    flex: 1,
  },
  dashRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editBtn: {
    padding: spacing.xs,
  },
  inactive: {
    color: colors.textMuted,
  },
});

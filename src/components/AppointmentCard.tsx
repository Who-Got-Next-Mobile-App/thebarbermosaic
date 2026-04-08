import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appointment, AppointmentStatus } from '../types';
import { colors, borderRadius, fontSize, spacing } from '../theme';
import { formatCents } from '../utils/taxCalc';
import { format, parseISO } from 'date-fns';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: colors.statusPending, bg: colors.warningMuted },
  confirmed: { label: 'Confirmed', color: colors.statusConfirmed, bg: colors.successMuted },
  completed: { label: 'Completed', color: colors.statusCompleted, bg: colors.infoMuted },
  cancelled: { label: 'Cancelled', color: colors.statusCancelled, bg: colors.surface },
  no_show: { label: 'No Show', color: colors.statusNoShow, bg: colors.errorMuted },
};

// ─── Client-facing appointment card ──────────────────────────────────────────

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
  onRebook?: () => void;
  showRebook?: boolean;
  style?: ViewStyle;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
  onRebook,
  showRebook = false,
  style,
}) => {
  const config = STATUS_CONFIG[appointment.status];
  const start = parseISO(appointment.startTime);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={styles.header}>
        <View style={styles.dateBlock}>
          <Text style={styles.month}>{format(start, 'MMM').toUpperCase()}</Text>
          <Text style={styles.day}>{format(start, 'd')}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.serviceName} numberOfLines={1}>{appointment.serviceName}</Text>
          <Text style={styles.barberName} numberOfLines={1}>{appointment.barberDisplayName}</Text>
          <Text style={styles.time}>{format(start, 'h:mm a')}</Text>
        </View>
        <View style={styles.right}>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={styles.price}>{formatCents(appointment.servicePrice)}</Text>
        </View>
      </View>

      {showRebook && appointment.status === 'completed' && onRebook && (
        <TouchableOpacity style={styles.rebookBtn} onPress={onRebook}>
          <Ionicons name="refresh-outline" size={14} color={colors.primary} />
          <Text style={styles.rebookText}>Rebook</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// ─── Pro calendar card (compact, color-coded) ────────────────────────────────

interface CalendarAppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
  style?: ViewStyle;
}

export const CalendarAppointmentCard: React.FC<CalendarAppointmentCardProps> = ({
  appointment,
  onPress,
  style,
}) => {
  const config = STATUS_CONFIG[appointment.status];
  const start = parseISO(appointment.startTime);

  return (
    <TouchableOpacity
      style={[styles.calCard, { borderLeftColor: config.color }, style]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.calTime}>{format(start, 'h:mm a')}</Text>
      <View style={styles.calBody}>
        <Text style={styles.calClient} numberOfLines={1}>{appointment.clientDisplayName}</Text>
        <Text style={styles.calService} numberOfLines={1}>{appointment.serviceName}</Text>
      </View>
      <Text style={styles.calPrice}>{formatCents(appointment.servicePrice)}</Text>
    </TouchableOpacity>
  );
};

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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  dateBlock: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 44,
  },
  month: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  day: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    lineHeight: 26,
  },
  body: {
    flex: 1,
  },
  serviceName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  barberName: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  time: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  price: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rebookText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  // Calendar card
  calCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: 4,
    gap: spacing.sm,
  },
  calTime: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    width: 56,
  },
  calBody: {
    flex: 1,
  },
  calClient: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  calService: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  calPrice: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

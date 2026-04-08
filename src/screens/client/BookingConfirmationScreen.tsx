import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Image, Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { db } from '../../firebase/config';
import { Appointment, ClientStackParamList } from '../../types';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../theme';
import { formatCents } from '../../utils/taxCalc';

type Nav = NativeStackNavigationProp<ClientStackParamList>;
type RouteType = RouteProp<ClientStackParamList, 'BookingConfirmation'>;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDateTime(iso: string): { day: string; date: string; time: string } {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return {
    day: DAYS_FULL[d.getDay()],
    date: `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    time: `${h12}:${m} ${ampm}`,
  };
}

export const BookingConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteType>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'appointments', params.appointmentId)).then((snap) => {
      if (snap.exists()) setAppointment({ id: snap.id, ...snap.data() } as Appointment);
    }).finally(() => setLoading(false));
  }, [params.appointmentId]);

  const handleShare = () => {
    if (!appointment) return;
    const dt = formatDateTime(appointment.startTime);
    Share.share({
      message: `I just booked a ${appointment.serviceName} with ${appointment.barberDisplayName} on ${dt.date} at ${dt.time} via BarberFlow!`,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Could not load booking details.</Text>
      </SafeAreaView>
    );
  }

  const dt = formatDateTime(appointment.startTime);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated check mark placeholder */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>

        <Text style={styles.title}>You're Booked!</Text>
        <Text style={styles.subtitle}>
          Your appointment request has been sent to{'\n'}
          <Text style={styles.highlightName}>{appointment.barberDisplayName}</Text>
        </Text>

        {/* Booking Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="cut-outline" size={20} color={colors.primary} />
            <View style={styles.cardTextGroup}>
              <Text style={styles.cardLabel}>Service</Text>
              <Text style={styles.cardValue}>{appointment.serviceName}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <View style={styles.cardTextGroup}>
              <Text style={styles.cardLabel}>{dt.day}</Text>
              <Text style={styles.cardValue}>{dt.date}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <View style={styles.cardTextGroup}>
              <Text style={styles.cardLabel}>Time</Text>
              <Text style={styles.cardValue}>{dt.time}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <View style={styles.cardTextGroup}>
              <Text style={styles.cardLabel}>Amount</Text>
              <Text style={styles.cardValue}>{formatCents(appointment.servicePrice)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.pendingNote}>
          Awaiting confirmation from your professional. You'll receive a push notification once confirmed.
        </Text>

        {/* Action buttons */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Ionicons name="share-social-outline" size={18} color={colors.primary} />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('MessageThread', {
            threadId: appointment.messageThreadId,
            appointmentId: appointment.id,
          })}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Message {appointment.barberDisplayName}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={() => navigation.navigate('ClientTabs')}
          activeOpacity={0.8}
        >
          <Text style={styles.ghostBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xxl },

  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadow.lg,
  },

  title: {
    color: colors.text, fontSize: 30, fontWeight: '900',
    marginBottom: spacing.sm, textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted, fontSize: fontSize.lg,
    textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl,
  },
  highlightName: { color: colors.primary, fontWeight: '700' },

  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.xl,
    padding: spacing.lg, width: '100%', marginBottom: spacing.lg,
    ...shadow.md,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.md },
  cardTextGroup: { flex: 1 },
  cardLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  cardValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },

  pendingNote: {
    color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center',
    lineHeight: 20, marginBottom: spacing.xl, paddingHorizontal: spacing.md,
  },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  shareBtnText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '700' },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: borderRadius.xl,
    paddingVertical: spacing.md, width: '100%', marginBottom: spacing.sm,
  },
  primaryBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },

  ghostBtn: {
    paddingVertical: spacing.sm, width: '100%', alignItems: 'center',
  },
  ghostBtnText: { color: colors.textMuted, fontSize: fontSize.md },

  error: { color: colors.error, fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },
});

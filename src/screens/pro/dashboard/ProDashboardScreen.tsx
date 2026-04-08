import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { ProStackParamList, Appointment } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { AppointmentCard } from '../../../components';
import { formatCents } from '../../../utils/taxCalc';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';
import { format } from 'date-fns';

type Nav = NativeStackNavigationProp<ProStackParamList>;

export const ProDashboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { barberProfile, firebaseUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    if (!firebaseUser) return;
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const q = query(
        collection(db, 'appointments'),
        where('barberId', '==', firebaseUser.uid),
        where('status', 'in', ['pending', 'confirmed']),
        orderBy('startTime', 'asc'),
        limit(5),
      );
      const snap = await getDocs(q);
      const appts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
      setAppointments(appts);

      // Today earnings from completed appointments
      const earningsQ = query(
        collection(db, 'payments'),
        where('barberId', '==', firebaseUser.uid),
        where('status', '==', 'succeeded'),
      );
      const earningsSnap = await getDocs(earningsQ);
      const total = earningsSnap.docs
        .filter((d) => d.data().createdAt?.toDate?.()?.toISOString?.()?.startsWith(today))
        .reduce((sum, d) => sum + (d.data().barberPayout ?? 0), 0);
      setTodayEarnings(total);
    } catch {}
  };

  useEffect(() => { fetchDashboard(); }, [firebaseUser]);

  const onRefresh = async () => { setRefreshing(true); await fetchDashboard(); setRefreshing(false); };

  const isProfileIncomplete =
    !barberProfile?.photoURL ||
    !barberProfile?.stripeOnboardingComplete ||
    !barberProfile?.bio;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
            <Text style={styles.name}>{barberProfile?.displayName ?? 'Pro'}</Text>
          </View>
          {barberProfile?.photoURL ? (
            <Image source={{ uri: barberProfile.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={24} color={colors.textMuted} />
            </View>
          )}
        </View>

        {/* Today's stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's Earnings</Text>
            <Text style={styles.statValue}>{formatCents(todayEarnings)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Upcoming</Text>
            <Text style={styles.statValue}>{appointments.length}</Text>
          </View>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('TaxFlowDashboard')}>
            <Text style={styles.statLabel}>TaxFlow™</Text>
            <Text style={[styles.statValue, barberProfile?.subscriptionTier === 'taxflow' ? styles.active : styles.inactive]}>
              {barberProfile?.subscriptionTier === 'taxflow' ? 'Active' : 'Off'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Booking link */}
        {barberProfile?.bookingSlug ? (
          <TouchableOpacity style={styles.bookingLinkCard}>
            <View style={styles.bookingLinkLeft}>
              <Ionicons name="link-outline" size={18} color={colors.primary} />
              <Text style={styles.bookingLinkText} numberOfLines={1}>
                barberflow.com/book/{barberProfile.bookingSlug}
              </Text>
            </View>
            <Ionicons name="share-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        ) : null}

        {/* Setup checklist */}
        {isProfileIncomplete && (
          <View style={styles.checklist}>
            <Text style={styles.checklistTitle}>Finish setting up your profile</Text>
            {!barberProfile?.photoURL && (
              <ChecklistItem label="Add profile photo" onPress={() => navigation.navigate('Settings')} />
            )}
            {!barberProfile?.stripeOnboardingComplete && (
              <ChecklistItem label="Connect bank account" onPress={() => navigation.navigate('Settings')} />
            )}
            {!barberProfile?.bio && (
              <ChecklistItem label="Write your bio" onPress={() => navigation.navigate('Settings')} />
            )}
          </View>
        )}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map(({ icon, label, screen }) => (
            <TouchableOpacity
              key={label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(screen as any)}
              activeOpacity={0.75}
            >
              <Ionicons name={icon as any} size={24} color={colors.primary} />
              <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming appointments */}
        {appointments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appt.id })}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const ChecklistItem: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <TouchableOpacity style={styles.checklistItem} onPress={onPress}>
    <Ionicons name="ellipse-outline" size={14} color={colors.textMuted} />
    <Text style={styles.checklistText}>{label}</Text>
    <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
  </TouchableOpacity>
);

const QUICK_ACTIONS = [
  { icon: 'cut-outline', label: 'Services', screen: 'ServiceManager' },
  { icon: 'calendar-outline', label: 'Availability', screen: 'AvailabilityManager' },
  { icon: 'ribbon-outline', label: 'Badges', screen: 'BadgeManager' },
  { icon: 'images-outline', label: 'Portfolio', screen: 'Portfolio' },
  { icon: 'pricetag-outline', label: 'Promo Codes', screen: 'PromoCodeManager' },
  { icon: 'calculator-outline', label: 'TaxFlow™', screen: 'TaxFlowDashboard' },
];

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  greeting: { color: colors.textMuted, fontSize: fontSize.md },
  name: { color: colors.text, fontSize: 24, fontWeight: '800' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: 4 },
  statValue: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  active: { color: colors.success },
  inactive: { color: colors.textMuted },
  bookingLinkCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primaryMuted, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.primary },
  bookingLinkLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  bookingLinkText: { color: colors.primary, fontSize: fontSize.sm, flex: 1 },
  checklist: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  checklistTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.xs },
  checklistItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  checklistText: { color: colors.textSecondary, fontSize: fontSize.sm, flex: 1 },
  sectionTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md, marginTop: spacing.md },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  actionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', gap: spacing.xs, width: '30%', borderWidth: 1, borderColor: colors.border },
  actionLabel: { color: colors.textSecondary, fontSize: fontSize.xs, textAlign: 'center' },
});

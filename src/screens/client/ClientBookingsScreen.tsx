import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  collection, query, where, orderBy,
  onSnapshot, Timestamp,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Appointment, AppointmentStatus, ClientStackParamList } from '../../types';
import { AppointmentCard } from '../../components';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

type Nav = NativeStackNavigationProp<ClientStackParamList>;

type TabKey = 'upcoming' | 'past';

const STATUS_UPCOMING: AppointmentStatus[] = ['pending', 'confirmed'];
const STATUS_PAST: AppointmentStatus[] = ['completed', 'cancelled', 'no_show'];

export const ClientBookingsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { firebaseUser } = useAuth();
  const [tab, setTab] = useState<TabKey>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;

    const statusList = tab === 'upcoming' ? STATUS_UPCOMING : STATUS_PAST;
    const q = query(
      collection(db, 'appointments'),
      where('clientId', '==', firebaseUser.uid),
      where('status', 'in', statusList),
      orderBy('startTime', tab === 'upcoming' ? 'asc' : 'desc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment)));
      setLoading(false);
    });

    return unsub;
  }, [firebaseUser, tab]);

  const renderItem = useCallback(({ item }: { item: Appointment }) => (
    <AppointmentCard
      appointment={item}
      onPress={() => navigation.navigate('AppointmentHistoryDetail', { appointmentId: item.id })}
      onRebook={() => navigation.navigate('BookingFlow', { barberId: item.barberId })}
    />
  ), [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['upcoming', 'past'] as TabKey[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => { setLoading(true); setTab(t); }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'upcoming' ? 'Upcoming' : 'Past'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(a) => a.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>
                {tab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
              </Text>
              {tab === 'upcoming' && (
                <TouchableOpacity
                  style={styles.discoverBtn}
                  onPress={() => navigation.navigate('ClientTabs')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.discoverBtnText}>Find a Professional</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    color: colors.text, fontSize: 26, fontWeight: '800',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm,
  },
  tabs: {
    flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.full,
    alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: fontSize.md, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyTitle: { color: colors.textMuted, fontSize: fontSize.lg, fontWeight: '600' },
  discoverBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.xl,
  },
  discoverBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },
});

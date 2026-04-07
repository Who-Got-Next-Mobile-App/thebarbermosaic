import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar } from 'react-native-calendars';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { ProStackParamList, Appointment, AppointmentStatus } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { CalendarAppointmentCard } from '../../../components';
import { colors, fontSize, spacing } from '../../../theme';
import { format, parseISO, startOfDay, endOfDay, isSameDay } from 'date-fns';

type Nav = NativeStackNavigationProp<ProStackParamList>;

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: colors.statusPending,
  confirmed: colors.statusConfirmed,
  completed: colors.statusCompleted,
  cancelled: colors.statusCancelled,
  no_show: colors.statusNoShow,
};

export const ProCalendarScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { firebaseUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<'day' | 'week'>('day');

  // Real-time Firestore listener
  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(
      collection(db, 'appointments'),
      where('barberId', '==', firebaseUser.uid),
      where('status', 'in', ['pending', 'confirmed', 'completed']),
      orderBy('startTime', 'asc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment)));
    });
    return unsub;
  }, [firebaseUser]);

  // Build marked dates for calendar
  const markedDates: Record<string, any> = {};
  appointments.forEach((a) => {
    const dateStr = a.startTime.slice(0, 10);
    if (!markedDates[dateStr]) {
      markedDates[dateStr] = { dots: [] };
    }
    markedDates[dateStr].dots.push({ color: STATUS_COLORS[a.status] });
  });
  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] ?? {}),
    selected: true,
    selectedColor: colors.primary,
  };

  const dayAppointments = appointments.filter((a) => {
    const apptDate = parseISO(a.startTime);
    return isSameDay(apptDate, parseISO(selectedDate + 'T00:00:00'));
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* View toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'day' && styles.toggleBtnActive]}
          onPress={() => setView('day')}
        >
          <Text style={[styles.toggleText, view === 'day' && styles.toggleTextActive]}>Day</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'week' && styles.toggleBtnActive]}
          onPress={() => setView('week')}
        >
          <Text style={[styles.toggleText, view === 'week' && styles.toggleTextActive]}>Week</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <Calendar
          current={selectedDate}
          onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.background,
            textSectionTitleColor: colors.textMuted,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.black,
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: colors.textMuted,
            dotColor: colors.primary,
            selectedDotColor: colors.black,
            arrowColor: colors.primary,
            monthTextColor: colors.text,
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontSize: 12,
          }}
        />

        {/* Day appointments */}
        <View style={styles.daySection}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayTitle}>{format(parseISO(selectedDate + 'T00:00:00'), 'EEEE, MMMM d')}</Text>
            <Text style={styles.apptCount}>{dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}</Text>
          </View>

          {dayAppointments.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>No appointments</Text>
            </View>
          ) : (
            dayAppointments.map((appt) => (
              <CalendarAppointmentCard
                key={appt.id}
                appointment={appt}
                onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appt.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toggleRow: { flexDirection: 'row', margin: spacing.md, backgroundColor: colors.surface, borderRadius: 8, padding: 3 },
  toggleBtn: { flex: 1, paddingVertical: spacing.xs + 2, alignItems: 'center', borderRadius: 6 },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  toggleTextActive: { color: colors.black },
  daySection: { padding: spacing.lg },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  dayTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  apptCount: { color: colors.textMuted, fontSize: fontSize.sm },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { ProStackParamList, Appointment, AppointmentStatus } from '../../../types';
import { db } from '../../../firebase/config';
import { ScreenHeader } from '../../../components';
import { formatCents } from '../../../utils/taxCalc';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';
import { format, parseISO } from 'date-fns';

type Props = {
  navigation: NativeStackNavigationProp<ProStackParamList, 'AppointmentDetail'>;
  route: RouteProp<ProStackParamList, 'AppointmentDetail'>;
};

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: colors.statusPending },
  confirmed: { label: 'Confirmed', color: colors.statusConfirmed },
  completed: { label: 'Completed', color: colors.statusCompleted },
  cancelled: { label: 'Cancelled', color: colors.statusCancelled },
  no_show: { label: 'No Show', color: colors.statusNoShow },
};

export const AppointmentDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'appointments', appointmentId), (snap) => {
      if (snap.exists()) setAppointment({ id: snap.id, ...snap.data() } as Appointment);
    });
    return unsub;
  }, [appointmentId]);

  const updateStatus = async (status: AppointmentStatus, extraData?: Partial<Appointment>) => {
    const fieldMap: Partial<Record<AppointmentStatus, string>> = {
      confirmed: 'confirmedAt',
      completed: 'completedAt',
      cancelled: 'cancelledAt',
      no_show: 'completedAt',
    };
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status,
      [fieldMap[status] ?? 'updatedAt']: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...extraData,
    });
  };

  const handleConfirm = () => updateStatus('confirmed');
  const handleComplete = () => {
    Alert.alert('Mark Complete?', 'This will trigger the tip and review prompts for the client.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark Complete', onPress: () => updateStatus('completed') },
    ]);
  };
  const handleNoShow = () => {
    Alert.alert('Mark No-Show?', 'A no-show fee may be charged based on your policy.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark No-Show', onPress: () => updateStatus('no_show') },
    ]);
  };
  const handleCancel = () => {
    Alert.alert('Cancel Appointment?', 'The client will be notified and any deposit will be refunded.', [
      { text: 'Keep Appointment', style: 'cancel' },
      { text: 'Cancel', style: 'destructive', onPress: () => updateStatus('cancelled', { cancelledBy: 'barber' }) },
    ]);
  };

  if (!appointment) return <SafeAreaView style={styles.container} />;

  const start = parseISO(appointment.startTime);
  const statusConf = STATUS_CONFIG[appointment.status];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Appointment" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusConf.color + '22' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusConf.color }]} />
          <Text style={[styles.statusText, { color: statusConf.color }]}>{statusConf.label}</Text>
        </View>

        {/* Service + time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{appointment.serviceName}</Text>
          <View style={styles.infoRow}><Ionicons name="calendar-outline" size={16} color={colors.textMuted} /><Text style={styles.infoText}>{format(start, 'EEEE, MMMM d, yyyy')}</Text></View>
          <View style={styles.infoRow}><Ionicons name="time-outline" size={16} color={colors.textMuted} /><Text style={styles.infoText}>{format(start, 'h:mm a')} · {appointment.serviceDurationMins} min</Text></View>
        </View>

        {/* Client info */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Client</Text>
          <Text style={styles.clientName}>{appointment.clientDisplayName}</Text>
          <TouchableOpacity style={styles.messageBtn} onPress={() => navigation.navigate('AppointmentDetail', { appointmentId })}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
            <Text style={styles.messageBtnText}>Message Client</Text>
          </TouchableOpacity>
        </View>

        {/* Client note */}
        {appointment.clientNote && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Note from Client</Text>
            <Text style={styles.noteText}>{appointment.clientNote}</Text>
          </View>
        )}

        {/* Inspiration photo */}
        {appointment.inspirationPhotoURL && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Inspiration Photo</Text>
            <Image source={{ uri: appointment.inspirationPhotoURL }} style={styles.inspirationPhoto} resizeMode="cover" />
          </View>
        )}

        {/* Payment breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Payment</Text>
          <View style={styles.payRow}><Text style={styles.payLabel}>Service Price</Text><Text style={styles.payValue}>{formatCents(appointment.servicePrice)}</Text></View>
          {appointment.depositPaid > 0 && <View style={styles.payRow}><Text style={styles.payLabel}>Deposit Paid</Text><Text style={styles.payValue}>{formatCents(appointment.depositPaid)}</Text></View>}
          {appointment.remainingBalance > 0 && <View style={styles.payRow}><Text style={styles.payLabel}>Remaining</Text><Text style={[styles.payValue, styles.remaining]}>{formatCents(appointment.remainingBalance)}</Text></View>}
          {appointment.tipAmount > 0 && <View style={styles.payRow}><Text style={styles.payLabel}>Tip</Text><Text style={[styles.payValue, styles.tip]}>{formatCents(appointment.tipAmount)}</Text></View>}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {appointment.status === 'pending' && (
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.black} />
              <Text style={styles.confirmBtnText}>Confirm Appointment</Text>
            </TouchableOpacity>
          )}
          {appointment.status === 'confirmed' && (
            <TouchableOpacity style={styles.confirmBtn} onPress={handleComplete}>
              <Ionicons name="checkmark-done-outline" size={20} color={colors.black} />
              <Text style={styles.confirmBtnText}>Mark as Complete</Text>
            </TouchableOpacity>
          )}
          {['pending', 'confirmed'].includes(appointment.status) && (
            <>
              <TouchableOpacity style={styles.noShowBtn} onPress={handleNoShow}>
                <Text style={styles.noShowBtnText}>Mark No-Show</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>Cancel Appointment</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: borderRadius.full, alignSelf: 'flex-start' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: fontSize.sm, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  cardTitle: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoText: { color: colors.textSecondary, fontSize: fontSize.md },
  sectionLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  clientName: { color: colors.text, fontSize: fontSize.xl, fontWeight: '600' },
  messageBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  messageBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  noteText: { color: colors.text, fontSize: fontSize.md, lineHeight: 22 },
  inspirationPhoto: { width: '100%', height: 200, borderRadius: borderRadius.md },
  payRow: { flexDirection: 'row', justifyContent: 'space-between' },
  payLabel: { color: colors.textSecondary, fontSize: fontSize.md },
  payValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  remaining: { color: colors.warning },
  tip: { color: colors.success },
  actions: { gap: spacing.sm },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.full, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  confirmBtnText: { color: colors.black, fontSize: fontSize.md, fontWeight: '700' },
  noShowBtn: { borderRadius: borderRadius.full, padding: spacing.md, alignItems: 'center', backgroundColor: colors.errorMuted, borderWidth: 1, borderColor: colors.error },
  noShowBtnText: { color: colors.error, fontSize: fontSize.md, fontWeight: '600' },
  cancelBtn: { borderRadius: borderRadius.full, padding: spacing.md, alignItems: 'center' },
  cancelBtnText: { color: colors.textMuted, fontSize: fontSize.md, textDecorationLine: 'underline' },
});

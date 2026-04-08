import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { ProStackParamList, ClientNote, Appointment } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { ScreenHeader, AppointmentCard, Button } from '../../../components';
import { formatCents } from '../../../utils/taxCalc';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';
import { format, parseISO } from 'date-fns';

type Props = {
  navigation: NativeStackNavigationProp<ProStackParamList, 'ClientDetail'>;
  route: RouteProp<ProStackParamList, 'ClientDetail'>;
};

export const ClientDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { clientUid } = route.params;
  const { firebaseUser } = useAuth();
  const [clientNote, setClientNote] = useState<ClientNote | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    getDoc(doc(db, 'barbers', firebaseUser.uid, 'clientNotes', clientUid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data() as ClientNote;
        setClientNote(d);
        setNotes(d.notes ?? '');
      }
    });
    getDocs(query(collection(db, 'appointments'), where('barberId', '==', firebaseUser.uid), where('clientId', '==', clientUid), orderBy('startTime', 'desc'))).then((snap) => {
      setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment)));
    });
  }, [firebaseUser, clientUid]);

  const saveNotes = async () => {
    if (!firebaseUser || !clientNote) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'barbers', firebaseUser.uid, 'clientNotes', clientUid), { ...clientNote, notes, updatedAt: serverTimestamp() }, { merge: true });
      Alert.alert('Saved', 'Notes updated.');
    } catch { Alert.alert('Error', 'Could not save notes.'); }
    finally { setLoading(false); }
  };

  if (!clientNote) return <SafeAreaView style={styles.container} />;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={clientNote.displayName} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile */}
        <View style={styles.profile}>
          {clientNote.photoURL ? <Image source={{ uri: clientNote.photoURL }} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarPH]}><Text style={styles.initial}>{clientNote.displayName.charAt(0)}</Text></View>}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{clientNote.displayName}</Text>
            <Text style={styles.stat}>{clientNote.visitCount} visits · {formatCents(clientNote.totalSpentCents)} total</Text>
            {clientNote.lastVisitDate && <Text style={styles.stat}>Last visit: {format(parseISO(clientNote.lastVisitDate), 'MMM d, yyyy')}</Text>}
          </View>
        </View>

        {/* Private notes */}
        <View style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Private Notes (only you see this)</Text>
          <TextInput style={styles.notesInput} value={notes} onChangeText={setNotes} multiline placeholder="Hair type, preferences, sensitivities..." placeholderTextColor={colors.textMuted} />
          <Button label="Save Notes" onPress={saveNotes} loading={loading} size="sm" variant="secondary" />
        </View>

        {/* Visit history */}
        <Text style={styles.sectionTitle}>Visit History</Text>
        {appointments.map((a) => (
          <AppointmentCard key={a.id} appointment={a} onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: a.id })} />
        ))}
        {appointments.length === 0 && <Text style={styles.empty}>No past appointments</Text>}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  avatarPH: { backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.primary, fontSize: fontSize.xl, fontWeight: '700' },
  profileInfo: { flex: 1 },
  name: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: 4 },
  stat: { color: colors.textMuted, fontSize: fontSize.sm },
  notesCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  sectionTitle: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  notesInput: { color: colors.text, fontSize: fontSize.md, lineHeight: 22, minHeight: 80 },
  empty: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
});

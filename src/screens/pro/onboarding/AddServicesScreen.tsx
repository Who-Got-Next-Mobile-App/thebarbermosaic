import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { ProOnboardingParamList, Service, Profession } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { DashboardServiceCard, Button, ScreenHeader } from '../../../components';
import { PROFESSION_LABELS } from '../../../utils/badges';
import { formatCents } from '../../../utils/taxCalc';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ProOnboardingParamList, 'AddServices'>;
};

// Pre-populated service suggestions per profession
const SERVICE_TEMPLATES: Record<Profession, Array<{ name: string; priceDollars: number; durationMins: number }>> = {
  barber: [
    { name: 'Fade + Line', priceDollars: 35, durationMins: 45 },
    { name: 'Shape-Up', priceDollars: 15, durationMins: 20 },
    { name: 'Beard Trim', priceDollars: 20, durationMins: 25 },
    { name: 'Full Cut + Beard', priceDollars: 50, durationMins: 60 },
  ],
  hair_stylist: [
    { name: 'Silk Press', priceDollars: 65, durationMins: 90 },
    { name: 'Box Braids', priceDollars: 150, durationMins: 240 },
    { name: 'Wash & Go', priceDollars: 45, durationMins: 60 },
  ],
  nail_tech: [
    { name: 'Full Set Acrylics', priceDollars: 55, durationMins: 90 },
    { name: 'Gel Manicure', priceDollars: 40, durationMins: 60 },
    { name: 'Pedicure', priceDollars: 45, durationMins: 60 },
  ],
  lash_tech: [
    { name: 'Classic Full Set', priceDollars: 80, durationMins: 120 },
    { name: 'Volume Full Set', priceDollars: 100, durationMins: 150 },
    { name: 'Lash Fill', priceDollars: 55, durationMins: 75 },
  ],
  makeup_artist: [
    { name: 'Full Glam', priceDollars: 120, durationMins: 90 },
    { name: 'Bridal Makeup', priceDollars: 200, durationMins: 120 },
    { name: 'Natural Look', priceDollars: 75, durationMins: 60 },
  ],
};

export const AddServicesScreen: React.FC<Props> = ({ navigation }) => {
  const { barberProfile, firebaseUser } = useAuth();
  const [services, setServices] = useState<Partial<Service>[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const professions = barberProfile?.professions ?? [];
  const templates = professions.flatMap((p) => (SERVICE_TEMPLATES[p] ?? []).map((t) => ({ ...t, profession: p })));

  const addTemplate = (t: typeof templates[0]) => {
    if (services.some((s) => s.name === t.name)) return;
    setServices((prev) => [
      ...prev,
      {
        name: t.name,
        price: t.priceDollars * 100,
        durationMins: t.durationMins,
        profession: t.profession,
        description: '',
        depositPercent: 0,
        isActive: true,
      },
    ]);
  };

  const openModal = () => {
    setEditName(''); setEditPrice(''); setEditDuration(''); setEditDesc('');
    setModalVisible(true);
  };

  const saveCustom = () => {
    if (!editName.trim() || !editPrice || !editDuration) {
      Alert.alert('Missing fields', 'Name, price, and duration are required.');
      return;
    }
    setServices((prev) => [
      ...prev,
      {
        name: editName.trim(),
        price: Math.round(parseFloat(editPrice) * 100),
        durationMins: parseInt(editDuration, 10),
        profession: professions[0] ?? 'barber',
        description: editDesc.trim(),
        depositPercent: 0,
        isActive: true,
      },
    ]);
    setModalVisible(false);
  };

  const handleContinue = async () => {
    if (services.length === 0) {
      Alert.alert('Add a service', 'Please add at least one service to continue.');
      return;
    }
    setLoading(true);
    try {
      const uid = firebaseUser!.uid;
      for (const svc of services) {
        await addDoc(collection(db, 'barbers', uid, 'services'), {
          ...svc,
          createdAt: serverTimestamp(),
        });
      }
      navigation.navigate('SetAvailability');
    } catch {
      Alert.alert('Error', 'Could not save services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Add Your Services" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>Step 4 of 10</Text>
        <Text style={styles.subtitle}>Add at least one service to continue.</Text>

        {/* Suggestions */}
        {templates.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Suggestions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
              {templates.map((t, i) => {
                const already = services.some((s) => s.name === t.name);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.templateCard, already && styles.templateAdded]}
                    onPress={() => addTemplate(t)}
                    activeOpacity={0.75}
                    disabled={already}
                  >
                    <Text style={styles.templateName}>{t.name}</Text>
                    <Text style={styles.templateMeta}>${t.priceDollars} · {t.durationMins} min</Text>
                    {already && <Text style={styles.addedLabel}>Added ✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Added services */}
        {services.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Your Services</Text>
            {services.map((svc, i) => (
              <View key={i} style={styles.svcRow}>
                <View style={styles.svcInfo}>
                  <Text style={styles.svcName}>{svc.name}</Text>
                  <Text style={styles.svcMeta}>{formatCents(svc.price ?? 0)} · {svc.durationMins} min · {PROFESSION_LABELS[svc.profession ?? 'barber']}</Text>
                </View>
                <TouchableOpacity onPress={() => setServices((prev) => prev.filter((_, j) => j !== i))}>
                  <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={openModal}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addBtnText}>Add a Service</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} loading={loading} disabled={services.length === 0 || loading} fullWidth />
      </View>

      {/* Add service modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add a Service</Text>
            <TextInput style={styles.modalInput} placeholder="Service name" placeholderTextColor={colors.textMuted} value={editName} onChangeText={setEditName} />
            <View style={styles.modalRow}>
              <TextInput style={[styles.modalInput, styles.modalHalf]} placeholder="Price ($)" placeholderTextColor={colors.textMuted} value={editPrice} onChangeText={setEditPrice} keyboardType="decimal-pad" />
              <TextInput style={[styles.modalInput, styles.modalHalf]} placeholder="Duration (min)" placeholderTextColor={colors.textMuted} value={editDuration} onChangeText={setEditDuration} keyboardType="number-pad" />
            </View>
            <TextInput style={styles.modalInput} placeholder="Description (optional)" placeholderTextColor={colors.textMuted} value={editDesc} onChangeText={setEditDesc} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveCustom}>
                <Text style={styles.modalSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 120 },
  step: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.md, marginBottom: spacing.xl },
  sectionLabel: { color: colors.textSecondary, fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.md, marginTop: spacing.md },
  templateScroll: { marginBottom: spacing.md },
  templateCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginRight: spacing.md, minWidth: 140, borderWidth: 1, borderColor: colors.border },
  templateAdded: { borderColor: colors.success, backgroundColor: colors.successMuted },
  templateName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600', marginBottom: 4 },
  templateMeta: { color: colors.textMuted, fontSize: fontSize.xs },
  addedLabel: { color: colors.success, fontSize: fontSize.xs, marginTop: 4, fontWeight: '600' },
  svcRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  svcInfo: { flex: 1 },
  svcName: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginBottom: 2 },
  svcMeta: { color: colors.textMuted, fontSize: fontSize.sm },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, marginTop: spacing.sm },
  addBtnText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl },
  modalTitle: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.lg },
  modalInput: { backgroundColor: colors.background, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontSize: fontSize.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  modalRow: { flexDirection: 'row', gap: spacing.md },
  modalHalf: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  modalCancel: { flex: 1, padding: spacing.md, alignItems: 'center', borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { color: colors.textSecondary, fontWeight: '600' },
  modalSave: { flex: 1, padding: spacing.md, alignItems: 'center', borderRadius: borderRadius.full, backgroundColor: colors.primary },
  modalSaveText: { color: colors.black, fontWeight: '700' },
});

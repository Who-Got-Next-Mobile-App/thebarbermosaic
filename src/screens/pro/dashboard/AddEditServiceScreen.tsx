import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ProStackParamList, Profession } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { Input, Button, ScreenHeader } from '../../../components';
import { PROFESSION_LABELS } from '../../../utils/badges';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ProStackParamList, 'AddEditService'>;
  route: RouteProp<ProStackParamList, 'AddEditService'>;
};

export const AddEditServiceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { serviceId } = route.params ?? {};
  const { firebaseUser, barberProfile } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [profession, setProfession] = useState<Profession>(barberProfile?.professions?.[0] ?? 'barber');
  const [depositPercent, setDepositPercent] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serviceId || !firebaseUser) return;
    getDoc(doc(db, 'barbers', firebaseUser.uid, 'services', serviceId)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setName(d.name ?? '');
        setDescription(d.description ?? '');
        setPrice(((d.price ?? 0) / 100).toString());
        setDuration(String(d.durationMins ?? ''));
        setProfession(d.profession ?? 'barber');
        setDepositPercent(String(d.depositPercent ?? 0));
      }
    });
  }, [serviceId, firebaseUser]);

  const handleSave = async () => {
    if (!name.trim() || !price || !duration) {
      Alert.alert('Missing fields', 'Name, price, and duration are required.');
      return;
    }
    setLoading(true);
    try {
      const uid = firebaseUser!.uid;
      const data = {
        name: name.trim(),
        description: description.trim(),
        price: Math.round(parseFloat(price) * 100),
        durationMins: parseInt(duration, 10),
        profession,
        depositPercent: parseInt(depositPercent, 10) || 0,
        isActive: true,
      };
      if (serviceId) {
        await updateDoc(doc(db, 'barbers', uid, 'services', serviceId), data);
      } else {
        await addDoc(collection(db, 'barbers', uid, 'services'), { ...data, createdAt: serverTimestamp() });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save service.');
    } finally {
      setLoading(false);
    }
  };

  const professions = barberProfile?.professions ?? ['barber'];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={serviceId ? 'Edit Service' : 'Add Service'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Service Name *" value={name} onChangeText={setName} placeholder="e.g. Fade + Line" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Optional description" multiline numberOfLines={3} style={styles.multiline} />
        <Input label="Price ($) *" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" />
        <Input label="Duration (minutes) *" value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholder="45" />
        <Input label="Deposit Required (%)" value={depositPercent} onChangeText={setDepositPercent} keyboardType="number-pad" placeholder="0 = no deposit" hint="Enter 0 to require no deposit" />

        {professions.length > 1 && (
          <View style={styles.professionPicker}>
            <Text style={styles.profLabel}>Profession Category</Text>
            <View style={styles.profChips}>
              {professions.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.profChip, profession === p && styles.profChipSelected]}
                  onPress={() => setProfession(p)}
                >
                  <Text style={[styles.profChipText, profession === p && styles.profChipTextSelected]}>
                    {PROFESSION_LABELS[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Button label={serviceId ? 'Save Changes' : 'Add Service'} onPress={handleSave} loading={loading} fullWidth style={styles.saveBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  professionPicker: { marginBottom: spacing.lg },
  profLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.sm },
  profChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  profChip: { backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderWidth: 1, borderColor: colors.border },
  profChipSelected: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  profChipText: { color: colors.textSecondary, fontSize: fontSize.sm },
  profChipTextSelected: { color: colors.primary, fontWeight: '600' },
  saveBtn: { marginTop: spacing.md },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { ScreenHeader, Input, Button } from '../../../components';
import { colors, fontSize, spacing } from '../../../theme';

export const ProSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { barberProfile, updateBarberProfile } = useAuth();
  const [displayName, setDisplayName] = useState(barberProfile?.displayName ?? '');
  const [bio, setBio] = useState(barberProfile?.bio ?? '');
  const [address, setAddress] = useState(barberProfile?.address ?? '');
  const [city, setCity] = useState(barberProfile?.city ?? '');
  const [state, setState] = useState(barberProfile?.state ?? '');
  const [acceptsWalkIns, setAcceptsWalkIns] = useState(barberProfile?.acceptsWalkIns ?? false);
  const [depositRequired, setDepositRequired] = useState(barberProfile?.depositRequired ?? false);
  const [depositPercent, setDepositPercent] = useState(String(barberProfile?.depositPercent ?? 25));
  const [cancelWindow, setCancelWindow] = useState(String(barberProfile?.cancellationWindowHours ?? 24));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) { Alert.alert('Name required'); return; }
    setLoading(true);
    try {
      await updateBarberProfile({ displayName: displayName.trim(), bio: bio.trim(), address: address.trim(), city: city.trim(), state: state.trim(), acceptsWalkIns, depositRequired, depositPercent: parseInt(depositPercent) || 25, cancellationWindowHours: parseInt(cancelWindow) || 24 });
      Alert.alert('Saved!', 'Your profile has been updated.');
    } catch { Alert.alert('Error', 'Could not save settings.'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.section}>Profile</Text>
        <Input label="Display Name" value={displayName} onChangeText={setDisplayName} />
        <Input label="Bio" value={bio} onChangeText={setBio} multiline numberOfLines={3} style={styles.multi} maxLength={140} characterCount={bio.length} maxCharacters={140} />
        <Input label="Address" value={address} onChangeText={setAddress} />
        <Input label="City" value={city} onChangeText={setCity} />
        <Input label="State" value={state} onChangeText={setState} autoCapitalize="characters" maxLength={2} />

        <Text style={styles.section}>Booking Policies</Text>
        <View style={styles.row}><Text style={styles.rowLabel}>Accepts Walk-Ins</Text><Switch value={acceptsWalkIns} onValueChange={setAcceptsWalkIns} trackColor={{ false: colors.border, true: colors.primaryMuted }} thumbColor={acceptsWalkIns ? colors.primary : colors.textMuted} /></View>
        <View style={styles.row}><Text style={styles.rowLabel}>Require Deposit</Text><Switch value={depositRequired} onValueChange={setDepositRequired} trackColor={{ false: colors.border, true: colors.primaryMuted }} thumbColor={depositRequired ? colors.primary : colors.textMuted} /></View>
        {depositRequired && <Input label="Deposit %" value={depositPercent} onChangeText={setDepositPercent} keyboardType="number-pad" />}
        <Input label="Cancellation Window (hours)" value={cancelWindow} onChangeText={setCancelWindow} keyboardType="number-pad" hint="Clients can't cancel within this window" />

        <Button label="Save Changes" onPress={handleSave} loading={loading} fullWidth style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  section: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md, marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.md },
  rowLabel: { color: colors.text, fontSize: fontSize.md },
  multi: { minHeight: 80, textAlignVertical: 'top' },
  btn: { marginTop: spacing.lg },
});

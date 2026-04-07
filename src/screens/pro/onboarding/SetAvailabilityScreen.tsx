import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ProOnboardingParamList, DayAvailability } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { Button, ScreenHeader } from '../../../components';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ProOnboardingParamList, 'SetAvailability'>;
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_AVAILABILITY: DayAvailability[] = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i,
  startTime: '09:00',
  endTime: '18:00',
  isAvailable: i >= 1 && i <= 5, // Mon–Fri default
  blockedSlots: [],
}));

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? '00' : '30';
  const hour12 = h > 12 ? h - 12 : h;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return { value: `${String(h).padStart(2, '0')}:${m}`, label: `${hour12}:${m} ${ampm}` };
});

export const SetAvailabilityScreen: React.FC<Props> = ({ navigation }) => {
  const { firebaseUser } = useAuth();
  const [availability, setAvailability] = useState<DayAvailability[]>(DEFAULT_AVAILABILITY);
  const [loading, setLoading] = useState(false);

  const toggleDay = (i: number) => {
    setAvailability((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, isAvailable: !d.isAvailable } : d)),
    );
  };

  const updateTime = (i: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)),
    );
  };

  const copyToAll = (source: DayAvailability) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.isAvailable ? { ...d, startTime: source.startTime, endTime: source.endTime } : d,
      ),
    );
  };

  const handleContinue = async () => {
    const hasAtLeastOne = availability.some((d) => d.isAvailable);
    if (!hasAtLeastOne) {
      Alert.alert('Set availability', 'Please enable at least one day.');
      return;
    }
    setLoading(true);
    try {
      const uid = firebaseUser!.uid;
      for (const day of availability) {
        await setDoc(
          doc(db, 'barbers', uid, 'availability', String(day.dayOfWeek)),
          { ...day, updatedAt: serverTimestamp() },
        );
      }
      navigation.navigate('ConnectBank');
    } catch {
      Alert.alert('Error', 'Could not save availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const firstEnabled = availability.find((d) => d.isAvailable);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Set Your Availability" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>Step 5 of 10</Text>
        <Text style={styles.subtitle}>When are you available?</Text>

        {firstEnabled && (
          <TouchableOpacity style={styles.copyBtn} onPress={() => copyToAll(firstEnabled)}>
            <Text style={styles.copyBtnText}>Copy times to all enabled days</Text>
          </TouchableOpacity>
        )}

        {availability.map((day, i) => (
          <View key={i} style={styles.dayRow}>
            <Switch
              value={day.isAvailable}
              onValueChange={() => toggleDay(i)}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={day.isAvailable ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.dayName, !day.isAvailable && styles.dayNameOff]}>
              {DAY_NAMES[day.dayOfWeek]}
            </Text>
            {day.isAvailable && (
              <View style={styles.timePickers}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                  {TIME_OPTIONS.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      style={[styles.timeChip, day.startTime === t.value && styles.timeChipSelected]}
                      onPress={() => updateTime(i, 'startTime', t.value)}
                    >
                      <Text style={[styles.timeChipText, day.startTime === t.value && styles.timeChipTextSelected]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.toText}>to</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                  {TIME_OPTIONS.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      style={[styles.timeChip, day.endTime === t.value && styles.timeChipSelected]}
                      onPress={() => updateTime(i, 'endTime', t.value)}
                    >
                      <Text style={[styles.timeChipText, day.endTime === t.value && styles.timeChipTextSelected]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} loading={loading} disabled={loading} fullWidth />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 120 },
  step: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xs },
  subtitle: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.md },
  copyBtn: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.sm + 2, alignItems: 'center', marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  copyBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  dayRow: { marginBottom: spacing.lg },
  dayRowHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dayName: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', flex: 1 },
  dayNameOff: { color: colors.textMuted },
  timePickers: { marginTop: spacing.sm, gap: 4 },
  timeScroll: { maxHeight: 36 },
  timeChip: { backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginRight: 6, borderWidth: 1, borderColor: colors.border },
  timeChipSelected: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  timeChipText: { color: colors.textMuted, fontSize: fontSize.xs },
  timeChipTextSelected: { color: colors.primary, fontWeight: '600' },
  toText: { color: colors.textMuted, fontSize: fontSize.xs, marginLeft: 4 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
});

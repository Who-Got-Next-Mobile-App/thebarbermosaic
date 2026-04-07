import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Switch, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { DayAvailability } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { ScreenHeader, Button } from '../../../components';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = Array.from({ length: 28 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? '00' : '30';
  const h12 = h > 12 ? h - 12 : h;
  const ap = h >= 12 ? 'PM' : 'AM';
  return { value: `${String(h).padStart(2, '0')}:${m}`, label: `${h12}:${m} ${ap}` };
});

export const AvailabilityManagerScreen: React.FC = () => {
  const navigation = useNavigation();
  const { firebaseUser } = useAuth();
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    getDocs(collection(db, 'barbers', firebaseUser.uid, 'availability')).then((snap) => {
      const docs = snap.docs.map((d) => d.data() as DayAvailability).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      if (docs.length === 0) {
        setAvailability(DAY_NAMES.map((_, i) => ({ dayOfWeek: i, startTime: '09:00', endTime: '18:00', isAvailable: i >= 1 && i <= 5, blockedSlots: [] })));
      } else {
        setAvailability(docs);
      }
    });
  }, [firebaseUser]);

  const toggle = (i: number) => setAvailability((prev) => prev.map((d, idx) => idx === i ? { ...d, isAvailable: !d.isAvailable } : d));
  const update = (i: number, field: 'startTime' | 'endTime', val: string) =>
    setAvailability((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));

  const handleSave = async () => {
    setLoading(true);
    try {
      for (const day of availability) {
        await setDoc(doc(db, 'barbers', firebaseUser!.uid, 'availability', String(day.dayOfWeek)), { ...day, updatedAt: serverTimestamp() });
      }
      navigation.goBack();
    } catch { Alert.alert('Error', 'Could not save availability.'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Availability" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {availability.map((day, i) => (
          <View key={i} style={styles.dayBlock}>
            <View style={styles.dayRow}>
              <Switch value={day.isAvailable} onValueChange={() => toggle(i)} trackColor={{ false: colors.border, true: colors.primaryMuted }} thumbColor={day.isAvailable ? colors.primary : colors.textMuted} />
              <Text style={[styles.dayName, !day.isAvailable && styles.off]}>{DAY_NAMES[day.dayOfWeek]}</Text>
            </View>
            {day.isAvailable && (
              <View style={styles.times}>
                <View style={styles.timeSection}>
                  <Text style={styles.timeLabel}>Opens</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {TIMES.map((t) => (
                      <TouchableOpacity key={t.value} style={[styles.chip, day.startTime === t.value && styles.chipSelected]} onPress={() => update(i, 'startTime', t.value)}>
                        <Text style={[styles.chipText, day.startTime === t.value && styles.chipTextSelected]}>{t.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={styles.timeSection}>
                  <Text style={styles.timeLabel}>Closes</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {TIMES.map((t) => (
                      <TouchableOpacity key={t.value} style={[styles.chip, day.endTime === t.value && styles.chipSelected]} onPress={() => update(i, 'endTime', t.value)}>
                        <Text style={[styles.chipText, day.endTime === t.value && styles.chipTextSelected]}>{t.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}><Button label="Save Changes" onPress={handleSave} loading={loading} fullWidth /></View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 120 },
  dayBlock: { marginBottom: spacing.lg },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  dayName: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  off: { color: colors.textMuted },
  times: { gap: spacing.sm },
  timeSection: { gap: spacing.xs },
  timeLabel: { color: colors.textMuted, fontSize: fontSize.xs },
  chip: { backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginRight: 6, borderWidth: 1, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: fontSize.xs },
  chipTextSelected: { color: colors.primary, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
});

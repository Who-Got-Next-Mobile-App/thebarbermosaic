import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProOnboardingParamList, Profession, ProfileType } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { ProfessionSelector, Button } from '../../../components';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ProOnboardingParamList, 'ChooseProfession'>;
};

export const ChooseProfessionScreen: React.FC<Props> = ({ navigation }) => {
  const { updateBarberProfile } = useAuth();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [profileType, setProfileType] = useState<ProfileType>('solo');
  const [loading, setLoading] = useState(false);

  const toggleProfession = (p: Profession) => {
    setProfessions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const handleContinue = async () => {
    if (professions.length === 0) {
      Alert.alert('Select a Profession', 'Please select at least one profession to continue.');
      return;
    }
    setLoading(true);
    try {
      await updateBarberProfile({ professions, profileType });
      navigation.navigate('BuildProfile');
    } catch {
      Alert.alert('Error', 'Could not save your selection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.step}>Step 1 of 10</Text>
          <Text style={styles.title}>What do you offer?</Text>
          <Text style={styles.subtitle}>Select all that apply — you can offer multiple services</Text>
        </View>

        {/* Profession grid */}
        <ProfessionSelector selected={professions} onToggle={toggleProfession} style={styles.grid} />

        {/* Profile type */}
        <Text style={styles.sectionLabel}>How do you work?</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeCard, profileType === 'solo' && styles.typeCardSelected]}
            onPress={() => setProfileType('solo')}
            activeOpacity={0.75}
          >
            <Text style={styles.typeEmoji}>🧍</Text>
            <Text style={[styles.typeLabel, profileType === 'solo' && styles.typeLabelSelected]}>
              I work solo
            </Text>
            <Text style={styles.typeDesc}>Solo Professional</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeCard, profileType === 'studio' && styles.typeCardSelected]}
            onPress={() => setProfileType('studio')}
            activeOpacity={0.75}
          >
            <Text style={styles.typeEmoji}>🏪</Text>
            <Text style={[styles.typeLabel, profileType === 'studio' && styles.typeLabelSelected]}>
              I own / manage a studio
            </Text>
            <Text style={styles.typeDesc}>Studio / Salon</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={`Continue${professions.length > 0 ? ` (${professions.length} selected)` : ''}`}
          onPress={handleContinue}
          loading={loading}
          disabled={professions.length === 0 || loading}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.xl },
  step: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xs },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.sm },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 22 },
  grid: { marginBottom: spacing.xl },
  sectionLabel: { color: colors.textSecondary, fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.md },
  typeRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  typeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  typeCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  typeEmoji: { fontSize: 28 },
  typeLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600', textAlign: 'center' },
  typeLabelSelected: { color: colors.primary },
  typeDesc: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
});

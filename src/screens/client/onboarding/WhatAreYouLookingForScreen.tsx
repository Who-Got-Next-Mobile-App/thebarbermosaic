import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientOnboardingParamList, Profession } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { ProfessionSelector, Button } from '../../../components';
import { useDiscoveryStore } from '../../../store/discoveryStore';
import { colors, fontSize, spacing } from '../../../theme';

const ALL_PROFESSIONS: Profession[] = ['barber', 'hair_stylist', 'nail_tech', 'lash_tech', 'makeup_artist'];

type Props = {
  navigation: NativeStackNavigationProp<ClientOnboardingParamList, 'WhatAreYouLookingFor'>;
};

export const WhatAreYouLookingForScreen: React.FC<Props> = ({ navigation }) => {
  const { updateClientProfile } = useAuth();
  const { setProfessions } = useDiscoveryStore();
  const [selected, setSelected] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (p: Profession) =>
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const selectAll = () => setSelected([...ALL_PROFESSIONS]);

  const handleContinue = async () => {
    setLoading(true);
    try {
      setProfessions(selected);
      await updateClientProfile({ professionPreferences: selected });
      navigation.navigate('EnableLocation');
    } catch {
      navigation.navigate('EnableLocation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>What are you looking for?</Text>
          <Text style={styles.subtitle}>This sets your home feed. Change it anytime.</Text>
        </View>

        <TouchableOpacity style={styles.selectAllBtn} onPress={selectAll}>
          <Text style={styles.selectAllText}>Select all</Text>
        </TouchableOpacity>

        <ProfessionSelector selected={selected} onToggle={toggle} style={styles.grid} />

        <TouchableOpacity style={styles.laterBtn} onPress={() => navigation.navigate('EnableLocation')}>
          <Text style={styles.laterText}>I'll decide later</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={selected.length > 0 ? `Continue (${selected.length} selected)` : 'Continue'}
          onPress={handleContinue}
          loading={loading}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100 },
  header: { marginBottom: spacing.xl },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.sm },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.md },
  selectAllBtn: { alignSelf: 'flex-end', marginBottom: spacing.md },
  selectAllText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  grid: { marginBottom: spacing.lg },
  laterBtn: { alignItems: 'center', padding: spacing.md },
  laterText: { color: colors.textMuted, fontSize: fontSize.md, textDecorationLine: 'underline' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
});

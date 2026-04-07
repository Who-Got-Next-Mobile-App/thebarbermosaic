import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProStackParamList, SelfSelectBadgeId } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { getBadgesForProfessions, BADGE_CATEGORY_LABELS, MAX_SELF_SELECT_BADGES, atBadgeCap } from '../../../utils/badges';
import { BadgeCard, Button, ScreenHeader } from '../../../components';
import { colors, fontSize, spacing } from '../../../theme';

type Nav = NativeStackNavigationProp<ProStackParamList>;

export const BadgeManagerScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { barberProfile, updateBarberProfile } = useAuth();
  const [selected, setSelected] = useState<SelfSelectBadgeId[]>(barberProfile?.selectedBadges ?? []);
  const [loading, setLoading] = useState(false);

  const professions = barberProfile?.professions ?? [];
  const badges = getBadgesForProfessions(professions);

  const categoryMap = new Map<string, typeof badges>();
  for (const b of badges) {
    if (!categoryMap.has(b.category)) categoryMap.set(b.category, []);
    categoryMap.get(b.category)!.push(b);
  }
  const sections = Array.from(categoryMap.entries()).map(([cat, data]) => ({
    title: BADGE_CATEGORY_LABELS[cat] ?? cat,
    data: [data],
  }));

  const toggle = (id: SelfSelectBadgeId) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((b) => b !== id);
      if (atBadgeCap(prev)) return prev;
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateBarberProfile({ selectedBadges: selected });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save badges.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Your Badges" onBack={() => navigation.goBack()} />
      <View style={styles.counterBar}>
        <Text style={styles.counterText}>
          <Text style={[styles.counterNum, atBadgeCap(selected) && styles.capReached]}>{selected.length}</Text>
          {' '}of {MAX_SELF_SELECT_BADGES} badges selected
        </Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item: sectionBadges }) => (
          <View style={styles.grid}>
            {sectionBadges.map((b) => (
              <BadgeCard
                key={b.id}
                badgeId={b.id}
                selected={selected.includes(b.id as SelfSelectBadgeId)}
                disabled={atBadgeCap(selected) && !selected.includes(b.id as SelfSelectBadgeId)}
                onPress={() => toggle(b.id as SelfSelectBadgeId)}
              />
            ))}
          </View>
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
      <View style={styles.footer}>
        <Button label="Save Badges" onPress={handleSave} loading={loading} fullWidth />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  counterBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  counterText: { color: colors.textSecondary, fontSize: fontSize.md },
  counterNum: { color: colors.primary, fontWeight: '700', fontSize: fontSize.lg },
  capReached: { color: colors.warning },
  list: { padding: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});

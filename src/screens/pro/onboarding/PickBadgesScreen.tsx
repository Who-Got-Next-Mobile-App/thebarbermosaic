import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  SectionList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProOnboardingParamList, SelfSelectBadgeId } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import {
  getBadgesForProfessions,
  BADGE_CATEGORY_LABELS,
  MAX_SELF_SELECT_BADGES,
  atBadgeCap,
} from '../../../utils/badges';
import { BadgeCard } from '../../../components';
import { Button, ScreenHeader } from '../../../components';
import { colors, fontSize, spacing } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ProOnboardingParamList, 'PickBadges'>;
};

export const PickBadgesScreen: React.FC<Props> = ({ navigation }) => {
  const { barberProfile, updateBarberProfile } = useAuth();
  const [selected, setSelected] = useState<SelfSelectBadgeId[]>([]);
  const [loading, setLoading] = useState(false);

  const professions = barberProfile?.professions ?? [];
  const badges = getBadgesForProfessions(professions);

  // Group by category
  const categoryMap = new Map<string, typeof badges>();
  for (const badge of badges) {
    if (!categoryMap.has(badge.category)) categoryMap.set(badge.category, []);
    categoryMap.get(badge.category)!.push(badge);
  }
  const sections = Array.from(categoryMap.entries()).map(([category, data]) => ({
    title: BADGE_CATEGORY_LABELS[category] ?? category,
    data: [data], // one row with all badges per section
  }));

  const toggle = (id: SelfSelectBadgeId) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((b) => b !== id);
      if (atBadgeCap(prev)) return prev;
      return [...prev, id];
    });
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      await updateBarberProfile({ selectedBadges: selected });
      navigation.navigate('AddServices');
    } catch {
      Alert.alert('Error', 'Could not save badges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cap = atBadgeCap(selected);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Pick Your Badges" onBack={() => navigation.goBack()} />

      {/* Counter */}
      <View style={styles.counterBar}>
        <Text style={styles.counterText}>
          <Text style={[styles.counterNum, cap && styles.counterFull]}>{selected.length}</Text>
          <Text> of {MAX_SELF_SELECT_BADGES} selected</Text>
        </Text>
        <Text style={styles.platformNote}>
          ⭐ Platform badges like Top Rated are earned automatically and never count toward your 6.
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item: sectionBadges }) => (
          <View style={styles.badgeGrid}>
            {sectionBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badgeId={badge.id}
                selected={selected.includes(badge.id as SelfSelectBadgeId)}
                disabled={cap && !selected.includes(badge.id as SelfSelectBadgeId)}
                onPress={() => toggle(badge.id as SelfSelectBadgeId)}
              />
            ))}
          </View>
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} loading={loading} disabled={loading} fullWidth />
        <Text style={styles.skipNote}>You can skip for now and update from your dashboard</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  counterBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  counterText: { color: colors.textSecondary, fontSize: fontSize.md, marginBottom: 4 },
  counterNum: { color: colors.primary, fontWeight: '700', fontSize: fontSize.lg },
  counterFull: { color: colors.primary },
  platformNote: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 16 },
  listContent: { padding: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  skipNote: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
});

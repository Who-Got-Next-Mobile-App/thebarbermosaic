import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProOnboardingParamList } from '../../../types';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type PainAnswer = 'covered' | 'surprised' | 'didnt_file';
type Props = {
  navigation: NativeStackNavigationProp<ProOnboardingParamList, 'PainQuestion'>;
};

const ANSWERS: Array<{ id: PainAnswer; emoji: string; text: string }> = [
  { id: 'covered', emoji: '✅', text: 'Yes, I had it covered' },
  { id: 'surprised', emoji: '😬', text: 'It caught me off guard' },
  { id: 'didnt_file', emoji: '😰', text: "I didn't file at all" },
];

export const PainQuestionScreen: React.FC<Props> = ({ navigation }) => (
  // Full screen — no back button, no skip
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.question}>
        Last tax season, were you prepared for what you owed?
      </Text>

      <View style={styles.cards}>
        {ANSWERS.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate('TheRealNumber', { painAnswer: a.id })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.cardEmoji}>{a.emoji}</Text>
            <Text style={styles.cardText}>{a.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  question: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: spacing.xxl,
  },
  cards: { gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardEmoji: { fontSize: 32 },
  cardText: { color: colors.text, fontSize: fontSize.xl, fontWeight: '600', flex: 1 },
});

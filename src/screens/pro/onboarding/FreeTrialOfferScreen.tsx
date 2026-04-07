import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ProOnboardingParamList } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ProOnboardingParamList, 'FreeTrialOffer'>;
  route: RouteProp<ProOnboardingParamList, 'FreeTrialOffer'>;
};

const BULLETS = [
  { icon: 'cash-outline', text: '16.5% automatically set aside on every payment' },
  { icon: 'calendar-outline', text: 'Quarterly tracker keeps you filing on time' },
  { icon: 'document-text-outline', text: 'Year-end income report ready for your CPA' },
];

export const FreeTrialOfferScreen: React.FC<Props> = ({ navigation }) => {
  const { updateBarberProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [declined, setDeclined] = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      // In production: create Stripe subscription with 30-day trial
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 30);
      await updateBarberProfile({
        subscriptionTier: 'taxflow',
        subscriptionStatus: 'trialing',
        taxflowTrialEndsAt: trialEnd.toISOString(),
      });
      navigation.navigate('YouAreLive');
    } catch {
      Alert.alert('Error', 'Could not start trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setDeclined(true);
    // Still proceed to YouAreLive — can enable TaxFlow from dashboard
    setTimeout(() => navigation.navigate('YouAreLive'), 1500);
  };

  if (declined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.declinedContent}>
          <Text style={styles.declinedTitle}>No problem.</Text>
          <Text style={styles.declinedBody}>
            You'll see TaxFlow™ in your dashboard anytime.{'\n'}
            We'll remind you before each quarterly deadline.
          </Text>
          <View style={styles.spinner}>
            <Text style={styles.spinnerEmoji}>💼</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TaxFlow™</Text>
        </View>

        <Text style={styles.title}>Never get a surprise{'\n'}tax bill again</Text>

        <View style={styles.bullets}>
          {BULLETS.map(({ icon, text }) => (
            <View key={text} style={styles.bullet}>
              <Ionicons name={icon as any} size={22} color={colors.primary} />
              <Text style={styles.bulletText}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.trialBlock}>
          <Text style={styles.trialLabel}>30-Day Free Trial</Text>
          <Text style={styles.trialPrice}>Then $29.99/month. Cancel anytime.</Text>
        </View>

        <Button
          label="Start 30-Day Free Trial"
          onPress={handleStartTrial}
          loading={loading}
          fullWidth
          style={styles.ctaBtn}
        />

        <TouchableOpacity onPress={handleDecline} style={styles.notNowBtn}>
          <Text style={styles.notNowText}>Not right now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.lg },
  badge: { backgroundColor: colors.primaryMuted, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.primary },
  badgeText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', lineHeight: 40 },
  bullets: { gap: spacing.md },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bulletText: { color: colors.text, fontSize: fontSize.md, flex: 1, lineHeight: 22 },
  trialBlock: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  trialLabel: { color: colors.primary, fontSize: fontSize.xl, fontWeight: '800', marginBottom: 4 },
  trialPrice: { color: colors.textMuted, fontSize: fontSize.sm },
  ctaBtn: {},
  notNowBtn: { alignItems: 'center' },
  notNowText: { color: colors.textMuted, fontSize: fontSize.md, textDecorationLine: 'underline' },
  // Declined state
  declinedContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  declinedTitle: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.md },
  declinedBody: { color: colors.textSecondary, fontSize: fontSize.lg, textAlign: 'center', lineHeight: 26 },
  spinner: { marginTop: spacing.xl },
  spinnerEmoji: { fontSize: 48 },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ProOnboardingParamList } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Button, ScreenHeader } from '../../../components';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ProOnboardingParamList, 'ConnectBank'>;
};

export const ConnectBankScreen: React.FC<Props> = ({ navigation }) => {
  const { updateBarberProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      // In production: call a Cloud Function to create a Stripe Connect Express onboarding URL
      // and open it via Linking.openURL(stripeOnboardingUrl)
      // For now, we navigate forward to simulate completion
      Alert.alert(
        'Stripe Connect',
        'In production, this opens your bank account connection via Stripe. For now, we\'ll continue.',
        [
          {
            text: 'Continue',
            onPress: async () => {
              await updateBarberProfile({ stripeOnboardingComplete: false });
              navigation.navigate('PainQuestion');
            },
          },
        ],
      );
    } catch {
      Alert.alert('Error', 'Could not initiate bank connection. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip for now?',
      "You won't be able to accept payments until your bank is connected. You can complete this from your dashboard.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.navigate('PainQuestion') },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Get Paid for Your Work" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.iconBlock}>
          <View style={styles.iconCircle}>
            <Ionicons name="card-outline" size={48} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.title}>Connect Your Bank Account</Text>
        <Text style={styles.body}>
          Receive payouts automatically on a 2-day rolling basis after each appointment.
          BarberFlow uses Stripe — your banking info is never stored by us.
        </Text>

        <View style={styles.bullets}>
          {[
            { icon: 'flash-outline', text: 'Automatic 2-day payouts' },
            { icon: 'shield-checkmark-outline', text: 'Bank-level security via Stripe' },
            { icon: 'close-circle-outline', text: 'No manual withdrawals needed' },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.bullet}>
              <Ionicons name={icon as any} size={20} color={colors.primary} />
              <Text style={styles.bulletText}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.progressNote}>
          <Text style={styles.progressText}>Almost ready to get paid</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '80%' }]} />
          </View>
        </View>

        <Button
          label="Connect Bank Account"
          onPress={handleConnect}
          loading={loading}
          fullWidth
          style={styles.connectBtn}
        />
      </View>

      <View style={styles.footer}>
        <Button label="Skip for now" onPress={handleSkip} variant="ghost" fullWidth />
        <Text style={styles.skipWarning}>
          You won't be able to accept payments until your bank is connected.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.xl, alignItems: 'center' },
  iconBlock: { marginTop: spacing.xl, marginBottom: spacing.xl },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: spacing.md },
  body: { color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl },
  bullets: { alignSelf: 'stretch', gap: spacing.md, marginBottom: spacing.xl },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bulletText: { color: colors.text, fontSize: fontSize.md },
  progressNote: { alignSelf: 'stretch', marginBottom: spacing.xl },
  progressText: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xs, textAlign: 'center' },
  progressBar: { height: 4, backgroundColor: colors.border, borderRadius: borderRadius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: borderRadius.full },
  connectBtn: {},
  footer: { padding: spacing.lg, gap: spacing.sm },
  skipWarning: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { ClientOnboardingParamList } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ClientOnboardingParamList, 'TurnOnNotifications'>;
};

export const TurnOnNotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { updateClientProfile, markOnboardingComplete } = useAuth();
  const [loading, setLoading] = useState(false);

  const requestNotifications = async () => {
    setLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      let fcmToken: string | null = null;
      if (status === 'granted') {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        fcmToken = tokenData.data;
      }
      await updateClientProfile({
        notifPrefs: { push: status === 'granted', email: true },
        fcmToken,
      });
      await markOnboardingComplete();
    } catch {
      await markOnboardingComplete();
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    await updateClientProfile({ notifPrefs: { push: false, email: true } });
    await markOnboardingComplete();
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBlock}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications" size={56} color={colors.primary} />
          </View>
          {/* Notification preview badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        </View>

        <Text style={styles.title}>Never miss an appointment</Text>
        <Text style={styles.body}>
          We'll remind you 24 hours and 1 hour before every appointment.{'\n'}
          No spam — just the reminders you need.
        </Text>

        <View style={styles.notifPreviews}>
          {[
            { icon: '📅', text: 'Your appointment with Marcus is tomorrow at 2pm' },
            { icon: '⏰', text: 'Reminder: Your fade is in 1 hour with Marcus' },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.notifPreview}>
              <Text style={styles.notifIcon}>{icon}</Text>
              <Text style={styles.notifText}>{text}</Text>
            </View>
          ))}
        </View>

        <Button
          label="Turn On Notifications"
          onPress={requestNotifications}
          loading={loading}
          fullWidth
          style={styles.mainBtn}
        />

        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} disabled={loading}>
          <Text style={styles.skipText}>Not now</Text>
        </TouchableOpacity>
        <Text style={styles.fallback}>
          If you skip, we'll send appointment reminders to your email instead.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  iconBlock: { position: 'relative', marginBottom: spacing.md },
  iconCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 0, right: -4, backgroundColor: colors.error, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  body: { color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', lineHeight: 24 },
  notifPreviews: { width: '100%', gap: spacing.sm },
  notifPreview: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  notifIcon: { fontSize: 18 },
  notifText: { color: colors.textSecondary, fontSize: fontSize.sm, flex: 1, lineHeight: 18 },
  mainBtn: {},
  skipBtn: { marginTop: -spacing.sm },
  skipText: { color: colors.textMuted, fontSize: fontSize.md, textDecorationLine: 'underline' },
  fallback: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
});

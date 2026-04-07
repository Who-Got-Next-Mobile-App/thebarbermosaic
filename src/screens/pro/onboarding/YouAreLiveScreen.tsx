import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Alert,
  Clipboard,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ProOnboardingParamList } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ProOnboardingParamList, 'YouAreLive'>;
};

export const YouAreLiveScreen: React.FC<Props> = ({ navigation }) => {
  const { barberProfile, markOnboardingComplete } = useAuth();

  const slug = barberProfile?.bookingSlug ?? '';
  const bookingURL = `https://barberflow.com/book/${slug}`;

  // Confetti effect (simple emoji burst; production uses react-native-reanimated)
  const confettiEmojis = ['🎉', '✨', '🎊', '💫', '⭐', '🥳'];

  const handleCopyLink = () => {
    Clipboard.setString(bookingURL);
    Alert.alert('Copied!', 'Your booking link is copied to the clipboard.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Book with me on BarberFlow! ${bookingURL}`,
        url: bookingURL,
        title: 'My BarberFlow Booking Link',
      });
    } catch {}
  };

  const handleGoToDashboard = async () => {
    await markOnboardingComplete();
    // Navigator will switch to ProNavigator automatically
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti */}
      <View style={styles.confettiRow} pointerEvents="none">
        {confettiEmojis.map((e, i) => (
          <Text key={i} style={[styles.confettiEmoji, { top: 20 + (i % 3) * 30, left: `${(i / confettiEmojis.length) * 100}%` as any }]}>
            {e}
          </Text>
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.header}>Your booking link is live 🎉</Text>
        <Text style={styles.subheader}>Share it with your clients and start taking bookings today.</Text>

        {/* URL display */}
        <View style={styles.urlBox}>
          <Text style={styles.urlText} numberOfLines={1}>{bookingURL}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCopyLink}>
            <Ionicons name="copy-outline" size={22} color={colors.primary} />
            <Text style={styles.actionLabel}>Copy Link</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Download QR', 'QR code download coming soon.')}>
            <Ionicons name="qr-code-outline" size={22} color={colors.primary} />
            <Text style={styles.actionLabel}>QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={colors.primary} />
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Setup checklist */}
        {(!barberProfile?.photoURL || !barberProfile?.stripeOnboardingComplete) && (
          <View style={styles.checklist}>
            <Text style={styles.checklistTitle}>Finish setting up</Text>
            {!barberProfile?.photoURL && (
              <View style={styles.checklistItem}>
                <Ionicons name="ellipse-outline" size={16} color={colors.textMuted} />
                <Text style={styles.checklistText}>Add profile photo</Text>
              </View>
            )}
            {!barberProfile?.stripeOnboardingComplete && (
              <View style={styles.checklistItem}>
                <Ionicons name="ellipse-outline" size={16} color={colors.textMuted} />
                <Text style={styles.checklistText}>Connect bank account</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button label="Go to Dashboard" onPress={handleGoToDashboard} fullWidth />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  confettiRow: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  confettiEmoji: { position: 'absolute', fontSize: 28 },
  content: { flex: 1, padding: spacing.xl, paddingTop: spacing.xxl, alignItems: 'center', gap: spacing.lg },
  header: { color: colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subheader: { color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', lineHeight: 22 },
  urlBox: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, alignSelf: 'stretch', borderWidth: 1, borderColor: colors.primary },
  urlText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '600', textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.lg },
  actionBtn: { alignItems: 'center', gap: spacing.xs, flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  checklist: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  checklistTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginBottom: 4 },
  checklistItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checklistText: { color: colors.textSecondary, fontSize: fontSize.sm },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});

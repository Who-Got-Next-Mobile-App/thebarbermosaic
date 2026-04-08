import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors, fontSize, spacing, borderRadius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      {/* Logo */}
      <View style={styles.logoBlock}>
        <Text style={styles.logoEmoji}>💈</Text>
        <Text style={styles.logoText}>BarberFlow</Text>
        <Text style={styles.tagline}>You're not just cutting hair —{'\n'}you're building a life.</Text>
      </View>

      {/* CTAs */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('ProCreateAccount')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>✂️  I'm a Professional</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('ClientCreateAccount')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>🔍  I'm a Client</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signInLink}>
        <Text style={styles.signInText}>Already have an account? <Text style={styles.signInTextBold}>Sign in</Text></Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  logoBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  logoText: {
    color: colors.primary,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: spacing.lg,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  buttons: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.black,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  signInLink: {
    alignItems: 'center',
  },
  signInText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  signInTextBold: {
    color: colors.primary,
    fontWeight: '600',
  },
});

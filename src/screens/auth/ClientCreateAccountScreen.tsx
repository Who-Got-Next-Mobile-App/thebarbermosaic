import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, ScreenHeader } from '../../components';
import { colors, fontSize, spacing, borderRadius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ClientCreateAccount'>;
};

export const ClientCreateAccountScreen: React.FC<Props> = ({ navigation }) => {
  const { signUpClient } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!phone.trim()) e.phone = 'Phone number is required';
    if (!agreed) e.terms = 'You must agree to the Terms of Service';
    return e;
  };

  const handleCreate = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    try {
      await signUpClient(email.trim(), password, displayName.trim(), phone.trim());
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Create Your Account" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Find and book professionals near you</Text>

        <Input
          label="Your Name"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          leftIcon="person-outline"
          error={errors.name}
          placeholder="First & Last Name"
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon="mail-outline"
          error={errors.email}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          isPassword
          leftIcon="lock-closed-outline"
          error={errors.password}
          placeholder="At least 8 characters"
        />
        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          leftIcon="call-outline"
          error={errors.phone}
          placeholder="+1 (555) 000-0000"
        />

        <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>
            I agree to the <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
        {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

        <Button
          label="Create Account"
          onPress={handleCreate}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.createBtn}
        />

        <TouchableOpacity style={styles.browseLink}>
          <Text style={styles.browseText}>Browse without an account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.md, marginBottom: spacing.xl },
  googleBtn: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  googleText: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxMark: { color: colors.black, fontSize: 12, fontWeight: '700' },
  checkLabel: { flex: 1, color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  link: { color: colors.primary, fontWeight: '600' },
  errorText: { color: colors.error, fontSize: fontSize.xs, marginBottom: spacing.sm },
  createBtn: { marginTop: spacing.md },
  browseLink: { alignItems: 'center', marginTop: spacing.lg },
  browseText: { color: colors.textMuted, fontSize: fontSize.sm, textDecorationLine: 'underline' },
});

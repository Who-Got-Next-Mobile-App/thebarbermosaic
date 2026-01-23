import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo/Brand */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandName}>THE BARBER</Text>
          <Text style={styles.brandAccent}>MOSAIC</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>Premium Grooming Experience</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={styles.loginButtonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => Alert.alert('Reset Password', 'Feature coming soon')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>New client? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brandName: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 4,
  },
  brandAccent: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 8,
    marginTop: -8,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: colors.primary,
    marginVertical: spacing.md,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.black,
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: 2,
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  forgotText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  signupLink: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});


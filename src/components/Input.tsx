import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, fontSize, spacing } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  characterCount?: number;
  maxCharacters?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword = false,
  characterCount,
  maxCharacters,
  style,
  ...props
}) => {
  const [secureEntry, setSecureEntry] = useState(isPassword);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={[
        styles.inputRow,
        focused && styles.inputRowFocused,
        !!error && styles.inputRowError,
      ]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={18} color={focused ? colors.primary : colors.textMuted} style={styles.icon} />
        )}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secureEntry}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setSecureEntry(!secureEntry)} style={styles.icon}>
            <Ionicons name={secureEntry ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {!isPassword && rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.icon} disabled={!onRightIconPress}>
            <Ionicons name={rightIcon} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : hint ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : (
          <View />
        )}
        {maxCharacters !== undefined && characterCount !== undefined && (
          <Text style={[styles.counter, characterCount > maxCharacters && styles.counterOver]}>
            {characterCount}/{maxCharacters}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputRowFocused: {
    borderColor: colors.borderFocus,
  },
  inputRowError: {
    borderColor: colors.error,
  },
  icon: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    paddingVertical: spacing.sm + 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    minHeight: 16,
  },
  error: {
    color: colors.error,
    fontSize: fontSize.xs,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  counter: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  counterOver: {
    color: colors.error,
  },
});

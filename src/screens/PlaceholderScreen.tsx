import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export const PlaceholderScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>BarberFlow</Text>
    <Text style={styles.sub}>Coming soon in next PR</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  sub: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
});

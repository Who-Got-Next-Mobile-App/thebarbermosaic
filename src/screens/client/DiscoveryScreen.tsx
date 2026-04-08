import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

// Stub — replaced in its feature PR
export const DiscoveryScreen: React.FC<any> = () => (
  <View style={styles.container}>
    <Text style={styles.label}>DiscoveryScreen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.textMuted, fontSize: 14 },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ProOnboardingParamList } from '../../../types';
import { estimateTaxBurden } from '../../../utils/taxCalc';
import { Button, ScreenHeader } from '../../../components';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ProOnboardingParamList, 'TheRealNumber'>;
  route: RouteProp<ProOnboardingParamList, 'TheRealNumber'>;
};

const HEADLINES: Record<string, string> = {
  covered: "You're already thinking ahead. Let's make it automatic.",
  surprised: "Let's make sure that doesn't happen again.",
  didnt_file: "Let's change that — one payment at a time.",
};

export const TheRealNumberScreen: React.FC<Props> = ({ navigation, route }) => {
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const estimate = monthlyIncome ? estimateTaxBurden(parseFloat(monthlyIncome) || 0) : null;

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Here's the Real Number" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.headline}>
          {HEADLINES[route.params.painAnswer]}
        </Text>
        <Text style={styles.subtitle}>Here's what self-employment taxes look like</Text>

        {/* Income input */}
        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>What do you make on average per month?</Text>
          <View style={styles.dollarRow}>
            <Text style={styles.dollar}>$</Text>
            <TextInput
              style={styles.incomeInput}
              value={monthlyIncome}
              onChangeText={(v) => setMonthlyIncome(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Live estimates */}
        {estimate && estimate.monthlyIncome > 0 && (
          <View style={styles.estimates}>
            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>Estimated annual income</Text>
              <Text style={styles.estimateValue}>{fmt(estimate.annualIncome)}</Text>
            </View>
            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>Estimated SE tax owed (15.3%)</Text>
              <Text style={[styles.estimateValue, styles.red]}>{fmt(estimate.estimatedSeTax)}</Text>
            </View>
            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>You'd need to set aside / month</Text>
              <Text style={[styles.estimateValue, styles.red]}>{fmt(estimate.monthlySetAside)}</Text>
            </View>
            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>Or per week</Text>
              <Text style={[styles.estimateValue, styles.red]}>{fmt(estimate.weeklySetAside)}</Text>
            </View>

            {/* Comparison card */}
            <View style={styles.comparison}>
              <View style={styles.compCol}>
                <Text style={styles.compTitle}>On Your Own</Text>
                <Text style={styles.compAmount}>{fmt(estimate.monthlySetAside)}<Text style={styles.compSub}>/mo</Text></Text>
                <Text style={styles.compNote}>Manual self-discipline required</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.compCol}>
                <Text style={[styles.compTitle, styles.compGold]}>With TaxFlow™</Text>
                <Text style={[styles.compAmount, styles.compGold]}>$29.99<Text style={styles.compSub}>/mo</Text></Text>
                <Text style={styles.compNote}>Done automatically every payment</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={() => navigation.navigate('FreeTrialOffer', { monthlyIncome: parseFloat(monthlyIncome) || 0 })}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 120 },
  headline: { color: colors.primary, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.sm },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.md, marginBottom: spacing.xl },
  inputBlock: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  inputLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.sm },
  dollarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dollar: { color: colors.primary, fontSize: 32, fontWeight: '700' },
  incomeInput: { flex: 1, color: colors.text, fontSize: 32, fontWeight: '700' },
  estimates: { gap: spacing.sm },
  estimateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  estimateLabel: { color: colors.textSecondary, fontSize: fontSize.md },
  estimateValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  red: { color: colors.error },
  comparison: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.lg, overflow: 'hidden' },
  compCol: { flex: 1, padding: spacing.lg, alignItems: 'center', gap: 6 },
  compTitle: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  compGold: { color: colors.primary },
  compAmount: { color: colors.text, fontSize: 28, fontWeight: '800' },
  compSub: { fontSize: fontSize.sm, fontWeight: '400' },
  compNote: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
  divider: { width: 1, backgroundColor: colors.border },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
});

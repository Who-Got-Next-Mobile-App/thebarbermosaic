import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { Payment } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { formatCents } from '../../../utils/taxCalc';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear } from 'date-fns';

type Period = 'today' | 'week' | 'month' | 'ytd';

export const ProIncomeScreen: React.FC = () => {
  const { firebaseUser } = useAuth();
  const [period, setPeriod] = useState<Period>('week');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'payments'),
          where('barberId', '==', firebaseUser.uid),
          where('status', '==', 'succeeded'),
          orderBy('createdAt', 'desc'),
        );
        const snap = await getDocs(q);
        setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment)));
      } catch {}
      setLoading(false);
    };
    fetchPayments();
  }, [firebaseUser]);

  const filterPayments = (pmts: Payment[]): Payment[] => {
    const now = new Date();
    const ranges: Record<Period, [Date, Date]> = {
      today: [startOfDay(now), endOfDay(now)],
      week: [startOfWeek(now), endOfWeek(now)],
      month: [startOfMonth(now), endOfMonth(now)],
      ytd: [startOfYear(now), now],
    };
    const [from, to] = ranges[period];
    return pmts.filter((p) => {
      const d = new Date(p.createdAt);
      return d >= from && d <= to;
    });
  };

  const filtered = filterPayments(payments);
  const gross = filtered.reduce((s, p) => s + p.grossAmount, 0);
  const stripeFees = filtered.reduce((s, p) => s + p.stripeFee, 0);
  const platformFees = filtered.reduce((s, p) => s + p.platformFee, 0);
  const taxAllocated = filtered.reduce((s, p) => s + p.taxAllocated, 0);
  const tips = filtered.reduce((s, p) => s + p.tipAmount, 0);
  const netPayout = filtered.reduce((s, p) => s + p.barberPayout, 0);

  const PERIODS: Array<{ key: Period; label: string }> = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'ytd', label: 'YTD' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Income</Text>

        {/* Period toggle */}
        <View style={styles.periodRow}>
          {PERIODS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.periodBtn, period === key && styles.periodBtnActive]}
              onPress={() => setPeriod(key)}
            >
              <Text style={[styles.periodText, period === key && styles.periodTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.grossLabel}>Gross Earned</Text>
          <Text style={styles.grossValue}>{formatCents(gross)}</Text>
          <View style={styles.divider} />
          <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Stripe fee</Text><Text style={styles.breakdownValue}>-{formatCents(stripeFees)}</Text></View>
          <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>BarberFlow fee (3%)</Text><Text style={styles.breakdownValue}>-{formatCents(platformFees)}</Text></View>
          {taxAllocated > 0 && <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>TaxFlow™ withheld</Text><Text style={styles.breakdownValue}>-{formatCents(taxAllocated)}</Text></View>}
          {tips > 0 && <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Tips (yours, 100%)</Text><Text style={[styles.breakdownValue, styles.green]}>+{formatCents(tips)}</Text></View>}
          <View style={styles.divider} />
          <View style={styles.breakdownRow}><Text style={[styles.breakdownLabel, styles.bold]}>Net Payout</Text><Text style={[styles.breakdownValue, styles.bold, styles.gold]}>{formatCents(netPayout)}</Text></View>
        </View>

        {/* Export button */}
        <TouchableOpacity style={styles.exportBtn}>
          <Ionicons name="download-outline" size={16} color={colors.primary} />
          <Text style={styles.exportText}>Export as CSV</Text>
        </TouchableOpacity>

        {/* Transaction list */}
        <Text style={styles.sectionTitle}>Transactions ({filtered.length})</Text>
        {filtered.map((p) => (
          <View key={p.id} style={styles.txRow}>
            <View style={styles.txLeft}>
              <Text style={styles.txDate}>{format(parseISO(p.createdAt), 'MMM d, h:mm a')}</Text>
              <Text style={styles.txId} numberOfLines={1}>{p.appointmentId}</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txGross}>{formatCents(p.grossAmount)}</Text>
              <Text style={styles.txNet}>→ {formatCents(p.barberPayout)}</Text>
            </View>
          </View>
        ))}
        {filtered.length === 0 && !loading && (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No transactions in this period</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  pageTitle: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.lg },
  periodRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 8, padding: 3, marginBottom: spacing.lg },
  periodBtn: { flex: 1, paddingVertical: spacing.xs + 2, alignItems: 'center', borderRadius: 6 },
  periodBtnActive: { backgroundColor: colors.primary },
  periodText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  periodTextActive: { color: colors.black },
  summaryCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, gap: spacing.sm },
  grossLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  grossValue: { color: colors.text, fontSize: 36, fontWeight: '800', marginBottom: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { color: colors.textSecondary, fontSize: fontSize.sm },
  breakdownValue: { color: colors.textSecondary, fontSize: fontSize.sm },
  green: { color: colors.success },
  gold: { color: colors.primary },
  bold: { fontWeight: '700', color: colors.text },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, marginBottom: spacing.lg },
  exportText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  txLeft: { flex: 1 },
  txDate: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  txId: { color: colors.textMuted, fontSize: fontSize.xs },
  txRight: { alignItems: 'flex-end' },
  txGross: { color: colors.textSecondary, fontSize: fontSize.sm },
  txNet: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
});

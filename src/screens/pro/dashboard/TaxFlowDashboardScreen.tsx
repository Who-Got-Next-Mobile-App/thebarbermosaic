import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { TaxAllocation, Quarter } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { ScreenHeader, Button } from '../../../components';
import {
  formatCents,
  formatDollars,
  centsToDollars,
  getCurrentQuarter,
  getQuarterString,
  getQuarterDeadline,
  getDaysUntilDeadline,
  DEFAULT_TAX_WITHHOLD_RATE,
  MIN_WITHHOLD_RATE,
  MAX_WITHHOLD_RATE,
} from '../../../utils/taxCalc';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type QuarterSummary = {
  quarter: string;
  totalGross: number;
  totalWithheld: number;
  status: 'held' | 'ready_to_file' | 'filed';
  allocationCount: number;
};

export const TaxFlowDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { barberProfile, updateBarberProfile, firebaseUser } = useAuth();
  const [allocations, setAllocations] = useState<TaxAllocation[]>([]);
  const [quarterly, setQuarterly] = useState<QuarterSummary[]>([]);
  const [showRateModal, setShowRateModal] = useState(false);
  const [newRate, setNewRate] = useState(String(Math.round((barberProfile?.taxWithholdRate ?? DEFAULT_TAX_WITHHOLD_RATE) * 100)));
  const [loading, setLoading] = useState(false);

  const currentQ = getCurrentQuarter();
  const qString = getQuarterString();
  const deadline = getQuarterDeadline(currentQ);
  const daysLeft = getDaysUntilDeadline(currentQ);
  const isDeadlineSoon = daysLeft <= 30 && daysLeft >= 0;
  const taxflowActive = barberProfile?.subscriptionTier === 'taxflow';

  useEffect(() => {
    if (!firebaseUser) return;
    const fetchAllocations = async () => {
      try {
        const q = query(
          collection(db, 'tax_allocations'),
          where('barberId', '==', firebaseUser.uid),
          orderBy('createdAt', 'desc'),
        );
        const snap = await getDocs(q);
        const allocs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TaxAllocation));
        setAllocations(allocs);

        // Build quarterly summary
        const qMap = new Map<string, QuarterSummary>();
        for (const a of allocs) {
          const key = a.quarter;
          if (!qMap.has(key)) {
            qMap.set(key, { quarter: key, totalGross: 0, totalWithheld: 0, status: a.status, allocationCount: 0 });
          }
          const s = qMap.get(key)!;
          s.totalGross += a.grossAmount;
          s.totalWithheld += a.withheldAmount;
          s.allocationCount += 1;
          if (a.status === 'filed') s.status = 'filed';
          else if (a.status === 'ready_to_file' && s.status !== 'filed') s.status = 'ready_to_file';
        }
        setQuarterly(Array.from(qMap.values()).sort((a, b) => b.quarter.localeCompare(a.quarter)));
      } catch {}
    };
    fetchAllocations();
  }, [firebaseUser]);

  const handleSaveRate = async () => {
    const rate = parseFloat(newRate) / 100;
    if (isNaN(rate) || rate < MIN_WITHHOLD_RATE || rate > MAX_WITHHOLD_RATE) {
      Alert.alert('Invalid rate', `Rate must be between ${MIN_WITHHOLD_RATE * 100}% and ${MAX_WITHHOLD_RATE * 100}%.`);
      return;
    }
    setLoading(true);
    try {
      await updateBarberProfile({ taxWithholdRate: rate });
      setShowRateModal(false);
    } catch { Alert.alert('Error', 'Could not update rate.'); }
    finally { setLoading(false); }
  };

  const handleDownloadReport = () => {
    Alert.alert('Annual Income Report', 'Your annual income report PDF will be generated and emailed to you within a few minutes.');
  };

  const currentQuarterData = quarterly.find((q) => q.quarter === qString);
  const ytdWithheld = allocations.reduce((s, a) => s + a.withheldAmount, 0);
  const ytdGross = allocations.reduce((s, a) => s + a.grossAmount, 0);

  if (!taxflowActive) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="TaxFlow™" onBack={() => navigation.goBack()} />
        <View style={styles.inactiveContent}>
          <Text style={styles.taxflowBadge}>TaxFlow™</Text>
          <Text style={styles.inactiveTitle}>Set money aside automatically</Text>
          <Text style={styles.inactiveBody}>
            TaxFlow™ withholds a percentage of every payment so you're always prepared for quarterly taxes.
            Never get surprised again.
          </Text>
          <Button label="Start 30-Day Free Trial" onPress={() => {}} fullWidth style={styles.trialBtn} />
          <Text style={styles.trialNote}>Then $29.99/mo. Cancel anytime.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="TaxFlow™"
        onBack={() => navigation.goBack()}
        rightAction={{ icon: 'settings-outline', onPress: () => setShowRateModal(true) }}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Deadline alert */}
        {isDeadlineSoon && (
          <View style={styles.deadlineAlert}>
            <Ionicons name="warning-outline" size={20} color={colors.warning} />
            <View style={styles.alertBody}>
              <Text style={styles.alertTitle}>Q{currentQ.slice(1)} filing deadline approaching</Text>
              <Text style={styles.alertSub}>{deadline} · {daysLeft} day{daysLeft !== 1 ? 's' : ''} away</Text>
            </View>
          </View>
        )}

        {/* YTD stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Year-to-Date</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValue}>{formatCents(ytdGross)}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Tax Withheld</Text>
              <Text style={[styles.statValue, styles.gold]}>{formatCents(ytdWithheld)}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Rate</Text>
              <Text style={styles.statValue}>{Math.round((barberProfile?.taxWithholdRate ?? DEFAULT_TAX_WITHHOLD_RATE) * 100)}%</Text>
            </View>
          </View>
        </View>

        {/* Current quarter */}
        <View style={styles.currentQ}>
          <Text style={styles.qLabel}>{qString} (Current)</Text>
          <View style={styles.qRow}>
            <View>
              <Text style={styles.qSub}>Withheld this quarter</Text>
              <Text style={styles.qValue}>{formatCents(currentQuarterData?.totalWithheld ?? 0)}</Text>
            </View>
            <View style={[styles.qStatus, { backgroundColor: colors.successMuted }]}>
              <Text style={[styles.qStatusText, { color: colors.success }]}>On Track</Text>
            </View>
          </View>
          <Text style={styles.qDeadline}>Next deadline: {deadline}</Text>
        </View>

        {/* Quarterly history */}
        <Text style={styles.sectionTitle}>Quarterly Summary</Text>
        {quarterly.map((q) => (
          <View key={q.quarter} style={styles.qCard}>
            <View style={styles.qCardLeft}>
              <Text style={styles.qCardTitle}>{q.quarter}</Text>
              <Text style={styles.qCardSub}>{q.allocationCount} payments · {formatCents(q.totalGross)} gross</Text>
            </View>
            <View style={styles.qCardRight}>
              <Text style={styles.qCardWithheld}>{formatCents(q.totalWithheld)}</Text>
              <View style={[styles.qBadge, { backgroundColor: q.status === 'filed' ? colors.successMuted : colors.warningMuted }]}>
                <Text style={[styles.qBadgeText, { color: q.status === 'filed' ? colors.success : colors.warning }]}>
                  {q.status === 'filed' ? 'Filed' : q.status === 'ready_to_file' ? 'Ready to File' : 'Held'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {quarterly.length === 0 && (
          <Text style={styles.noData}>No allocations yet — payments will appear here once processed.</Text>
        )}

        {/* Annual report */}
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadReport}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={styles.downloadText}>Download Annual Income Report (PDF)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Rate modal */}
      <Modal visible={showRateModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Withholding Rate</Text>
            <Text style={styles.sheetBody}>
              Current rate: {Math.round((barberProfile?.taxWithholdRate ?? DEFAULT_TAX_WITHHOLD_RATE) * 100)}%{'\n'}
              Default: 16.5% (covers self-employment tax + federal income for most professionals){'\n'}
              Range: {MIN_WITHHOLD_RATE * 100}%–{MAX_WITHHOLD_RATE * 100}%
            </Text>
            <View style={styles.rateInput}>
              <TextInput
                style={styles.rateField}
                value={newRate}
                onChangeText={setNewRate}
                keyboardType="decimal-pad"
                placeholder="16.5"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.percent}>%</Text>
            </View>
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRateModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Button label="Save Rate" onPress={handleSaveRate} loading={loading} size="md" style={styles.saveBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  // Inactive
  inactiveContent: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  taxflowBadge: { color: colors.primary, fontSize: fontSize.xl, fontWeight: '800', backgroundColor: colors.primaryMuted, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.primary },
  inactiveTitle: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  inactiveBody: { color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', lineHeight: 24 },
  trialBtn: {},
  trialNote: { color: colors.textMuted, fontSize: fontSize.xs },
  // Active
  deadlineAlert: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, backgroundColor: colors.warningMuted, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.warning },
  alertBody: {},
  alertTitle: { color: colors.warning, fontSize: fontSize.md, fontWeight: '700' },
  alertSub: { color: colors.warning, fontSize: fontSize.sm, opacity: 0.8 },
  statsCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  statsTitle: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBlock: {},
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: 4 },
  statValue: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  gold: { color: colors.primary },
  currentQ: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  qLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  qRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qSub: { color: colors.textMuted, fontSize: fontSize.xs },
  qValue: { color: colors.primary, fontSize: 28, fontWeight: '800' },
  qStatus: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  qStatusText: { fontSize: fontSize.sm, fontWeight: '600' },
  qDeadline: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginTop: spacing.sm },
  qCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  qCardLeft: {},
  qCardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  qCardSub: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  qCardRight: { alignItems: 'flex-end', gap: 6 },
  qCardWithheld: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '700' },
  qBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  qBadgeText: { fontSize: 10, fontWeight: '600' },
  noData: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md },
  downloadText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  // Modal
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl, gap: spacing.md },
  sheetTitle: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  sheetBody: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  rateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md },
  rateField: { flex: 1, color: colors.text, fontSize: 24, fontWeight: '700', paddingVertical: spacing.md },
  percent: { color: colors.textMuted, fontSize: 20 },
  sheetActions: { flexDirection: 'row', gap: spacing.md },
  cancelBtn: { flex: 1, padding: spacing.md, alignItems: 'center', borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.textSecondary, fontWeight: '600' },
  saveBtn: { flex: 1 },
});

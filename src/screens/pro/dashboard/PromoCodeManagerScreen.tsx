import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  Modal, TextInput, Alert, Share, Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { PromoCode } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { ScreenHeader, Button } from '../../../components';
import { formatCents } from '../../../utils/taxCalc';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';
import { format, parseISO } from 'date-fns';

export const PromoCodeManagerScreen: React.FC = () => {
  const navigation = useNavigation();
  const { firebaseUser } = useAuth();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [codeName, setCodeName] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    return onSnapshot(
      query(collection(db, 'barbers', firebaseUser.uid, 'promoCodes'), orderBy('createdAt', 'desc')),
      (snap) => setCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PromoCode))),
    );
  }, [firebaseUser]);

  const handleCreate = async () => {
    if (!codeName.trim() || !discountValue) { Alert.alert('Missing fields', 'Code name and discount value are required.'); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'barbers', firebaseUser!.uid, 'promoCodes'), {
        barberId: firebaseUser!.uid,
        code: codeName.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        expiresAt: null,
        redemptionCount: 0,
        totalDiscountGiven: 0,
        isActive: true,
        createdAt: serverTimestamp(),
      });
      setModalVisible(false);
      setCodeName(''); setDiscountValue('');
    } catch { Alert.alert('Error', 'Could not create promo code.'); }
    finally { setLoading(false); }
  };

  const toggleActive = async (code: PromoCode) => {
    await updateDoc(doc(db, 'barbers', firebaseUser!.uid, 'promoCodes', code.id), { isActive: !code.isActive });
  };

  const handleShare = async (code: PromoCode) => {
    await Share.share({
      message: `Use code ${code.code} for ${code.discountType === 'percent' ? `${code.discountValue}% off` : formatCents(code.discountValue * 100)} your next appointment!`,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Promo Codes" onBack={() => navigation.goBack()} rightAction={{ icon: 'add', onPress: () => setModalVisible(true) }} />
      <FlatList
        data={codes}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.codeCard}>
            <View style={styles.codeTop}>
              <View style={styles.codeLeft}>
                <Text style={styles.codeName}>{item.code}</Text>
                <Text style={styles.codeDiscount}>
                  {item.discountType === 'percent' ? `${item.discountValue}% off` : `${formatCents(item.discountValue * 100)} off`}
                </Text>
              </View>
              <View style={styles.codeRight}>
                <Switch value={item.isActive} onValueChange={() => toggleActive(item)} trackColor={{ false: colors.border, true: colors.primaryMuted }} thumbColor={item.isActive ? colors.primary : colors.textMuted} />
                <TouchableOpacity onPress={() => handleShare(item)} style={styles.shareBtn}>
                  <Ionicons name="share-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.codeStats}>
              <Text style={styles.codeStat}>{item.redemptionCount} redemptions</Text>
              <Text style={styles.codeStat}>·</Text>
              <Text style={styles.codeStat}>{formatCents(item.totalDiscountGiven)} total given</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="pricetag-outline" size={40} color={colors.textMuted} /><Text style={styles.emptyText}>No promo codes yet</Text></View>}
      />
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Create Promo Code</Text>
            <TextInput style={styles.input} placeholder="Code name (e.g. SUMMER20)" placeholderTextColor={colors.textMuted} value={codeName} onChangeText={(v) => setCodeName(v.toUpperCase())} autoCapitalize="characters" />
            <View style={styles.typeRow}>
              {(['percent', 'fixed'] as const).map((t) => (
                <TouchableOpacity key={t} style={[styles.typeBtn, discountType === t && styles.typeBtnActive]} onPress={() => setDiscountType(t)}>
                  <Text style={[styles.typeBtnText, discountType === t && styles.typeBtnTextActive]}>{t === 'percent' ? '% Off' : '$ Off'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder={discountType === 'percent' ? 'e.g. 20 (for 20%)' : 'e.g. 10 (for $10 off)'} placeholderTextColor={colors.textMuted} value={discountValue} onChangeText={setDiscountValue} keyboardType="decimal-pad" />
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <Button label="Create" onPress={handleCreate} loading={loading} size="md" style={styles.createBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  codeCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  codeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  codeLeft: {},
  codeName: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '800', letterSpacing: 1 },
  codeDiscount: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  codeRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  shareBtn: { padding: spacing.xs },
  codeStats: { flexDirection: 'row', gap: spacing.xs },
  codeStat: { color: colors.textMuted, fontSize: fontSize.xs },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl, gap: spacing.md },
  sheetTitle: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontSize: fontSize.md, borderWidth: 1, borderColor: colors.border },
  typeRow: { flexDirection: 'row', gap: spacing.md },
  typeBtn: { flex: 1, padding: spacing.sm + 2, alignItems: 'center', borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
  typeBtnActive: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  typeBtnText: { color: colors.textSecondary, fontWeight: '600' },
  typeBtnTextActive: { color: colors.primary },
  sheetActions: { flexDirection: 'row', gap: spacing.md },
  cancelBtn: { flex: 1, padding: spacing.md, alignItems: 'center', borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.textSecondary, fontWeight: '600' },
  createBtn: { flex: 1 },
});

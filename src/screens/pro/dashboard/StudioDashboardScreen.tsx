import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { Studio, Barber } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { ScreenHeader } from '../../../components';
import { formatCents } from '../../../utils/taxCalc';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

export const StudioDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { barberProfile, firebaseUser } = useAuth();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [professionals, setProfessionals] = useState<Barber[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    if (!firebaseUser || !barberProfile?.studioId) return;
    getDoc(doc(db, 'studios', barberProfile.studioId)).then((snap) => {
      if (snap.exists()) setStudio({ id: snap.id, ...snap.data() } as Studio);
    });
  }, [firebaseUser, barberProfile?.studioId]);

  useEffect(() => {
    if (!studio) return;
    Promise.all(studio.professionalIds.map((uid) => getDoc(doc(db, 'barbers', uid)))).then((snaps) => {
      setProfessionals(snaps.filter((s) => s.exists()).map((s) => ({ uid: s.id, ...s.data() } as Barber)));
    });
  }, [studio]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Studio Dashboard" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Studio info */}
        {studio && (
          <View style={styles.studioCard}>
            {studio.photoURL ? <Image source={{ uri: studio.photoURL }} style={styles.studioPhoto} /> : <View style={[styles.studioPhoto, styles.placeholder]}><Ionicons name="storefront-outline" size={40} color={colors.textMuted} /></View>}
            <Text style={styles.studioName}>{studio.name}</Text>
            <Text style={styles.studioAddress}>{studio.city}, {studio.state}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statLabel}>Professionals</Text><Text style={styles.statValue}>{professionals.length}</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>Monthly Revenue</Text><Text style={styles.statValue}>{formatCents(monthlyRevenue)}</Text></View>
        </View>

        {/* Professionals */}
        <Text style={styles.sectionTitle}>Professionals</Text>
        {professionals.map((pro) => (
          <TouchableOpacity key={pro.uid} style={styles.proRow} activeOpacity={0.75}>
            {pro.photoURL ? <Image source={{ uri: pro.photoURL }} style={styles.proAvatar} /> : <View style={[styles.proAvatar, styles.avatarPH]}><Text style={styles.initial}>{pro.displayName.charAt(0)}</Text></View>}
            <View style={styles.proInfo}>
              <Text style={styles.proName}>{pro.displayName}</Text>
              <Text style={styles.proMeta}>⭐ {pro.rating > 0 ? pro.rating.toFixed(1) : 'New'} · {pro.reviewCount} reviews</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        {(!studio || !barberProfile?.studioId) && (
          <View style={styles.empty}>
            <Ionicons name="storefront-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No studio linked yet</Text>
            <Text style={styles.emptySubtext}>Contact support to create your studio profile</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  studioCard: { alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  studioPhoto: { width: 80, height: 80, borderRadius: borderRadius.md },
  placeholder: { backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  studioName: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  studioAddress: { color: colors.textMuted, fontSize: fontSize.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  statLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: 4 },
  statValue: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  proRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  proAvatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPH: { backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.primary, fontSize: fontSize.md, fontWeight: '700' },
  proInfo: { flex: 1 },
  proName: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginBottom: 2 },
  proMeta: { color: colors.textMuted, fontSize: fontSize.sm },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
  emptySubtext: { color: colors.textMuted, fontSize: fontSize.sm },
});

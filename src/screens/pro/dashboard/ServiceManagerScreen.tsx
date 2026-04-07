import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { ProStackParamList, Service } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { DashboardServiceCard, ScreenHeader } from '../../../components';
import { PROFESSION_LABELS } from '../../../utils/badges';
import { colors, fontSize, spacing } from '../../../theme';

type Nav = NativeStackNavigationProp<ProStackParamList>;

export const ServiceManagerScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { firebaseUser, barberProfile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(collection(db, 'barbers', firebaseUser.uid, 'services'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service)));
    });
  }, [firebaseUser]);

  const toggleActive = async (svcId: string, active: boolean) => {
    await updateDoc(doc(db, 'barbers', firebaseUser!.uid, 'services', svcId), { isActive: active });
  };

  // Group by profession
  const professions = [...new Set(services.map((s) => s.profession))];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Services"
        onBack={() => navigation.goBack()}
        rightAction={{ icon: 'add', onPress: () => navigation.navigate('AddEditService', {}) }}
      />
      <FlatList
        data={professions}
        keyExtractor={(p) => p}
        contentContainerStyle={styles.content}
        renderItem={({ item: profession }) => (
          <View>
            {(barberProfile?.professions?.length ?? 0) > 1 && (
              <Text style={styles.professionLabel}>{PROFESSION_LABELS[profession]}</Text>
            )}
            {services
              .filter((s) => s.profession === profession)
              .map((svc) => (
                <DashboardServiceCard
                  key={svc.id}
                  service={svc}
                  onEdit={() => navigation.navigate('AddEditService', { serviceId: svc.id })}
                  onToggleActive={(active) => toggleActive(svc.id, active)}
                />
              ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cut-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No services yet</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddEditService', {})} style={styles.addBtn}>
              <Text style={styles.addBtnText}>Add Your First Service</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  professionLabel: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
  addBtn: { backgroundColor: colors.primary, borderRadius: 99, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm + 2 },
  addBtnText: { color: colors.black, fontWeight: '700' },
});

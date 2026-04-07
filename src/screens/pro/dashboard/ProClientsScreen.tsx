import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { ProStackParamList, ClientNote } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { formatCents } from '../../../utils/taxCalc';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';
import { format, parseISO } from 'date-fns';

type Nav = NativeStackNavigationProp<ProStackParamList>;

export const ProClientsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { firebaseUser } = useAuth();
  const [clients, setClients] = useState<ClientNote[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!firebaseUser) return;
    const fetchClients = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'barbers', firebaseUser.uid, 'clientNotes'), orderBy('visitCount', 'desc')),
        );
        setClients(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as ClientNote)));
      } catch {}
    };
    fetchClients();
  }, [firebaseUser]);

  const filtered = clients.filter((c) =>
    c.displayName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clients..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.uid}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.clientRow}
            onPress={() => navigation.navigate('ClientDetail', { clientUid: item.uid })}
            activeOpacity={0.75}
          >
            {item.photoURL ? (
              <Image source={{ uri: item.photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{item.displayName.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.clientName}>{item.displayName}</Text>
              <View style={styles.meta}>
                <Text style={styles.metaText}>{item.visitCount} visit{item.visitCount !== 1 ? 's' : ''}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{formatCents(item.totalSpentCents)} total</Text>
                {item.lastVisitDate && (
                  <>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.metaText}>Last: {format(parseISO(item.lastVisitDate), 'MMM d')}</Text>
                  </>
                )}
              </View>
              {item.notes ? (
                <Text style={styles.note} numberOfLines={1}>{item.notes}</Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No clients yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, margin: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.text, fontSize: fontSize.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: { backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '700' },
  info: { flex: 1 },
  clientName: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginBottom: 3 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 3 },
  metaText: { color: colors.textMuted, fontSize: fontSize.xs },
  metaDot: { color: colors.textMuted, fontSize: fontSize.xs },
  note: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 3, fontStyle: 'italic' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
});

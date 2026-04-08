import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { ClientStackParamList, Barber } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { FavoriteCard } from '../../components';
import { colors, fontSize, spacing } from '../../theme';

type Nav = NativeStackNavigationProp<ClientStackParamList>;

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { clientProfile } = useAuth();
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    const faves = clientProfile?.favoriteBarbers ?? [];
    if (faves.length === 0) return;
    Promise.all(faves.map((uid) => getDoc(doc(db, 'barbers', uid)))).then((snaps) => {
      setBarbers(snaps.filter((s) => s.exists()).map((s) => ({ uid: s.id, ...s.data() } as Barber)));
    });
  }, [clientProfile?.favoriteBarbers]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={barbers}
        keyExtractor={(b) => b.uid}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<Text style={styles.title}>Favorites</Text>}
        renderItem={({ item }) => (
          <FavoriteCard
            barber={item}
            onPress={() => navigation.navigate('ProfessionalProfile', { barberId: item.uid })}
            onBook={() => navigation.navigate('BookingFlow', { barberId: item.uid })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySub}>Tap the heart on any professional's profile to save them here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: spacing.lg },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md, paddingHorizontal: spacing.xl },
  emptyText: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600' },
  emptySub: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center' },
});

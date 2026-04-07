import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import {
  ClientStackParamList,
  Barber,
  Profession,
  SelfSelectBadgeId,
  DiscoveryFilters,
} from '../../types';
import { db } from '../../firebase/config';
import { useDiscoveryStore } from '../../store/discoveryStore';
import { ProfessionalCard } from '../../components';
import { BadgeChip } from '../../components';
import { ProfessionCard } from '../../components';
import {
  PROFESSION_LABELS,
  PROFESSION_EMOJIS,
  SELF_SELECT_BADGES,
} from '../../utils/badges';
import { colors, fontSize, spacing, borderRadius } from '../../theme';

type Nav = NativeStackNavigationProp<ClientStackParamList>;

const ALL_PROFESSIONS: Profession[] = [
  'barber',
  'hair_stylist',
  'nail_tech',
  'lash_tech',
  'makeup_artist',
];

export const DiscoveryScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { filters, viewMode, userLocation, searchQuery, setViewMode, setSearchQuery, setFilters, toggleProfession, toggleBadge, resetFilters } = useDiscoveryStore();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef<MapView>(null);

  const fetchBarbers = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'barbers'),
        where('isActive', '==', true),
        where('onboardingComplete', '==', true),
        limit(50),
      );

      const snap = await getDocs(q);
      let results = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as Barber));

      // Client-side filters
      if (filters.professions.length > 0) {
        results = results.filter((b) =>
          b.professions.some((p) => filters.professions.includes(p)),
        );
      }
      if (filters.minRating !== null) {
        results = results.filter((b) => b.rating >= (filters.minRating ?? 0));
      }
      if (filters.badges.length > 0) {
        results = results.filter((b) =>
          filters.badges.every((badge) => b.selectedBadges.includes(badge)),
        );
      }
      if (filters.acceptsWalkIns) {
        results = results.filter((b) => b.acceptsWalkIns);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        results = results.filter(
          (b) =>
            b.displayName.toLowerCase().includes(q) ||
            b.city.toLowerCase().includes(q) ||
            b.professions.some((p) => PROFESSION_LABELS[p].toLowerCase().includes(q)),
        );
      }

      setBarbers(results);
    } catch {}
    setLoading(false);
  }, [filters, searchQuery]);

  useEffect(() => { fetchBarbers(); }, [fetchBarbers]);

  const activeFilterCount = [
    filters.professions.length > 0,
    filters.badges.length > 0,
    filters.minRating !== null,
    filters.acceptsWalkIns,
    filters.availableToday,
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Search + controls */}
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, city, service..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? colors.black : colors.primary} />
          {activeFilterCount > 0 && (
            <Text style={styles.filterCount}>{activeFilterCount}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Profession quick filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.profScroll}
        contentContainerStyle={styles.profScrollContent}
      >
        {ALL_PROFESSIONS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.profChip, filters.professions.includes(p) && styles.profChipSelected]}
            onPress={() => toggleProfession(p)}
          >
            <Text style={styles.profChipEmoji}>{PROFESSION_EMOJIS[p]}</Text>
            <Text style={[styles.profChipText, filters.professions.includes(p) && styles.profChipTextSelected]}>
              {PROFESSION_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons name="list-outline" size={16} color={viewMode === 'list' ? colors.black : colors.textMuted} />
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
          onPress={() => setViewMode('map')}
        >
          <Ionicons name="map-outline" size={16} color={viewMode === 'map' ? colors.black : colors.textMuted} />
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>Map</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {viewMode === 'list' ? (
        <FlatList
          data={barbers}
          keyExtractor={(b) => b.uid}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchBarbers}
          renderItem={({ item }) => (
            <ProfessionalCard
              barber={item}
              onPress={() => navigation.navigate('ProfessionalProfile', { barberId: item.uid })}
              onBookNow={() => navigation.navigate('BookingFlow', { barberId: item.uid })}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>No professionals found</Text>
                <Text style={styles.emptyBody}>Try adjusting your filters or search in a different area</Text>
                {activeFilterCount > 0 && (
                  <TouchableOpacity onPress={resetFilters} style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
        />
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: userLocation?.latitude ?? 33.749,
            longitude: userLocation?.longitude ?? -84.388,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {barbers
            .filter((b) => b.location)
            .map((b) => (
              <Marker
                key={b.uid}
                coordinate={{ latitude: b.location!.latitude, longitude: b.location!.longitude }}
                title={b.displayName}
                description={b.professions.map((p) => PROFESSION_LABELS[p]).join(', ')}
                onCalloutPress={() => navigation.navigate('ProfessionalProfile', { barberId: b.uid })}
                pinColor={colors.primary}
              />
            ))}
        </MapView>
      )}

      {/* Filter modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.filterOverlay}>
          <View style={styles.filterSheet}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Min rating */}
              <Text style={styles.filterSection}>Minimum Rating</Text>
              <View style={styles.ratingRow}>
                {[null, 4, 4.5, 4.8].map((r) => (
                  <TouchableOpacity
                    key={String(r)}
                    style={[styles.ratingChip, filters.minRating === r && styles.ratingChipSelected]}
                    onPress={() => setFilters({ minRating: r })}
                  >
                    <Text style={[styles.ratingChipText, filters.minRating === r && styles.ratingChipTextSelected]}>
                      {r === null ? 'Any' : `${r}+⭐`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Walk-ins */}
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Accepts Walk-Ins</Text>
                <Switch
                  value={filters.acceptsWalkIns}
                  onValueChange={(v) => setFilters({ acceptsWalkIns: v })}
                  trackColor={{ false: colors.border, true: colors.primaryMuted }}
                  thumbColor={filters.acceptsWalkIns ? colors.primary : colors.textMuted}
                />
              </View>

              {/* Available today */}
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Available Today</Text>
                <Switch
                  value={filters.availableToday}
                  onValueChange={(v) => setFilters({ availableToday: v })}
                  trackColor={{ false: colors.border, true: colors.primaryMuted }}
                  thumbColor={filters.availableToday ? colors.primary : colors.textMuted}
                />
              </View>

              {/* Badges */}
              <Text style={styles.filterSection}>Badges</Text>
              <View style={styles.badgeRow}>
                {SELF_SELECT_BADGES.slice(0, 12).map((b) => (
                  <BadgeChip
                    key={b.id}
                    badgeId={b.id}
                    selected={filters.badges.includes(b.id as SelfSelectBadgeId)}
                    onPress={() => toggleBadge(b.id as SelfSelectBadgeId)}
                  />
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => { setShowFilters(false); fetchBarbers(); }}
            >
              <Text style={styles.applyBtnText}>Show Results ({barbers.length})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, paddingBottom: spacing.xs },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.text, fontSize: fontSize.md },
  filterBtn: { width: 44, height: 44, borderRadius: borderRadius.full, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterCount: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.error, width: 16, height: 16, borderRadius: 8, textAlign: 'center', color: colors.white, fontSize: 9, fontWeight: '700', lineHeight: 16 },
  profScroll: { maxHeight: 48 },
  profScrollContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, gap: spacing.sm },
  profChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderWidth: 1, borderColor: colors.border },
  profChipSelected: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  profChipEmoji: { fontSize: 14 },
  profChipText: { color: colors.textSecondary, fontSize: fontSize.sm },
  profChipTextSelected: { color: colors.primary, fontWeight: '600' },
  viewToggle: { flexDirection: 'row', margin: spacing.md, marginTop: spacing.xs, backgroundColor: colors.surface, borderRadius: 8, padding: 3 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: spacing.xs + 2, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  toggleTextActive: { color: colors.black },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  map: { flex: 1 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md, paddingHorizontal: spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  emptyBody: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center' },
  clearBtn: { backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm + 2, borderWidth: 1, borderColor: colors.primary },
  clearBtnText: { color: colors.primary, fontWeight: '600' },
  // Filter modal
  filterOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  filterSheet: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.lg, maxHeight: '80%' },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  filterTitle: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  clearText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  filterSection: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },
  ratingRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  ratingChip: { backgroundColor: colors.background, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderWidth: 1, borderColor: colors.border },
  ratingChipSelected: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  ratingChipText: { color: colors.textSecondary, fontSize: fontSize.sm },
  ratingChipTextSelected: { color: colors.primary, fontWeight: '600' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterLabel: { color: colors.text, fontSize: fontSize.md },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  applyBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.full, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  applyBtnText: { color: colors.black, fontSize: fontSize.md, fontWeight: '700' },
});

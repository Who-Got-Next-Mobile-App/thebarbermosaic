import { create } from 'zustand';
import { DiscoveryFilters, Profession, SelfSelectBadgeId } from '../types';

const defaultFilters: DiscoveryFilters = {
  professions: [],
  radiusMiles: 10,
  minRating: null,
  maxPricePerServiceCents: null,
  badges: [],
  availableToday: false,
  availableThisWeek: false,
  specificDate: null,
  acceptsWalkIns: false,
  sortBy: 'distance',
};

interface DiscoveryStore {
  filters: DiscoveryFilters;
  searchQuery: string;
  viewMode: 'list' | 'map';
  userLocation: { latitude: number; longitude: number } | null;
  userZip: string | null;
  setFilters: (filters: Partial<DiscoveryFilters>) => void;
  setProfessions: (professions: Profession[]) => void;
  toggleProfession: (profession: Profession) => void;
  toggleBadge: (badge: SelfSelectBadgeId) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'list' | 'map') => void;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  setUserZip: (zip: string | null) => void;
  resetFilters: () => void;
}

export const useDiscoveryStore = create<DiscoveryStore>((set, get) => ({
  filters: defaultFilters,
  searchQuery: '',
  viewMode: 'list',
  userLocation: null,
  userZip: null,

  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),

  setProfessions: (professions) =>
    set((state) => ({ filters: { ...state.filters, professions } })),

  toggleProfession: (profession) => {
    const current = get().filters.professions;
    const updated = current.includes(profession)
      ? current.filter((p) => p !== profession)
      : [...current, profession];
    set((state) => ({ filters: { ...state.filters, professions: updated } }));
  },

  toggleBadge: (badge) => {
    const current = get().filters.badges;
    const updated = current.includes(badge)
      ? current.filter((b) => b !== badge)
      : [...current, badge];
    set((state) => ({ filters: { ...state.filters, badges: updated } }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setUserLocation: (location) => set({ userLocation: location }),
  setUserZip: (zip) => set({ userZip: zip }),
  resetFilters: () => set({ filters: defaultFilters }),
}));

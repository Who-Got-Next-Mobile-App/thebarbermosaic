import { create } from 'zustand';
import { Barber, Client, UserRole, ProfileType, SubscriptionStatus } from '../types';

interface AuthState {
  // Firebase user
  firebaseUid: string | null;
  email: string | null;
  role: UserRole | null;
  // Profile data
  barberProfile: Barber | null;
  clientProfile: Client | null;
  // Loading states
  isAuthLoading: boolean;
  isProfileLoading: boolean;
  // Onboarding
  onboardingComplete: boolean;
  // Actions
  setFirebaseUser: (uid: string | null, email: string | null) => void;
  setRole: (role: UserRole | null) => void;
  setBarberProfile: (profile: Barber | null) => void;
  setClientProfile: (profile: Client | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setProfileLoading: (loading: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUid: null,
  email: null,
  role: null,
  barberProfile: null,
  clientProfile: null,
  isAuthLoading: true,
  isProfileLoading: false,
  onboardingComplete: false,

  setFirebaseUser: (uid, email) => set({ firebaseUid: uid, email }),
  setRole: (role) => set({ role }),
  setBarberProfile: (profile) =>
    set({ barberProfile: profile, onboardingComplete: profile?.onboardingComplete ?? false }),
  setClientProfile: (profile) =>
    set({ clientProfile: profile, onboardingComplete: profile?.onboardingComplete ?? false }),
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),
  setProfileLoading: (loading) => set({ isProfileLoading: loading }),
  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
  clearAuth: () =>
    set({
      firebaseUid: null,
      email: null,
      role: null,
      barberProfile: null,
      clientProfile: null,
      onboardingComplete: false,
    }),
}));

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Barber, Client, UserRole, Profession, ProfileType } from '../types';
import { useAuthStore } from '../store/authStore';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  barberProfile: Barber | null;
  clientProfile: Client | null;
  role: UserRole | null;
  isAuthLoading: boolean;
  onboardingComplete: boolean;
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signUpBarber: (email: string, password: string, phone: string) => Promise<void>;
  signUpClient: (
    email: string,
    password: string,
    displayName: string,
    phone: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  // Profile actions
  refreshProfile: () => Promise<void>;
  updateBarberProfile: (data: Partial<Barber>) => Promise<void>;
  updateClientProfile: (data: Partial<Client>) => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const {
    role,
    barberProfile,
    clientProfile,
    onboardingComplete,
    setFirebaseUser: storeSetFirebaseUser,
    setRole,
    setBarberProfile,
    setClientProfile,
    setAuthLoading,
    clearAuth,
  } = useAuthStore();

  // ─── Load profile from Firestore ────────────────────────────────────────────

  const loadProfile = useCallback(async (uid: string) => {
    // Try barbers collection first
    const barberDoc = await getDoc(doc(db, 'barbers', uid));
    if (barberDoc.exists()) {
      const data = barberDoc.data() as Barber;
      setBarberProfile(data);
      setRole('barber');
      return;
    }

    // Fall back to clients collection
    const clientDoc = await getDoc(doc(db, 'clients', uid));
    if (clientDoc.exists()) {
      const data = clientDoc.data() as Client;
      setClientProfile(data);
      setRole('client');
      return;
    }

    // No profile yet — new user, role will be set during sign-up
    setRole(null);
  }, [setBarberProfile, setClientProfile, setRole]);

  // ─── Auth state listener ─────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      storeSetFirebaseUser(user?.uid ?? null, user?.email ?? null);

      if (user) {
        await loadProfile(user.uid);
      } else {
        clearAuth();
      }

      setIsAuthLoading(false);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, [loadProfile, storeSetFirebaseUser, clearAuth, setAuthLoading]);

  // ─── Sign in ─────────────────────────────────────────────────────────────

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
  };

  // ─── Sign up — Professional ──────────────────────────────────────────────

  const signUpBarber = async (
    email: string,
    password: string,
    phone: string,
  ) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    const now = new Date().toISOString();
    const profile: Barber = {
      uid: user.uid,
      displayName: '',
      email,
      phone,
      photoURL: '',
      bio: '',
      professions: [],
      profileType: 'solo',
      studioId: null,
      bookingSlug: '',
      location: null,
      address: '',
      city: '',
      state: '',
      selectedBadges: [],
      platformBadges: [],
      stripeAccountId: '',
      stripeOnboardingComplete: false,
      subscriptionTier: 'base',
      subscriptionStatus: 'trialing',
      stripeSubscriptionId: null,
      taxflowTrialEndsAt: null,
      taxWithholdRate: 0.165,
      rating: 0,
      reviewCount: 0,
      isActive: false,
      acceptsWalkIns: false,
      cancellationWindowHours: 24,
      cancellationFeePercent: 0,
      depositRequired: false,
      depositPercent: 25,
      autismFriendlyDetails: null,
      rebookIntervalWeeks: 3,
      onboardingComplete: false,
      fcmToken: null,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'barbers', user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setBarberProfile(profile);
    setRole('barber');
  };

  // ─── Sign up — Client ────────────────────────────────────────────────────

  const signUpClient = async (
    email: string,
    password: string,
    displayName: string,
    phone: string,
  ) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });

    const referralCode = generateReferralCode(user.uid);
    const now = new Date().toISOString();

    const profile: Client = {
      uid: user.uid,
      displayName,
      email,
      phone,
      photoURL: '',
      favoriteBarbers: [],
      stripeCustomerId: '',
      defaultPaymentMethodId: '',
      professionPreferences: [],
      notifPrefs: { email: true, push: true },
      referralCode,
      referredBy: null,
      referralCredits: 0,
      onboardingComplete: false,
      locationEnabled: false,
      lastKnownZip: null,
      fcmToken: null,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'clients', user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setClientProfile(profile);
    setRole('client');
  };

  // ─── Sign out ────────────────────────────────────────────────────────────

  const signOut = async () => {
    await firebaseSignOut(auth);
    clearAuth();
    setFirebaseUser(null);
  };

  // ─── Refresh profile ─────────────────────────────────────────────────────

  const refreshProfile = async () => {
    if (!firebaseUser) return;
    await loadProfile(firebaseUser.uid);
  };

  // ─── Update barber profile ────────────────────────────────────────────────

  const updateBarberProfile = async (data: Partial<Barber>) => {
    if (!firebaseUser) return;
    await updateDoc(doc(db, 'barbers', firebaseUser.uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    if (barberProfile) {
      setBarberProfile({ ...barberProfile, ...data });
    }
  };

  // ─── Update client profile ─────────────────────────────────────────────────

  const updateClientProfile = async (data: Partial<Client>) => {
    if (!firebaseUser) return;
    await updateDoc(doc(db, 'clients', firebaseUser.uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    if (clientProfile) {
      setClientProfile({ ...clientProfile, ...data });
    }
  };

  // ─── Mark onboarding complete ─────────────────────────────────────────────

  const markOnboardingComplete = async () => {
    if (!firebaseUser) return;
    const collection = role === 'barber' ? 'barbers' : 'clients';
    await updateDoc(doc(db, collection, firebaseUser.uid), {
      onboardingComplete: true,
      updatedAt: serverTimestamp(),
    });
    if (role === 'barber' && barberProfile) {
      setBarberProfile({ ...barberProfile, onboardingComplete: true });
    } else if (role === 'client' && clientProfile) {
      setClientProfile({ ...clientProfile, onboardingComplete: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        barberProfile,
        clientProfile,
        role,
        isAuthLoading,
        onboardingComplete,
        signIn,
        signInWithGoogle,
        signUpBarber,
        signUpClient,
        signOut,
        refreshProfile,
        updateBarberProfile,
        updateClientProfile,
        markOnboardingComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateReferralCode(uid: string): string {
  return uid.slice(0, 6).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

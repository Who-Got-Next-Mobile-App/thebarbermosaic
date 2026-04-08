/**
 * Stub — full implementation in feat/auth-context PR.
 * Keeps App.tsx compiling during the foundation PR.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import { UserRole } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  role: UserRole | null;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  role: null,
  isAuthLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, role: null, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

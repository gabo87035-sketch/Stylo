import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

interface UserProfile {
  nombre: string;
  email: string;
  tipo: 'cliente' | 'barbero' | 'salonera';
  foto?: string;
  telefono?: string;
  shopId?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  theme: 'default' | 'feminine' | 'masculine';
  signOut: () => Promise<void>;
  signInAsDemo: (nombre: string, telefono: string, tipo: 'cliente' | 'barbero' | 'salonera') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  theme: 'default',
  signOut: async () => {},
  signInAsDemo: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'default' | 'feminine' | 'masculine'>('default');

  const detectTheme = (name: string) => {
    const n = name.toLowerCase().trim();
    if (!n) return 'default';
    
    // Heuristic for Spanish names
    const femaleSuffixes = ['a', 'ia', 'ita', 'na', 'ra', 'sa', 'za', 'ie', 'is'];
    const maleSuffixes = ['o', 'os', 'an', 'el', 'on', 'er', 'ur'];
    
    if (femaleSuffixes.some(s => n.endsWith(s))) return 'feminine';
    if (maleSuffixes.some(s => n.endsWith(s))) return 'masculine';
    return 'default';
  };

  useEffect(() => {
    if (profile?.nombre) {
      setTheme(detectTheme(profile.nombre));
    } else {
      setTheme('default');
    }
  }, [profile]);

  // Load guest profile from localStorage if exists
  useEffect(() => {
    const guestData = localStorage.getItem('steylook_guest');
    if (guestData && !user) {
      setProfile(JSON.parse(guestData));
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const profilePath = `users/${firebaseUser.uid}`;
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            // Check if we have a simulated profile for this user
            const guestData = localStorage.getItem('steylook_guest');
            if (guestData) {
              setProfile(JSON.parse(guestData));
            } else {
              setProfile(null);
            }
          }
        } catch (error) {
          console.error("AuthContext: Firestore fetch failed, checking local storage fallback");
          const guestData = localStorage.getItem('steylook_guest');
          if (guestData) setProfile(JSON.parse(guestData));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAsDemo = (nombre: string, telefono: string, tipo: 'cliente' | 'barbero' | 'salonera') => {
    const demoProfile: UserProfile = {
      nombre,
      telefono,
      tipo,
      email: `${telefono}@demo.steylook.com`,
      foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`
    };
    localStorage.setItem('steylook_guest', JSON.stringify(demoProfile));
    setProfile(demoProfile);
  };

  const signOut = async () => {
    localStorage.removeItem('steylook_guest');
    await auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, theme, signOut, signInAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

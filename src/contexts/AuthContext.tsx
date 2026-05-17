import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  auth,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  signOut,
} from "@/lib/firebase";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUser({
              uid: firebaseUser.uid,
              ...data,
              name: data.name ?? data["Name"] ?? "",
              role: data.role?.toLowerCase(),
              roomNo: data.roomNo ?? data["Room NO."] ?? data["roomNo"] ?? "",
              email: data.email ?? data["email"] ?? "",
            });
          } else {
            console.error("User profile not found in Firestore");
            setUser(null);
          }
        } catch (err) {
          console.error(err);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isLoggedIn = !!user;
  const role = user?.role ?? null;
  const profile = user;

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoggedIn, role, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
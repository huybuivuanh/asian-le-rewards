import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebaseConfig";
import { signOutUser } from "@/services/authService";

type AuthContextType = {
  user: User | null;
  /** True until Firebase reports the saved login (or none) on app start. */
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      }),
    [],
  );

  return (
    <AuthContext value={{ user, loading, logout: signOutUser }}>{children}</AuthContext>
  );
}

export function useAuth() {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

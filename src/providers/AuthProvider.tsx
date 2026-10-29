import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebaseConfig";
import { signOutUser, signUp as signUpService, type SignUpInput } from "@/services/authService";
import { listenToMember } from "@/services/memberService";

type AuthContextType = {
  user: User | null;
  /** members/{uid}, live. `null` when signed out or the doc is missing. */
  member: Member | null;
  /** True until the saved login and (if signed in) the member doc have loaded. */
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  // uid whose member doc has loaded; while it differs from user.uid we're still loading.
  const [memberUid, setMemberUid] = useState<string | null>(null);
  // Firebase signs in as soon as the login is created, before the member doc is
  // saved. Hide the user until sign-up fully finishes so the sign-up screen stays
  // up (and can show an error) if saving the member fails.
  const [signingUp, setSigningUp] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setAuthLoading(false);
      }),
    [],
  );

  const uid = user?.uid;
  useEffect(() => {
    setMember(null);
    if (!uid) return;
    return listenToMember(
      uid,
      (next) => {
        setMember(next);
        setMemberUid(uid);
      },
      (error) => {
        if (__DEV__) console.warn("[member]", error);
        setMemberUid(uid);
      },
    );
  }, [uid]);

  const signUp = async (input: SignUpInput) => {
    setSigningUp(true);
    try {
      await signUpService(input);
    } finally {
      setSigningUp(false);
    }
  };

  const visibleUser = signingUp ? null : user;
  const loading = authLoading || (!!visibleUser && memberUid !== visibleUser.uid);

  return (
    <AuthContext
      value={{
        user: visibleUser,
        member: visibleUser ? member : null,
        loading,
        signUp,
        logout: signOutUser,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

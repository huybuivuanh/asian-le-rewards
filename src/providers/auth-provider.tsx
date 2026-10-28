import { createContext, use, useState, type ReactNode } from "react";
import {
  confirmVerificationCode,
  sendVerificationCode,
  signOutUser,
  type Session,
} from "@/lib/auth-service";

type PendingVerification = { phone: string; verificationId: string };

type AuthContextValue = {
  session: Session | null;
  pending: PendingVerification | null;
  sendCode: (phoneE164: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [pending, setPending] = useState<PendingVerification | null>(null);

  const sendCode = async (phone: string) => {
    const verificationId = await sendVerificationCode(phone);
    setPending({ phone, verificationId });
  };

  const verifyCode = async (code: string) => {
    if (!pending) throw new Error("Your sign-in expired. Please enter your number again.");
    const next = await confirmVerificationCode(pending.verificationId, pending.phone, code);
    setPending(null);
    setSession(next);
  };

  const signOut = async () => {
    await signOutUser();
    setSession(null);
  };

  return (
    <AuthContext value={{ session, pending, sendCode, verifyCode, signOut }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

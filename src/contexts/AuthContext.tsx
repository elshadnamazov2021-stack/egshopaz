import { createContext, useContext, type ReactNode } from "react";

type Role = "admin" | "seller" | "buyer" | "pvz";
interface MockUser { id: string; email?: string | null }
interface AuthCtx {
  session: null;
  user: MockUser | null;
  roles: Role[];
  loading: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  isPvz: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const value: AuthCtx = {
  session: null,
  user: null,
  roles: [],
  loading: false,
  isSeller: false,
  isAdmin: false,
  isPvz: false,
  signOut: async () => {},
  refreshRoles: async () => {},
};

const Ctx = createContext<AuthCtx>(value);
export function AuthProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);

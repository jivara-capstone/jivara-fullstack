export type UserRole = "super_admin" | "admin" | "nurse" | "patient";
export type AccountStatus = "pending" | "active" | "rejected" | "suspended";

export interface User {
  id: string;
  organizationId?: string | null;
  organizationName?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  role: UserRole | string;
  accountStatus?: AccountStatus | string | null;
  age: number;
  gender?: string | null;
  address?: string | null;
  mustChangePassword?: boolean | null;
  rejectedReason?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  createdAt?: string | null;
}

/**
 * Bentuk state autentikasi untuk Zustand store.
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  updateToken: (token: string) => void;
  logout: () => void;
}

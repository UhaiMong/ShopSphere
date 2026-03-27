//  Auth
export type UserRole = "user" | "admin" | "superadmin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  phone?: string;
  addresses: Address[];
  lastLogin?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface Address {
  _id?: string;
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

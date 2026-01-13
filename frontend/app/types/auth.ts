export enum UserRole {
  Owner = 1,
  Administrator = 2,
  Member = 3,
}

export interface User {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
  role: UserRole
  organizationId: number
  avatar: string | null
  googleId: string | null
  onboardingCompleted: boolean
  isSuperAdmin: boolean
  resellerId: number | null
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

export interface LoginResponse {
  token: string
  user: User
}

export interface MagicLinkResponse {
  message: string
}

// Credit mode types
export type CreditMode = 'shared' | 'individual'

export interface CreditTransaction {
  id: number
  userId: number | null
  amount: number
  balanceAfter: number
  type: 'usage' | 'purchase' | 'bonus' | 'refund' | 'distribution' | 'recovery' | 'refill'
  description: string | null
  audioId: number | null
  createdAt: string
  audio?: {
    id: number
    title: string
    fileName: string
  }
  user?: {
    id: number
    fullName: string | null
    firstName: string | null
    lastName: string | null
    email: string
  }
  performedBy?: {
    id: number
    fullName: string | null
    email: string
  } | null
}

export interface CreditsBalanceResponse {
  credits: number
  mode: CreditMode
  organizationCredits: number
}

export interface CreditModeResponse {
  mode: CreditMode
  organizationCredits: number
}

export interface UpdateCreditModeResponse {
  message: string
  mode: CreditMode
  organizationCredits: number
  previousMode: CreditMode
  recoveredCredits: number
}

export interface UserCreditBalance {
  userId: number
  user: {
    id: number
    fullName: string | null
    firstName: string | null
    lastName: string | null
    email: string
    avatar: string | null
  }
  role: 1 | 2 | 3
  balance: number
  creditCap: number | null
  autoRefillEnabled: boolean
  autoRefillAmount: number | null
  autoRefillDay: number | null
  hasUserCredit: boolean
}

export interface MemberCreditsResponse {
  data: UserCreditBalance[]
  mode: CreditMode
}

export interface MemberCreditDetailResponse {
  userId: number
  user: {
    id: number
    fullName: string | null
    firstName: string | null
    lastName: string | null
    email: string
    avatar: string | null
  }
  role: 1 | 2 | 3
  balance: number
  creditCap: number | null
  autoRefillEnabled: boolean
  autoRefillAmount: number | null
  autoRefillDay: number | null
}

export interface DistributeCreditsRequest {
  userId: number
  amount: number
  description?: string
}

export interface DistributeCreditsResponse {
  message: string
  transaction: UserCreditTransaction
  userBalance: number
  organizationCredits: number
}

export interface RecoverCreditsRequest {
  userId: number
  amount: number
  description?: string
}

export interface RecoverCreditsResponse {
  message: string
  transaction: UserCreditTransaction
  userBalance: number
  organizationCredits: number
}

export interface AutoRefillConfig {
  enabled: boolean
  amount?: number
  day?: number
}

export interface AutoRefillConfigResponse {
  message: string
  autoRefillEnabled: boolean
  autoRefillAmount: number | null
  autoRefillDay: number | null
}

// Global (organization-level) auto-refill configuration
export interface GlobalAutoRefillConfig {
  enabled: boolean
  defaultAmount?: number
  defaultDay?: number
}

export interface GlobalAutoRefillResponse {
  enabled: boolean
  defaultAmount: number | null
  defaultDay: number | null
  creditMode: 'shared' | 'individual'
}

export interface GlobalAutoRefillConfigResponse {
  message: string
  enabled: boolean
  defaultAmount: number | null
  defaultDay: number | null
}

export interface UserCreditTransaction {
  id: number
  userId: number
  organizationId: number
  performedByUserId: number | null
  amount: number
  balanceAfter: number
  type: 'distribution' | 'recovery' | 'usage' | 'refill'
  description: string | null
  audioId: number | null
  createdAt: string
  performedBy?: {
    id: number
    fullName: string | null
    email: string
  } | null
}

export interface UserCreditHistoryResponse {
  data: UserCreditTransaction[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export interface CreditsHistoryResponse {
  data: CreditTransaction[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

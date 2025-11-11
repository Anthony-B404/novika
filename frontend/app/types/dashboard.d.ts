export type Period = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface Range {
  start: Date
  end: Date
}

export interface Stat {
  title: string
  icon: string
  value: string | number
  variation: number
}

export interface Customer {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: Date
}

export interface Mail {
  id: number
  from: string
  subject: string
  preview: string
  date: Date
  read: boolean
}

export interface NavItem {
  label: string
  to?: string
  icon: string
  badge?: string | number
  children?: NavItem[]
}

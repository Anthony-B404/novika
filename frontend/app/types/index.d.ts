import type { AvatarProps } from "@nuxt/ui";
import type { UserRole } from './auth'

export type UserStatus = "subscribed" | "unsubscribed" | "bounced";
export type SaleStatus = "paid" | "failed" | "refunded";

// API error response type for catch blocks
export interface ApiError {
  data?: {
    message?: string;
    code?: string;
    errors?: Record<string, string[]>;
  };
  message?: string;
  statusCode?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: AvatarProps;
  status: UserStatus;
  location: string;
}

export interface Mail {
  id: number;
  unread?: boolean;
  from: User;
  subject: string;
  body: string;
  date: string;
}

export interface Member {
  id: number;
  fullName: string | null;
  email: string;
  role: UserRole;
  avatar: string | null;
  isCurrentUser: boolean;
}

export interface Invitation {
  id: number;
  identifier: string;
  email: string;
  organizationId: number;
  role: UserRole;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stat {
  title: string;
  icon: string;
  value: number | string;
  variation: number;
  formatter?: (value: number) => string;
}

export interface Sale {
  id: string;
  date: string;
  status: SaleStatus;
  email: string;
  amount: number;
}

export interface Notification {
  id: number;
  unread?: boolean;
  sender: User;
  body: string;
  date: string;
}

export type Period = "daily" | "weekly" | "monthly";

export interface Range {
  start: Date;
  end: Date;
}

// User and Auth types
export interface User {
  id: string;
  email: string;
  walletAddress: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Wallet types
export interface Wallet {
  id: string;
  address: string;
  balance: string;
  balanceUSD: number;
  network: 'arc-testnet' | 'arc-mainnet';
  createdAt: string;
}

// Content types
export interface ContentItem {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  qualityScore: number;
  relevanceScore: number;
  thumbnail?: string;
  createdAt: string;
  paymentStatus?: 'paid' | 'pending' | 'unpaid';
}

export interface ContentFeed {
  items: ContentItem[];
  total: number;
  page: number;
  pageSize: number;
}

// Payment types
export interface Payment {
  id: string;
  contentId: string;
  amount: number;
  currency: 'USDC';
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
  completedAt?: string;
  contentTitle?: string;
  creatorName?: string;
}

export interface PaymentHistory {
  payments: Payment[];
  total: number;
  totalSpent: number;
}

export interface SubscriptionPayment {
  id: string;
  creatorId: string;
  creatorName: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextPaymentDate: string;
  status: 'active' | 'paused' | 'cancelled';
  createdAt: string;
}

// Preferences types
export interface BudgetSettings {
  dailyLimit: number;
  monthlyLimit: number;
  autoPay: boolean;
}

export interface AISettings {
  minimumQualityScore: number;
  paymentThreshold: number;
  autoSubscribe: boolean;
}

export interface UserPreferences {
  budgetSettings: BudgetSettings;
  aiSettings: AISettings;
  interests: string[];
  notificationsEnabled: boolean;
}

// Agent types
export interface AgentStatus {
  isActive: boolean;
  lastRun: string;
  nextRun: string;
  paymentsProcessed: number;
  contentAnalyzed: number;
}

export interface AgentAction {
  id: string;
  type: 'payment' | 'subscription' | 'analysis' | 'recommendation';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  completedAt?: string;
}

// Dashboard stats
export interface DashboardStats {
  walletBalance: number;
  todaySpent: number;
  monthlySpent: number;
  contentPaid: number;
  averageQuality: number;
  activeSubscriptions: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

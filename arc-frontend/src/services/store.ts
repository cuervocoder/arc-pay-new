import { create } from 'zustand';
import { User, Wallet, UserPreferences, AgentStatus, DashboardStats, BudgetSettings, AISettings } from '../types';
import { apiService } from './api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

interface WalletStore {
  wallet: Wallet | null;
  isLoading: boolean;
  fetchWallet: () => Promise<void>;
  createWallet: () => Promise<void>;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number, address: string) => Promise<void>;
  setWallet: (wallet: Wallet) => void;
}

interface PreferencesStore {
  preferences: UserPreferences | null;
  isLoading: boolean;
  fetchPreferences: () => Promise<void>;
  updateBudgetSettings: (settings: Partial<BudgetSettings>) => Promise<void>;
  updateAISettings: (settings: Partial<AISettings>) => Promise<void>;
  addInterest: (interest: string) => Promise<void>;
  removeInterest: (interest: string) => Promise<void>;
}

interface AgentStore {
  status: AgentStatus | null;
  isLoading: boolean;
  fetchStatus: () => Promise<void>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

interface DashboardStore {
  stats: DashboardStats | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
}

// Auth Store
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiService.signIn(email, password);
      if (response.data?.user) {
        set({ user: response.data.user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      const response = await apiService.signUp(email, password, name);
      if (response.data?.user) {
        set({ user: response.data.user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await apiService.logout();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));

// Wallet Store
export const useWalletStore = create<WalletStore>((set) => ({
  wallet: null,
  isLoading: false,

  fetchWallet: async () => {
    set({ isLoading: true });
    try {
      const response = await apiService.getWallet();
      if (response.data) {
        set({ wallet: response.data });
      }
    } catch (error) {
      console.error('Fetch wallet error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createWallet: async () => {
    set({ isLoading: true });
    try {
      const response = await apiService.createWallet();
      if (response.data) {
        set({ wallet: response.data });
      }
    } catch (error) {
      console.error('Create wallet error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deposit: async (amount: number) => {
    set({ isLoading: true });
    try {
      await apiService.depositUSdc(amount);
      // Refresh wallet balance
      const response = await apiService.getWallet();
      if (response.data) {
        set({ wallet: response.data });
      }
    } catch (error) {
      console.error('Deposit error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  withdraw: async (amount: number, address: string) => {
    set({ isLoading: true });
    try {
      await apiService.withdrawUSdc(amount, address);
      // Refresh wallet balance
      const response = await apiService.getWallet();
      if (response.data) {
        set({ wallet: response.data });
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setWallet: (wallet) => set({ wallet }),
}));

// Preferences Store
export const usePreferencesStore = create<PreferencesStore>((set) => ({
  preferences: null,
  isLoading: false,

  fetchPreferences: async () => {
    set({ isLoading: true });
    try {
      const response = await apiService.getPreferences();
      if (response.data) {
        set({ preferences: response.data });
      }
    } catch (error) {
      console.error('Fetch preferences error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateBudgetSettings: async (settings) => {
    try {
      const response = await apiService.updateBudgetSettings(settings);
      if (response.data) {
        set((state) => ({
          ...state,
          preferences: state.preferences
            ? {
                ...state.preferences,
                budgetSettings: { ...state.preferences.budgetSettings, ...settings }
              }
            : null
        }));
      }
    } catch (error) {
      console.error('Update budget settings error:', error);
      throw error;
    }
  },

  updateAISettings: async (settings) => {
    try {
      const response = await apiService.updateAISettings(settings);
      if (response.data) {
        set((state) => ({
          preferences: state.preferences
            ? { ...state.preferences, aiSettings: { ...state.preferences.aiSettings, ...settings } }
            : null,
        }));
      }
    } catch (error) {
      console.error('Update AI settings error:', error);
      throw error;
    }
  },

  addInterest: async (interest) => {
    try {
      const response = await apiService.addInterest(interest);
      if (response.data) {
        set((state) => ({
          ...state,
          preferences: state.preferences
            ? {
                ...state.preferences,
                interests: response.data || state.preferences.interests
              }
            : null
        }));
      }
    } catch (error) {
      console.error('Add interest error:', error);
      throw error;
    }
  },

  removeInterest: async (interest) => {
    try {
      const response = await apiService.removeInterest(interest);
      if (response.data) {
        set((state) => ({
          ...state,
          preferences: state.preferences
            ? {
                ...state.preferences,
                interests: response.data || state.preferences.interests
              }
            : null
        }));
      }
    } catch (error) {
      console.error('Remove interest error:', error);
      throw error;
    }
  },
}));

// Agent Store
export const useAgentStore = create<AgentStore>((set) => ({
  status: null,
  isLoading: false,

  fetchStatus: async () => {
    set({ isLoading: true });
    try {
      const response = await apiService.getAgentStatus();
      if (response.data) {
        set({ status: response.data });
      }
    } catch (error) {
      console.error('Fetch agent status error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  start: async () => {
    set({ isLoading: true });
    try {
      await apiService.startAgent();
      const response = await apiService.getAgentStatus();
      if (response.data) {
        set({ status: response.data });
      }
    } catch (error) {
      console.error('Start agent error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  stop: async () => {
    set({ isLoading: true });
    try {
      await apiService.stopAgent();
      const response = await apiService.getAgentStatus();
      if (response.data) {
        set({ status: response.data });
      }
    } catch (error) {
      console.error('Stop agent error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Dashboard Store
export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const response = await apiService.getDashboardStats();
      if (response.data) {
        set({ stats: response.data });
      }
    } catch (error) {
      console.error('Fetch dashboard stats error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

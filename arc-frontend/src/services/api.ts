import axios, { AxiosInstance } from 'axios';
import { ApiResponse, User, Wallet, ContentFeed, PaymentHistory, UserPreferences, AgentStatus, DashboardStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );

    // Recuperar token del localStorage
    this.token = localStorage.getItem('auth_token');
  }

  // Auth endpoints
  async signIn(email: string, password: string): Promise<ApiResponse<{user: User; token: string}>> {
    const response = await this.api.post('/auth/signin', { email, password });
    if (response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }

  async signUp(email: string, password: string, name: string): Promise<ApiResponse<{user: User; token: string}>> {
    const response = await this.api.post('/auth/signup', { email, password, name });
    if (response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Wallet endpoints
  async getWallet(): Promise<ApiResponse<Wallet>> {
    return this.api.get('/wallet').then(r => r.data);
  }

  async createWallet(): Promise<ApiResponse<Wallet>> {
    return this.api.post('/wallet/create').then(r => r.data);
  }

  async depositUSdc(amount: number): Promise<ApiResponse<{txHash: string}>> {
    return this.api.post('/wallet/deposit', { amount }).then(r => r.data);
  }

  async withdrawUSdc(amount: number, address: string): Promise<ApiResponse<{txHash: string}>> {
    return this.api.post('/wallet/withdraw', { amount, address }).then(r => r.data);
  }

  // Content endpoints
  async getContentFeed(page: number = 1, pageSize: number = 10): Promise<ApiResponse<ContentFeed>> {
    return this.api.get(`/content/feed?page=${page}&pageSize=${pageSize}`).then(r => r.data);
  }

  async getContentDetails(contentId: string): Promise<ApiResponse<any>> {
    return this.api.get(`/content/${contentId}`).then(r => r.data);
  }

  // Payment endpoints
  async getPaymentHistory(page: number = 1): Promise<ApiResponse<PaymentHistory>> {
    return this.api.get(`/payments/history?page=${page}`).then(r => r.data);
  }

  async makePayment(contentId: string, amount: number): Promise<ApiResponse<{txHash: string; paymentId: string}>> {
    return this.api.post('/payments/create', { contentId, amount }).then(r => r.data);
  }

  async getSubscriptions(): Promise<ApiResponse<any[]>> {
    return this.api.get('/subscriptions').then(r => r.data);
  }

  async createSubscription(creatorId: string, amount: number, frequency: string): Promise<ApiResponse<any>> {
    return this.api.post('/subscriptions/create', { creatorId, amount, frequency }).then(r => r.data);
  }

  async cancelSubscription(subscriptionId: string): Promise<ApiResponse<void>> {
    return this.api.post(`/subscriptions/${subscriptionId}/cancel`).then(r => r.data);
  }

  // Preferences endpoints
  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.api.get('/preferences').then(r => r.data);
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    return this.api.put('/preferences', preferences).then(r => r.data);
  }

  async updateBudgetSettings(settings: any): Promise<ApiResponse<any>> {
    return this.api.put('/preferences/budget', settings).then(r => r.data);
  }

  async updateAISettings(settings: any): Promise<ApiResponse<any>> {
    return this.api.put('/preferences/ai', settings).then(r => r.data);
  }

  async addInterest(interest: string): Promise<ApiResponse<string[]>> {
    return this.api.post('/preferences/interests', { interest }).then(r => r.data);
  }

  async removeInterest(interest: string): Promise<ApiResponse<string[]>> {
    return this.api.delete(`/preferences/interests/${interest}`).then(r => r.data);
  }

  // Agent endpoints
  async getAgentStatus(): Promise<ApiResponse<AgentStatus>> {
    return this.api.get('/agent/status').then(r => r.data);
  }

  async startAgent(): Promise<ApiResponse<{success: boolean}>> {
    return this.api.post('/agent/start').then(r => r.data);
  }

  async stopAgent(): Promise<ApiResponse<{success: boolean}>> {
    return this.api.post('/agent/stop').then(r => r.data);
  }

  async getAgentActions(limit: number = 10): Promise<ApiResponse<any[]>> {
    return this.api.get(`/agent/actions?limit=${limit}`).then(r => r.data);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.api.get('/dashboard/stats').then(r => r.data);
  }

  // User profile
  async getProfile(): Promise<ApiResponse<User>> {
    return this.api.get('/profile').then(r => r.data);
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.api.put('/profile', data).then(r => r.data);
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();

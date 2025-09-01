// Enhanced Authentication Service with Real API Integration
import CryptoJS from 'crypto-js';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role?: 'ADMIN' | 'MODERATOR' | 'USER';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
}

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.howparth.com/api';

// Storage keys
const STORAGE_KEYS = {
  SESSION_TOKEN: 'howparth_session_token',
  USER_DATA: 'howparth_user_data',
  REMEMBER_ME: 'howparth_remember_me',
} as const;

// Session duration constants
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// Secure storage with AES-256 encryption
class SecureStorage {
  private static getEncryptionKey(): string {
    const key = process.env.REACT_APP_ENCRYPTION_KEY || 'howparth-default-key-change-in-production';
    if (key === 'howparth-default-key-change-in-production') {
      console.warn('Using default encryption key. Set REACT_APP_ENCRYPTION_KEY in production!');
    }
    return key;
  }

  private static encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.getEncryptionKey()).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  private static decrypt(data: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.getEncryptionKey());
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        throw new Error('Decryption failed - invalid data');
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static setItem(key: string, value: string, expiresIn?: number): void {
    const item = {
      value: this.encrypt(value),
      expires: expiresIn ? Date.now() + expiresIn : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  static getItem(key: string): string | null {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      const parsed = JSON.parse(item);
      if (parsed.expires && Date.now() > parsed.expires) {
        localStorage.removeItem(key);
        return null;
      }
      return this.decrypt(parsed.value);
    } catch {
      return null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// API Service for authentication
class APIService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for HttpOnly cookies
      ...options,
    };

    // Add auth token if available (for Authorization header)
    const token = SecureStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, defaultOptions);
      
      if (response.status === 401) {
        // Try to refresh token
        try {
          const refreshResponse = await this.refreshToken();
          if (refreshResponse.token) {
            // Update stored token
            SecureStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, refreshResponse.token);
            
            // Retry original request with new token
            defaultOptions.headers = {
              ...defaultOptions.headers,
              'Authorization': `Bearer ${refreshResponse.token}`,
            };
            
            const retryResponse = await fetch(url, defaultOptions);
            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({}));
              throw new Error(errorData.error || `HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
            }
            return await retryResponse.json();
          }
        } catch (refreshError) {
          // Refresh failed, clear auth state
          SecureStorage.clear();
          throw new Error('Session expired. Please login again.');
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }
      throw error;
    }
  }

  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Login failed');
    }

    return response.data;
  }

  static async signup(data: SignUpData): Promise<{ user: User; token: string }> {
    const response = await this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Signup failed');
    }

    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await this.makeRequest('/auth/me');
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get user data');
    }

    return response.data.user;
  }

  static async refreshToken(): Promise<{ token: string }> {
    const response = await this.makeRequest('/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Include cookies for refresh token
    });

    if (!response.success) {
      throw new Error(response.error || 'Token refresh failed');
    }

    return response.data;
  }

  static async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies for logout
      });
    } catch (error) {
      // Logout should succeed even if server call fails
      console.warn('Logout server call failed:', error);
    }
  }
}

// Enhanced Authentication Service
class AuthService {
  private static instance: AuthService;
  private authState: AuthState;
  private listeners: Set<(state: AuthState) => void>;

  private constructor() {
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      sessionToken: null,
    };
    this.listeners = new Set();
    this.initializeAuth();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeAuth(): Promise<void> {
    try {
      const token = SecureStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
      if (token) {
        // Try to get current user from API
        try {
          const user = await APIService.getCurrentUser();
          this.authState = {
            user,
            isAuthenticated: true,
            isLoading: false,
            sessionToken: token,
          };
        } catch (error) {
          // Token might be expired, try to refresh
          try {
            const { token: newToken } = await APIService.refreshToken();
            const user = await APIService.getCurrentUser();
            
            SecureStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, newToken);
            SecureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
            
            this.authState = {
              user,
              isAuthenticated: true,
              isLoading: false,
              sessionToken: newToken,
            };
          } catch (refreshError) {
            // Refresh failed, clear everything
            SecureStorage.clear();
            this.authState = {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              sessionToken: null,
            };
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionToken: null,
      };
    }

    this.notifyListeners();
  }

  async signUp(data: SignUpData): Promise<User> {
    try {
      // Validate input
      if (!data.username.trim() || !data.email.trim() || !data.password) {
        throw new Error('All fields are required');
      }

      if (data.username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }

      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Call API to create user
      const { user, token } = await APIService.signup(data);
      
      // Store session
      const expiresIn = REMEMBER_ME_DURATION; // Signup users get remember me by default
      SecureStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token, expiresIn);
      SecureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user), expiresIn);
      SecureStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true', expiresIn);

      this.authState = {
        user,
        isAuthenticated: true,
        isLoading: false,
        sessionToken: token,
      };

      this.notifyListeners();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // Call API to authenticate
      const { user, token } = await APIService.login(credentials);
      
      // Store session
      const expiresIn = credentials.rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
      SecureStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token, expiresIn);
      SecureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user), expiresIn);
      
      if (credentials.rememberMe) {
        SecureStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true', REMEMBER_ME_DURATION);
      }

      this.authState = {
        user,
        isAuthenticated: true,
        isLoading: false,
        sessionToken: token,
      };

      this.notifyListeners();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call API to logout
      await APIService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
    
    // Clear local storage
    SecureStorage.clear();
    
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionToken: null,
    };

    this.notifyListeners();
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.authState.user) {
      throw new Error('User not authenticated');
    }

    try {
      // For now, just update local state
      // In a real app, you'd call an API endpoint
      const updatedUser = { ...this.authState.user, ...updates };
      
      this.authState.user = updatedUser;
      SecureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      this.notifyListeners();
      
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async updateUsername(newUsername: string): Promise<User> {
    if (!newUsername.trim() || newUsername.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    return this.updateProfile({ username: newUsername });
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getAuthState());
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getAuthState();
    this.listeners.forEach(listener => listener(state));
  }

  isRememberMeEnabled(): boolean {
    return SecureStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

import { createHash } from 'crypto';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
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

// Secure storage keys
const STORAGE_KEYS = {
  SESSION_TOKEN: 'howparth_session_token',
  USER_DATA: 'howparth_user_data',
  REMEMBER_ME: 'howparth_remember_me',
} as const;

// Session duration constants
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// Hash password using SHA-256 (in production, use bcrypt on server)
const hashPassword = (password: string): string => {
  return createHash('sha256').update(password).digest('hex');
};

// Secure storage with encryption (simplified for demo)
class SecureStorage {
  private static encrypt(data: string): string {
    return btoa(data); // Base64 encoding (use proper encryption in production)
  }

  private static decrypt(data: string): string {
    return atob(data); // Base64 decoding
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

// Generate unique session token
const generateSessionToken = (): string => {
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Mock user database (replace with actual API calls)
class UserDatabase {
  private static users: Map<string, User> = new Map();
  private static sessions: Map<string, { userId: string; expires: number }> = new Map();

  static async createUser(data: SignUpData): Promise<User> {
    const existingUser = Array.from(this.users.values()).find(
      user => user.email === data.email || user.username === data.username
    );

    if (existingUser) {
      throw new Error(
        existingUser.email === data.email 
          ? 'Email already registered' 
          : 'Username already taken'
      );
    }

    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: data.username,
      email: data.email,
      createdAt: new Date().toISOString(),
    };

    this.users.set(user.id, user);
    return user;
  }

  static async authenticateUser(email: string, hashedPassword: string): Promise<User | null> {
    // In real app, verify password hash against stored hash
    const user = Array.from(this.users.values()).find(u => u.email === email);
    return user || null;
  }

  static async getUserById(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  static createSession(userId: string, rememberMe: boolean = false): string {
    const token = generateSessionToken();
    const expires = Date.now() + (rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION);
    
    this.sessions.set(token, { userId, expires });
    return token;
  }

  static validateSession(token: string): string | null {
    const session = this.sessions.get(token);
    if (!session || Date.now() > session.expires) {
      this.sessions.delete(token);
      return null;
    }
    return session.userId;
  }

  static removeSession(token: string): void {
    this.sessions.delete(token);
  }
}

// Main authentication service
export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    sessionToken: null,
  };

  private listeners: Set<(state: AuthState) => void> = new Set();

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private constructor() {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      const token = SecureStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
      if (token) {
        const userId = UserDatabase.validateSession(token);
        if (userId) {
          const user = await UserDatabase.getUserById(userId);
          if (user) {
            this.authState = {
              user,
              isAuthenticated: true,
              isLoading: false,
              sessionToken: token,
            };
            this.notifyListeners();
            return;
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }

    this.authState.isLoading = false;
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

      // Create user
      const user = await UserDatabase.createUser(data);
      
      // Auto-login after signup
      await this.login({ email: data.email, password: data.password });
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const hashedPassword = hashPassword(credentials.password);
      const user = await UserDatabase.authenticateUser(credentials.email, hashedPassword);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const token = UserDatabase.createSession(user.id, credentials.rememberMe);
      
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
    if (this.authState.sessionToken) {
      UserDatabase.removeSession(this.authState.sessionToken);
    }
    
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
      const updatedUser = await UserDatabase.updateUser(this.authState.user.id, updates);
      if (!updatedUser) {
        throw new Error('Failed to update profile');
      }

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

    // Check if username is already taken
    const existingUser = Array.from(UserDatabase['users'].values()).find(
      user => user.username === newUsername && user.id !== this.authState.user?.id
    );

    if (existingUser) {
      throw new Error('Username already taken');
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

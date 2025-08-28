import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthState, User, LoginCredentials, SignUpData } from '../utils/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  signUp: (data: SignUpData) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  updateUsername: (newUsername: string) => Promise<User>;
  isRememberMeEnabled: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    sessionToken: null,
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    return authService.login(credentials);
  };

  const signUp = async (data: SignUpData): Promise<User> => {
    return authService.signUp(data);
  };

  const logout = async (): Promise<void> => {
    return authService.logout();
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    return authService.updateProfile(updates);
  };

  const updateUsername = async (newUsername: string): Promise<User> => {
    return authService.updateUsername(newUsername);
  };

  const isRememberMeEnabled = (): boolean => {
    return authService.isRememberMeEnabled();
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signUp,
    logout,
    updateProfile,
    updateUsername,
    isRememberMeEnabled,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'moderator' | 'analyst';
  permissions: string[];
  lastLogin: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  loading: boolean;
  error: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

// Mock admin users for development
const MOCK_ADMINS = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin' as const,
    permissions: ['*'], // All permissions
    lastLogin: new Date().toISOString()
  },
  {
    id: '2',
    username: 'moderator',
    password: 'mod123',
    role: 'moderator' as const,
    permissions: ['content:read', 'content:write', 'users:read', 'analytics:read'],
    lastLogin: new Date().toISOString()
  },
  {
    id: '3',
    username: 'analyst',
    password: 'analyst123',
    role: 'analyst' as const,
    permissions: ['analytics:read', 'reports:read'],
    lastLogin: new Date().toISOString()
  }
];

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAdminUser(user);
      } catch (err) {
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user in mock data
      const user = MOCK_ADMINS.find(
        admin => admin.username === credentials.username && admin.password === credentials.password
      );

      if (user) {
        const { password, ...userWithoutPassword } = user;
        const adminUserData = {
          ...userWithoutPassword,
          lastLogin: new Date().toISOString()
        };

        setAdminUser(adminUserData);
        localStorage.setItem('adminUser', JSON.stringify(adminUserData));
        
        // Log admin login
        console.log(`Admin login: ${credentials.username} at ${new Date().toISOString()}`);
        
        return true;
      } else {
        setError('Invalid username or password');
        return false;
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (adminUser) {
      console.log(`Admin logout: ${adminUser.username} at ${new Date().toISOString()}`);
    }
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  };

  const hasPermission = (permission: string): boolean => {
    if (!adminUser) return false;
    if (adminUser.permissions.includes('*')) return true; // Admin has all permissions
    return adminUser.permissions.includes(permission);
  };

  const value: AdminAuthContextType = {
    adminUser,
    isAuthenticated: !!adminUser,
    login,
    logout,
    hasPermission,
    loading,
    error
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

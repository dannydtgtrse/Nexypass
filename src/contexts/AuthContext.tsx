import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  walletBalance: number;
  isApproved?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('nexypass_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check for provider credentials
    if (username === 'NexyX_user.743!Z' && password === 'P@ssw0rd!_N3xy#2025$4Lk%') {
      const providerUser: User = {
        id: 'provider_001',
        username: 'NexyX_user.743!Z',
        email: 'provider@nexypass.com',
        role: 'admin',
        walletBalance: 0,
        isApproved: true
      };
      setUser(providerUser);
      localStorage.setItem('nexypass_user', JSON.stringify(providerUser));
      return;
    }
    
    // Regular user login - starts with 0 balance and pending approval
    const mockUser: User = {
      id: 'user_' + Date.now(),
      username,
      email: username + '@email.com',
      role: 'user',
      walletBalance: 0.00,
      isApproved: false // New users need approval
    };

    setUser(mockUser);
    localStorage.setItem('nexypass_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexypass_user');
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, walletBalance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('nexypass_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext }
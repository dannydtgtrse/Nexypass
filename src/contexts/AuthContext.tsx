import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

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
  refreshUser: () => Promise<void>;
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

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const updatedUser: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        walletBalance: data.wallet_balance,
        isApproved: data.is_approved
      };

      setUser(updatedUser);
      localStorage.setItem('nexypass_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    
    try {
      // Check for provider credentials
      if (username === 'NexyX_user.743!Z' && password === 'P@ssw0rd!_N3xy#2025$4Lk%') {
        // Check if admin user exists in database
        let { data: adminUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (error && error.code === 'PGRST116') {
          // Admin user doesn't exist, create it
          const { data: newAdmin, error: createError } = await supabase
            .from('users')
            .insert({
              username,
              email: 'admin@nexypass.com',
              role: 'admin',
              wallet_balance: 0,
              is_approved: true
            })
            .select()
            .single();

          if (createError) throw createError;
          adminUser = newAdmin;
        } else if (error) {
          throw error;
        }

        const providerUser: User = {
          id: adminUser!.id,
          username: adminUser!.username,
          email: adminUser!.email,
          role: adminUser!.role,
          walletBalance: adminUser!.wallet_balance,
          isApproved: adminUser!.is_approved
        };

        setUser(providerUser);
        localStorage.setItem('nexypass_user', JSON.stringify(providerUser));
        return;
      }
      
      // Regular user login - check if user exists
      let { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            username,
            email: username + '@email.com',
            role: 'user',
            wallet_balance: 0.00,
            is_approved: false
          })
          .select()
          .single();

        if (createError) throw createError;
        existingUser = newUser;

        toast.success('Cuenta creada exitosamente. Esperando aprobación del administrador.', {
          duration: 5000,
        });
      } else if (error) {
        throw error;
      }

      const mockUser: User = {
        id: existingUser!.id,
        username: existingUser!.username,
        email: existingUser!.email,
        role: existingUser!.role,
        walletBalance: existingUser!.wallet_balance,
        isApproved: existingUser!.is_approved
      };

      setUser(mockUser);
      localStorage.setItem('nexypass_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexypass_user');
  };

  const updateBalance = async (newBalance: number) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ wallet_balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (error) throw error;

        const updatedUser = { ...user, walletBalance: newBalance };
        setUser(updatedUser);
        localStorage.setItem('nexypass_user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error updating balance:', error);
        toast.error('Error al actualizar el saldo');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateBalance, refreshUser }}>
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
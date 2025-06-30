import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, LocalStorageDB } from '../lib/supabase';
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
  isOnline: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const localDB = LocalStorageDB.getInstance();

  useEffect(() => {
    // Detectar estado de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar sesión existente
    const savedUser = localStorage.getItem('nexypass_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('nexypass_user');
      }
    }
    setLoading(false);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      if (isOnline) {
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
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Mantener datos locales si hay error de conexión
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    
    try {
      // Verificar credenciales de administrador
      if (username === 'NexyX_user.743!Z' && password === 'P@ssw0rd!_N3xy#2025$4Lk%') {
        let adminUser: User;

        if (isOnline) {
          try {
            // Verificar si el admin existe en Supabase
            let { data: existingAdmin, error } = await supabase
              .from('users')
              .select('*')
              .eq('username', username)
              .single();

            if (error && error.code === 'PGRST116') {
              // Admin no existe, crearlo
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
              existingAdmin = newAdmin;
            } else if (error) {
              throw error;
            }

            adminUser = {
              id: existingAdmin!.id,
              username: existingAdmin!.username,
              email: existingAdmin!.email,
              role: existingAdmin!.role,
              walletBalance: existingAdmin!.wallet_balance,
              isApproved: existingAdmin!.is_approved
            };
          } catch (error) {
            console.log('Creando admin localmente debido a error de conexión');
            // Crear admin local si no hay conexión
            adminUser = {
              id: localDB.generateId(),
              username,
              email: 'admin@nexypass.com',
              role: 'admin',
              walletBalance: 0,
              isApproved: true
            };
          }
        } else {
          // Modo offline - crear admin local
          adminUser = {
            id: localDB.generateId(),
            username,
            email: 'admin@nexypass.com',
            role: 'admin',
            walletBalance: 0,
            isApproved: true
          };
        }

        setUser(adminUser);
        localStorage.setItem('nexypass_user', JSON.stringify(adminUser));
        return;
      }
      
      // Login de usuario regular
      let userData: User;

      if (isOnline) {
        try {
          // Verificar si el usuario existe en Supabase
          let { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

          if (error && error.code === 'PGRST116') {
            // Usuario no existe, crearlo
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

          userData = {
            id: existingUser!.id,
            username: existingUser!.username,
            email: existingUser!.email,
            role: existingUser!.role,
            walletBalance: existingUser!.wallet_balance,
            isApproved: existingUser!.is_approved
          };
        } catch (error) {
          console.log('Creando usuario localmente debido a error de conexión');
          // Crear usuario local si no hay conexión
          userData = {
            id: localDB.generateId(),
            username,
            email: username + '@email.com',
            role: 'user',
            walletBalance: 0.00,
            isApproved: false
          };

          toast.success('Cuenta creada localmente. Se sincronizará cuando haya conexión.', {
            duration: 5000,
          });
        }
      } else {
        // Modo offline - verificar si el usuario existe localmente
        const localUsers = localDB.getUsers();
        const existingLocalUser = localUsers.find(u => u.username === username);

        if (existingLocalUser) {
          userData = {
            id: existingLocalUser.id,
            username: existingLocalUser.username,
            email: existingLocalUser.email,
            role: existingLocalUser.role,
            walletBalance: existingLocalUser.walletBalance,
            isApproved: existingLocalUser.isApproved
          };
        } else {
          // Crear nuevo usuario local
          userData = {
            id: localDB.generateId(),
            username,
            email: username + '@email.com',
            role: 'user',
            walletBalance: 0.00,
            isApproved: false
          };

          // Guardar en almacenamiento local
          localUsers.push(userData);
          localDB.saveUsers(localUsers);

          toast.success('Cuenta creada localmente. Se sincronizará cuando haya conexión.', {
            duration: 5000,
          });
        }
      }

      setUser(userData);
      localStorage.setItem('nexypass_user', JSON.stringify(userData));
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
        if (isOnline) {
          try {
            const { error } = await supabase
              .from('users')
              .update({ wallet_balance: newBalance, updated_at: new Date().toISOString() })
              .eq('id', user.id);

            if (error) throw error;
          } catch (error) {
            console.log('Actualizando saldo localmente debido a error de conexión');
          }
        }

        // Actualizar estado local
        const updatedUser = { ...user, walletBalance: newBalance };
        setUser(updatedUser);
        localStorage.setItem('nexypass_user', JSON.stringify(updatedUser));

        // Actualizar en almacenamiento local
        const localUsers = localDB.getUsers();
        const updatedUsers = localUsers.map(u => 
          u.id === user.id ? { ...u, walletBalance: newBalance } : u
        );
        localDB.saveUsers(updatedUsers);
      } catch (error) {
        console.error('Error updating balance:', error);
        toast.error('Error al actualizar el saldo');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isOnline, login, logout, updateBalance, refreshUser }}>
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
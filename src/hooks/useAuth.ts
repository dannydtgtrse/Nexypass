import { useState, useEffect } from 'react';
import { LocalStorageDB } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'vendor' | 'provider';
  balance: number;
  createdAt: string;
  isActive: boolean;
  phone?: string;
  avatar?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const localDB = LocalStorageDB.getInstance();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = () => {
    try {
      const savedUser = localStorage.getItem('nexypass_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Verificar que el usuario existe en la base de datos
        const users = localDB.getUsers();
        const existingUser = users.find(u => u.id === userData.id);
        
        if (existingUser && existingUser.isActive) {
          setUser(existingUser);
        } else {
          // Usuario no válido o inactivo
          localStorage.removeItem('nexypass_user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      localStorage.removeItem('nexypass_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('❌ Formato de email inválido');
        return false;
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        toast.error('❌ La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      const users = localDB.getUsers();
      const foundUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.isActive
      );

      if (!foundUser) {
        toast.error('❌ Usuario no encontrado o inactivo');
        return false;
      }

      // En un sistema real, aquí verificarías la contraseña hasheada
      // Por ahora, aceptamos cualquier contraseña para usuarios existentes
      
      // Actualizar último acceso
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };

      // Actualizar en la base de datos
      const updatedUsers = users.map(u => 
        u.id === foundUser.id ? updatedUser : u
      );
      localDB.saveUsers(updatedUsers);

      // Guardar sesión
      localStorage.setItem('nexypass_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success(`✅ Bienvenido, ${foundUser.name}!`);
      return true;

    } catch (error) {
      console.error('Error during login:', error);
      toast.error('❌ Error al iniciar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'user' | 'vendor' | 'provider';
    phone?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);

      // Validaciones
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        toast.error('❌ Formato de email inválido');
        return false;
      }

      if (userData.password.length < 6) {
        toast.error('❌ La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      if (userData.name.trim().length < 2) {
        toast.error('❌ El nombre debe tener al menos 2 caracteres');
        return false;
      }

      const users = localDB.getUsers();
      
      // Verificar si el email ya existe
      const existingUser = users.find(u => 
        u.email.toLowerCase() === userData.email.toLowerCase()
      );

      if (existingUser) {
        toast.error('❌ Este email ya está registrado');
        return false;
      }

      // Crear nuevo usuario
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email.toLowerCase(),
        name: userData.name.trim(),
        role: userData.role,
        balance: userData.role === 'provider' ? 10000 : 0, // Providers empiezan con saldo
        createdAt: new Date().toISOString(),
        isActive: true,
        phone: userData.phone?.trim() || undefined,
        avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150`
      };

      // Guardar en la base de datos
      const updatedUsers = [...users, newUser];
      localDB.saveUsers(updatedUsers);

      // Iniciar sesión automáticamente
      localStorage.setItem('nexypass_user', JSON.stringify(newUser));
      setUser(newUser);

      toast.success(`✅ Cuenta creada exitosamente. ¡Bienvenido, ${newUser.name}!`);
      return true;

    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('❌ Error al crear la cuenta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('nexypass_user');
      setUser(null);
      toast.success('✅ Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('❌ Error al cerrar sesión');
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updatedData };
      
      // Actualizar en la base de datos
      const users = localDB.getUsers();
      const updatedUsers = users.map(u => 
        u.id === user.id ? updatedUser : u
      );
      localDB.saveUsers(updatedUsers);

      // Actualizar sesión
      localStorage.setItem('nexypass_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('✅ Perfil actualizado');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('❌ Error al actualizar perfil');
    }
  };

  const updateBalance = (newBalance: number) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, balance: newBalance };
      
      // Actualizar en la base de datos
      const users = localDB.getUsers();
      const updatedUsers = users.map(u => 
        u.id === user.id ? updatedUser : u
      );
      localDB.saveUsers(updatedUsers);

      // Actualizar sesión
      localStorage.setItem('nexypass_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateBalance,
    checkAuthState
  };
};
import React, { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, Zap, Smartphone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: ''
  });

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Las contraseñas no coinciden');
          return;
        }
        toast.success('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
        setIsLogin(true);
        setFormData({ ...formData, password: '', confirmPassword: '' });
        return;
      }

      await login(formData.username, formData.password);
      toast.success('¡Bienvenido a NexyPass!', {
        icon: '🚀',
        duration: 4000,
      });
    } catch (error) {
      toast.error('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 rounded-2xl mb-4 shadow-glow-blue-strong">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-50 mb-2 bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 bg-clip-text text-transparent">
            NexyPass
          </h1>
          <p className="text-gray-300 font-medium">Plataforma Digital Premium</p>
          <div className="flex items-center justify-center mt-3 text-sm text-nexy-blue-400">
            <Zap className="h-4 w-4 mr-1" />
            <span className="font-semibold">Versión 13.0</span>
            <span className="mx-2">•</span>
            <Smartphone className="h-4 w-4 mr-1" />
            <span>Siempre Conectado</span>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-glow-blue p-8 animate-slide-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-50 mb-2">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-gray-400">
              {isLogin 
                ? 'Accede a tu panel de control' 
                : 'Únete a la plataforma NexyPass'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {isLogin ? 'Usuario' : 'Nombre de Usuario'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder={isLogin ? "usuario123 o NexyX_user.743!Z" : "usuario123"}
                />
              </div>
              {isLogin && (
                <p className="mt-2 text-xs text-gray-500">
                  Usa las credenciales de proveedor para acceso administrativo
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-xl text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-nexy-blue-500 hover:to-nexy-blue-700 focus:ring-2 focus:ring-nexy-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-blue transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Procesando...
                </div>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-nexy-blue-400 hover:text-nexy-blue-300 font-medium transition-colors"
            >
              {isLogin 
                ? '¿No tienes cuenta? Regístrate aquí' 
                : '¿Ya tienes cuenta? Inicia sesión'
              }
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 animate-fade-in">
          <p>© 2024 NexyPass v13.0 - Plataforma Premium</p>
          <p className="mt-1 flex items-center justify-center">
            <Zap className="h-3 w-3 mr-1" />
            Arquitectura "Siempre Conectado" • Comunicación en Tiempo Real
          </p>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { 
  Settings, 
  Phone, 
  Globe, 
  Bell, 
  Shield, 
  Save,
  MessageCircle,
  Flag,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const countries = [
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
];

export default function ProviderSettings() {
  const [settings, setSettings] = useState({
    supportCountry: '+51',
    supportPhone: '987654321',
    allowNewUsers: true,
    requireApproval: true,
    notifications: {
      newUsers: true,
      purchases: true,
      lowStock: true,
      systemUpdates: true,
    }
  });

  const handleSave = () => {
    // Simulate API call
    toast.success('Configuración guardada exitosamente', {
      icon: '✅',
      duration: 4000,
    });
  };

  const generateWhatsAppLink = () => {
    const fullNumber = settings.supportCountry + settings.supportPhone;
    return `https://wa.me/${fullNumber.replace('+', '')}`;
  };

  return (
    <div className="p-4 space-y-4 mobile-padding">
      {/* Header - Reducido */}
      <div className="animate-fade-in">
        <h1 className="text-xl font-bold text-gray-50">Configuración</h1>
        <p className="text-gray-400 text-sm">Personaliza tu plataforma NexyPass</p>
      </div>

      {/* Platform Info - Reducido */}
      <div className="bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 rounded-xl p-4 text-white shadow-glow-blue-strong animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              NexyPass v13.0
            </h2>
            <p className="text-blue-100 text-sm">
              Plataforma Digital Premium
            </p>
          </div>
          <div className="flex items-center text-blue-100">
            <Zap className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Support Configuration - Compacto */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg animate-slide-up">
        <div className="flex items-center mb-3">
          <MessageCircle className="h-5 w-5 text-nexy-blue-400 mr-2" />
          <h2 className="text-lg font-bold text-gray-50">Soporte Técnico</h2>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              WhatsApp para Soporte
            </label>
            <div className="flex space-x-2">
              <select
                value={settings.supportCountry}
                onChange={(e) => setSettings({ ...settings, supportCountry: e.target.value })}
                className="px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 text-sm focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 text-sm focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                placeholder="987654321"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Los usuarios verán un enlace de "Contactar Soporte"
            </p>
            
            {settings.supportPhone && (
              <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs text-green-400 font-semibold">Vista previa:</p>
                <a 
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-300 hover:text-green-200 underline break-all"
                >
                  {generateWhatsAppLink()}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Management - Compacto */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg animate-slide-up">
        <div className="flex items-center mb-3">
          <Shield className="h-5 w-5 text-green-400 mr-2" />
          <h2 className="text-lg font-bold text-gray-50">Gestión de Usuarios</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-50 text-sm">Permitir Nuevos Usuarios</h3>
              <p className="text-xs text-gray-400">Habilita el registro de nuevos usuarios</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowNewUsers}
                onChange={(e) => setSettings({ ...settings, allowNewUsers: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nexy-blue-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nexy-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-50 text-sm">Requiere Aprobación</h3>
              <p className="text-xs text-gray-400">Los nuevos usuarios necesitan aprobación manual</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireApproval}
                onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nexy-blue-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nexy-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications - Compacto */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg animate-slide-up">
        <div className="flex items-center mb-3">
          <Bell className="h-5 w-5 text-yellow-400 mr-2" />
          <h2 className="text-lg font-bold text-gray-50">Notificaciones</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-50 text-sm">Nuevos Usuarios</h3>
              <p className="text-xs text-gray-400">Notificar cuando se registre un nuevo usuario</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.newUsers}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  notifications: { ...settings.notifications, newUsers: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nexy-blue-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nexy-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-50 text-sm">Compras Realizadas</h3>
              <p className="text-xs text-gray-400">Notificar sobre nuevas compras realizadas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.purchases}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  notifications: { ...settings.notifications, purchases: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nexy-blue-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nexy-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-50 text-sm">Stock Bajo</h3>
              <p className="text-xs text-gray-400">Notificar cuando un producto tenga poco stock</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.lowStock}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  notifications: { ...settings.notifications, lowStock: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nexy-blue-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nexy-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-50 text-sm">Actualizaciones del Sistema</h3>
              <p className="text-xs text-gray-400">Notificar sobre actualizaciones y mantenimiento</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.systemUpdates}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  notifications: { ...settings.notifications, systemUpdates: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nexy-blue-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nexy-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button - Compacto */}
      <button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-nexy-blue-500 hover:to-nexy-blue-700 transition-all flex items-center justify-center shadow-glow-blue transform hover:scale-105 animate-slide-up"
      >
        <Save className="h-5 w-5 mr-2" />
        Guardar Configuración
      </button>
    </div>
  );
}
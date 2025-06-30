import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save,
  X,
  Shield,
  TrendingUp,
  Package,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { user } = useAuth();
  const { getUserOrders, getStats } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    joinDate: '15 de Enero, 2024'
  });

  const userOrders = getUserOrders(user?.id || '');
  const totalSpent = userOrders.reduce((sum, order) => sum + order.priceAtPurchase, 0);
  const averageSpent = userOrders.length > 0 ? totalSpent / userOrders.length : 0;

  const stats = [
    {
      name: 'Total de Compras',
      value: userOrders.length.toString(),
      icon: Package,
      color: 'text-nexy-blue-400'
    },
    {
      name: 'Dinero Gastado',
      value: `S/ ${totalSpent.toFixed(2)}`,
      icon: Wallet,
      color: 'text-green-400'
    },
    {
      name: 'Promedio por Compra',
      value: `S/ ${averageSpent.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-purple-400'
    }
  ];

  const handleSave = () => {
    // Simulate API call
    toast.success('Perfil actualizado exitosamente', {
      icon: '✅',
      duration: 3000,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      joinDate: '15 de Enero, 2024'
    });
    setIsEditing(false);
  };

  return (
    <div className="p-4 space-y-6 mobile-padding">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-50">Mi Perfil</h1>
          <p className="text-gray-400">Gestiona tu información personal</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-nexy-blue-500 hover:to-nexy-blue-700 transition-all flex items-center shadow-glow-blue transform hover:scale-105"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Editar
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-glow-blue animate-slide-up">
        {/* Header with Avatar */}
        <div className="bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profileData.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{profileData.username}</h2>
              <p className="text-blue-100">Cliente NexyPass</p>
              <div className="flex items-center mt-2">
                <Shield className="h-4 w-4 mr-1" />
                <span className="text-sm">Cuenta {user?.isApproved ? 'Verificada' : 'Pendiente'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white rounded-lg hover:from-nexy-blue-500 hover:to-nexy-blue-700 transition-all flex items-center justify-center shadow-glow-blue transform hover:scale-105"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Usuario</p>
                  <p className="font-semibold text-gray-50">{profileData.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Correo</p>
                  <p className="font-semibold text-gray-50">{profileData.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Miembro desde</p>
                  <p className="font-semibold text-gray-50">{profileData.joinDate}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 animate-slide-up">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg hover:shadow-glow-blue transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-50">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Account Status */}
      <div className={`border rounded-xl p-4 animate-slide-up ${
        user?.isApproved 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        <div className="flex items-center">
          <Shield className={`h-6 w-6 mr-3 ${user?.isApproved ? 'text-green-400' : 'text-yellow-400'}`} />
          <div>
            <h3 className={`font-semibold ${user?.isApproved ? 'text-green-400' : 'text-yellow-400'}`}>
              {user?.isApproved ? 'Cuenta Verificada' : 'Cuenta Pendiente'}
            </h3>
            <p className={`text-sm ${user?.isApproved ? 'text-green-300' : 'text-yellow-300'}`}>
              {user?.isApproved 
                ? 'Tu cuenta está completamente verificada y activa'
                : 'Tu cuenta está pendiente de aprobación por el administrador'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
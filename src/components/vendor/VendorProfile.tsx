import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit3, 
  Save,
  X,
  Shield,
  TrendingUp,
  Package,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function VendorProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+51 987 654 321',
    joinDate: '15 de Enero, 2024'
  });

  const stats = [
    {
      name: 'Total de Compras',
      value: '12',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      name: 'Dinero Gastado',
      value: 'S/ 285.00',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      name: 'Promedio por Compra',
      value: 'S/ 23.75',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  const handleSave = () => {
    // Simulate API call
    toast.success('Perfil actualizado exitosamente');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '+51 987 654 321',
      joinDate: '15 de Enero, 2024'
    });
    setIsEditing(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Editar
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header with Avatar */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profileData.name.charAt(0)}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{profileData.name}</h2>
              <p className="text-blue-100">Vendedor NexyPass</p>
              <div className="flex items-center mt-2">
                <Shield className="h-4 w-4 mr-1" />
                <span className="text-sm">Cuenta Verificada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
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
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium text-gray-900">{profileData.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Correo</p>
                  <p className="font-medium text-gray-900">{profileData.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium text-gray-900">{profileData.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Miembro desde</p>
                  <p className="font-medium text-gray-900">{profileData.joinDate}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Account Status */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h3 className="font-medium text-green-900">Cuenta Verificada</h3>
            <p className="text-sm text-green-700">
              Tu cuenta está completamente verificada y activa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
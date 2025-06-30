import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  DollarSign, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Wallet,
  Edit3,
  Trash2,
  X,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  walletBalance: number;
  totalSpent: number;
  role: 'user' | 'admin';
  joinDate: string;
  lastActivity: string;
  isActive: boolean;
  isPending: boolean;
}

const mockUsers: User[] = [
  {
    id: '1',
    username: 'usuario123',
    email: 'usuario123@email.com',
    walletBalance: 0.00,
    totalSpent: 0.00,
    role: 'user',
    joinDate: '2024-01-15',
    lastActivity: 'Nunca',
    isActive: false,
    isPending: true
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBalance, setShowAddBalance] = useState<string | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'pending'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && user.isActive && !user.isPending) ||
                         (filterType === 'pending' && user.isPending);
    
    return matchesSearch && matchesFilter;
  });

  const activeUsers = users.filter(user => user.isActive && !user.isPending);
  const pendingUsers = users.filter(user => user.isPending);
  const totalBalance = users.reduce((sum, user) => sum + user.walletBalance, 0);

  const handleApproveUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isPending: false, isActive: true }
        : user
    ));
    
    toast.success('Usuario aprobado exitosamente', {
      icon: '✅',
      duration: 3000,
    });
  };

  const handleRejectUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    
    toast.success('Usuario rechazado y eliminado', {
      icon: '🗑️',
      duration: 3000,
    });
  };

  const handleAddBalance = (userId: string) => {
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, walletBalance: user.walletBalance + amount }
        : user
    ));

    setShowAddBalance(null);
    setBalanceAmount('');
    
    toast.success(`S/ ${amount.toFixed(2)} agregados al saldo`, {
      icon: '💰',
      duration: 3000,
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success('Usuario eliminado', {
      icon: '🗑️',
      duration: 3000,
    });
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
    
    const user = users.find(u => u.id === userId);
    toast.success(`Usuario ${user?.isActive ? 'desactivado' : 'activado'}`, {
      icon: user?.isActive ? '🔒' : '🔓',
      duration: 3000,
    });
  };

  return (
    <div className="p-4 space-y-6 mobile-padding">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-50">Gestión de Usuarios</h1>
          <p className="text-gray-400">Administra tu base de usuarios y aprobaciones</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 animate-slide-up">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Usuarios Activos</p>
              <p className="text-2xl font-bold text-green-400">{activeUsers.length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-400">{pendingUsers.length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Saldos</p>
              <p className="text-2xl font-bold text-gray-50">S/ {totalBalance.toFixed(2)}</p>
            </div>
            <Wallet className="h-8 w-8 text-nexy-blue-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Todos', count: users.length },
            { key: 'active', label: 'Activos', count: activeUsers.length },
            { key: 'pending', label: 'Pendientes', count: pendingUsers.length }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterType(filter.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center ${
                filterType === filter.key
                  ? 'bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white shadow-glow-blue'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {filter.label}
              <span className="ml-2 bg-black bg-opacity-20 px-2 py-1 rounded-full text-xs">
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg animate-slide-up">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-gray-50 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Lista de Usuarios ({filteredUsers.length})
          </h2>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              No hay usuarios
            </h3>
            <p className="text-gray-500">
              Los usuarios registrados aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Saldo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-50">{user.username}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Registrado: {user.joinDate} • {user.lastActivity}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-gray-50">S/ {user.walletBalance.toFixed(2)}</p>
                        <p className="text-sm text-gray-400">Gastado: S/ {user.totalSpent.toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.isPending ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-slate-600 text-gray-300 border border-slate-500'
                        }`}>
                          {user.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activo
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactivo
                            </>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {user.isPending ? (
                          <>
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              className="p-2 text-gray-400 hover:text-green-400 hover:bg-slate-600 rounded-lg transition-colors"
                              title="Aprobar usuario"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectUser(user.id)}
                              className="p-2 text-gray-400 hover:text-nexy-rose-500 hover:bg-slate-600 rounded-lg transition-colors"
                              title="Rechazar usuario"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setShowAddBalance(user.id)}
                              className="p-2 text-gray-400 hover:text-green-400 hover:bg-slate-600 rounded-lg transition-colors"
                              title="Agregar saldo"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-slate-600 rounded-lg transition-colors"
                              title={user.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-gray-400 hover:text-nexy-rose-500 hover:bg-slate-600 rounded-lg transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Balance Modal */}
      {showAddBalance && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-glow-blue animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-50">Agregar Saldo</h3>
              <button
                onClick={() => setShowAddBalance(null)}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-400">
                Usuario: <span className="font-semibold text-gray-50">
                  {users.find(u => u.id === showAddBalance)?.username}
                </span>
              </p>
              <p className="text-gray-400">
                Saldo actual: <span className="font-semibold text-green-400">
                  S/ {users.find(u => u.id === showAddBalance)?.walletBalance.toFixed(2)}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Monto a Agregar (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddBalance(null)}
                className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAddBalance(showAddBalance)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center shadow-glow-green transform hover:scale-105"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Agregar Saldo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
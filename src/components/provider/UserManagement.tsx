import React, { useState, useEffect } from 'react';
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
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../hooks/useAuth';
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

export default function UserManagement() {
  const { getAllUsers, approveUser, rejectUser, rechargeRequests, approveRecharge, rejectRecharge } = useData();
  const { refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBalance, setShowAddBalance] = useState<string | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'pending'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

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

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId);
      await loadUsers();
      await refreshUser();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      await rejectUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const handleApproveRecharge = async (requestId: string) => {
    try {
      await approveRecharge(requestId);
      await loadUsers();
    } catch (error) {
      console.error('Error approving recharge:', error);
    }
  };

  const handleRejectRecharge = async (requestId: string) => {
    try {
      await rejectRecharge(requestId);
    } catch (error) {
      console.error('Error rejecting recharge:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6 mobile-padding">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-nexy-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 mobile-padding">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-50">Gestión de Usuarios</h1>
          <p className="text-gray-400">Administra tu base de usuarios y aprobaciones</p>
        </div>
        <button
          onClick={loadUsers}
          className="bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-nexy-blue-500 hover:to-nexy-blue-700 transition-all flex items-center shadow-glow-blue transform hover:scale-105"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </button>
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
              <p className="text-sm text-gray-400">Solicitudes</p>
              <p className="text-2xl font-bold text-nexy-blue-400">{rechargeRequests.length}</p>
            </div>
            <Wallet className="h-8 w-8 text-nexy-blue-400" />
          </div>
        </div>
      </div>

      {/* Recharge Requests */}
      {rechargeRequests.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg animate-slide-up">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-bold text-gray-50 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Solicitudes de Recarga Pendientes ({rechargeRequests.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-700">
            {rechargeRequests.map((request) => (
              <div key={request.id} className="p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-50">{request.username}</p>
                  <p className="text-sm text-gray-400">
                    S/ {request.amount.toFixed(2)} • {request.method}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.createdAt.toLocaleDateString()} {request.createdAt.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApproveRecharge(request.id)}
                    className="p-2 text-gray-400 hover:text-green-400 hover:bg-slate-600 rounded-lg transition-colors"
                    title="Aprobar recarga"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRejectRecharge(request.id)}
                    className="p-2 text-gray-400 hover:text-nexy-rose-500 hover:bg-slate-600 rounded-lg transition-colors"
                    title="Rechazar recarga"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                          <span className="text-xs text-gray-500">Usuario aprobado</span>
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
    </div>
  );
}
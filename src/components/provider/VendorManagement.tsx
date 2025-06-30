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
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  totalSales: number;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  lastActivity: string;
}

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'María García',
    email: 'maria@email.com',
    phone: '+51 987 654 321',
    balance: 150.00,
    totalSales: 2450.00,
    status: 'active',
    joinDate: '2024-01-15',
    lastActivity: 'Hace 2 horas'
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    email: 'carlos@email.com',
    phone: '+51 987 654 322',
    balance: 0.00,
    totalSales: 0.00,
    status: 'pending',
    joinDate: '2024-01-20',
    lastActivity: 'Nunca'
  },
  {
    id: '3',
    name: 'Ana López',
    email: 'ana@email.com',
    phone: '+51 987 654 323',
    balance: 75.50,
    totalSales: 1200.00,
    status: 'active',
    joinDate: '2024-01-10',
    lastActivity: 'Hace 1 día'
  }
];

const rechargeRequests = [
  {
    id: '1',
    vendorName: 'María García',
    amount: 100.00,
    method: 'Transferencia Bancaria',
    date: '2024-01-20 14:30',
    status: 'pending'
  },
  {
    id: '2',
    vendorName: 'Ana López',
    amount: 50.00,
    method: 'Yape',
    date: '2024-01-20 12:15',
    status: 'pending'
  }
];

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [requests, setRequests] = useState(rechargeRequests);
  const [activeTab, setActiveTab] = useState<'vendors' | 'requests'>('vendors');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApproveVendor = (vendorId: string) => {
    setVendors(vendors.map(vendor => 
      vendor.id === vendorId 
        ? { ...vendor, status: 'active' as const }
        : vendor
    ));
    toast.success('Vendedor aprobado exitosamente');
  };

  const handleRejectVendor = (vendorId: string) => {
    setVendors(vendors.filter(vendor => vendor.id !== vendorId));
    toast.success('Solicitud rechazada');
  };

  const handleApproveRecharge = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      // Update vendor balance
      setVendors(vendors.map(vendor => 
        vendor.name === request.vendorName
          ? { ...vendor, balance: vendor.balance + request.amount }
          : vendor
      ));
      
      // Remove request
      setRequests(requests.filter(r => r.id !== requestId));
      toast.success(`Recarga de S/ ${request.amount.toFixed(2)} aprobada`);
    }
  };

  const handleRejectRecharge = (requestId: string) => {
    setRequests(requests.filter(r => r.id !== requestId));
    toast.success('Solicitud de recarga rechazada');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'suspended':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'pending':
        return 'Pendiente';
      case 'suspended':
        return 'Suspendido';
      default:
        return status;
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Vendedores</h1>
          <p className="text-gray-600">Administra tu red de vendedores</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-blue-700">
              {vendors.filter(v => v.status === 'active').length} Activos
            </span>
          </div>
          <div className="bg-yellow-50 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-yellow-700">
              {vendors.filter(v => v.status === 'pending').length} Pendientes
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'vendors'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Vendedores ({vendors.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors relative ${
            activeTab === 'requests'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Solicitudes de Recarga ({requests.length})
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'vendors' ? (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar vendedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Vendors List */}
          <div className="space-y-3">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gray-600">{vendor.email}</p>
                      <p className="text-sm text-gray-600">{vendor.phone}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(vendor.status)}
                      <span className="text-sm font-medium text-gray-900">
                        {getStatusText(vendor.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Saldo: S/ {vendor.balance.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Ventas Totales:</span>
                    <p className="font-medium">S/ {vendor.totalSales.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Se unió:</span>
                    <p className="font-medium">{vendor.joinDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Última actividad:</span>
                    <p className="font-medium">{vendor.lastActivity}</p>
                  </div>
                </div>

                {vendor.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleApproveVendor(vendor.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleRejectVendor(vendor.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay solicitudes pendientes
              </h3>
              <p className="text-gray-600">
                Las solicitudes de recarga aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.vendorName}</h3>
                      <p className="text-sm text-gray-600">Solicita recarga de saldo</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        S/ {request.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">{request.method}</p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <p>Fecha: {request.date}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveRecharge(request.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobar Recarga
                    </button>
                    <button
                      onClick={() => handleRejectRecharge(request.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
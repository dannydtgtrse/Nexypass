import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  CreditCard, 
  Smartphone, 
  Building2,
  X,
  Send,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const rechargeOptions = [
  {
    id: 'bank',
    name: 'Transferencia Bancaria',
    icon: Building2,
    description: 'Transferencia a cuenta bancaria',
    minAmount: 20,
    maxAmount: 1000
  },
  {
    id: 'yape',
    name: 'Yape',
    icon: Smartphone,
    description: 'Pago mediante Yape',
    minAmount: 10,
    maxAmount: 500
  },
  {
    id: 'plin',
    name: 'Plin',
    icon: CreditCard,
    description: 'Pago mediante Plin',
    minAmount: 10,
    maxAmount: 500
  }
];

const recentTransactions = [
  {
    id: '1',
    type: 'recharge',
    amount: 100.00,
    description: 'Recarga por transferencia bancaria',
    date: '2024-01-20 14:30',
    status: 'completed'
  },
  {
    id: '2',
    type: 'purchase',
    amount: -25.00,
    description: 'Compra: Netflix Premium',
    date: '2024-01-20 12:15',
    status: 'completed'
  },
  {
    id: '3',
    type: 'recharge',
    amount: 50.00,
    description: 'Recarga por Yape',
    date: '2024-01-19 16:45',
    status: 'pending'
  }
];

export default function VendorWallet() {
  const { user } = useAuth();
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRechargeRequest = async () => {
    if (!selectedMethod || !amount) {
      toast.error('Selecciona un método y monto');
      return;
    }

    const numAmount = parseFloat(amount);
    const method = rechargeOptions.find(m => m.id === selectedMethod);

    if (!method) return;

    if (numAmount < method.minAmount || numAmount > method.maxAmount) {
      toast.error(`El monto debe estar entre S/ ${method.minAmount} y S/ ${method.maxAmount}`);
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Solicitud de recarga enviada exitosamente');
      setShowRechargeModal(false);
      setSelectedMethod(null);
      setAmount('');
    } catch (error) {
      toast.error('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (type === 'recharge') {
      return status === 'completed' ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <Clock className="h-5 w-5 text-yellow-500" />
      );
    }
    return <Send className="h-5 w-5 text-blue-500" />;
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Billetera</h1>
        <p className="text-gray-600">Gestiona tu saldo y recargas</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-green-100">Saldo Disponible</p>
            <p className="text-4xl font-bold">S/ {user?.balance?.toFixed(2) || '0.00'}</p>
          </div>
          <Wallet className="h-16 w-16 text-green-200" />
        </div>
        
        <button
          onClick={() => setShowRechargeModal(true)}
          className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Solicitar Recarga
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recargas del Mes</p>
              <p className="text-2xl font-bold text-gray-900">S/ 150.00</p>
            </div>
            <Plus className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gastos del Mes</p>
              <p className="text-2xl font-bold text-gray-900">S/ 75.00</p>
            </div>
            <Send className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          
          <h2 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getTransactionIcon(transaction.type, transaction.status)}
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-600">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getTransactionColor(transaction.amount)}`}>
                  {transaction.amount > 0 ? '+' : ''}S/ {Math.abs(transaction.amount).toFixed(2)}
                </p>
                <p className={`text-xs ${
                  transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Solicitar Recarga</h3>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Método de Pago
                </label>
                <div className="space-y-2">
                  {rechargeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMethod(option.id)}
                      className={`w-full p-3 border rounded-lg text-left transition-colors ${
                        selectedMethod === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <option.icon className="h-6 w-6 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{option.name}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                          <p className="text-xs text-gray-500">
                            Mín: S/ {option.minAmount} - Máx: S/ {option.maxAmount}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto a Recargar
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                {selectedMethod && (
                  <p className="mt-1 text-xs text-gray-500">
                    Monto permitido: S/ {rechargeOptions.find(m => m.id === selectedMethod)?.minAmount} - 
                    S/ {rechargeOptions.find(m => m.id === selectedMethod)?.maxAmount}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Tu solicitud será revisada por el proveedor. 
                  Recibirás una notificación cuando sea aprobada.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRechargeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechargeRequest}
                disabled={loading || !selectedMethod || !amount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
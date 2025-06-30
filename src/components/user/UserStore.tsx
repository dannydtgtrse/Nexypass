import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Star, 
  Package,
  Search,
  Filter,
  X,
  Wallet,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../contexts/DataContext';
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

export default function UserStore() {
  const { user, updateBalance, refreshUser } = useAuth();
  const { products, purchaseProduct, getAvailableStock, requestRecharge, loadData } = useData();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    countryCode: '+51',
    phone: ''
  });
  const [rechargeData, setRechargeData] = useState({
    amount: '',
    method: 'bank'
  });

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  const handleBuyProduct = (product: any) => {
    const availableStock = getAvailableStock(product.id);
    
    if (availableStock <= 0) {
      toast.error('Producto sin stock', {
        icon: '📦',
        duration: 3000,
      });
      return;
    }

    if (!user?.walletBalance || user.walletBalance < product.price) {
      setSelectedProduct(product);
      setShowInsufficientFunds(true);
      return;
    }

    setSelectedProduct(product);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedProduct || !customerData.name || !customerData.phone) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      // Update user balance
      const newBalance = (user?.walletBalance || 0) - selectedProduct.price;
      await updateBalance(newBalance);

      // Create order
      const order = await purchaseProduct(selectedProduct.id, customerData);

      // Generate WhatsApp message
      const credentials = parseCredentials(order.credentialsDelivered);
      const message = `✨🎉 ¡Tu Producto NexyPass ha Llegado! 🎉✨

Hola *${customerData.name}*, aquí están los detalles de tu cuenta:

📦 **Producto:** *${selectedProduct.name}*
💻 **Dispositivos:** *4 pantallas*
⏰ **Duración:** *30 Días*

🔑 **Tus Credenciales de Acceso:**
> **Usuario/Correo:** \`${credentials.email}\`
> **Contraseña:** \`${credentials.password}\`
> **Perfil:** \`${credentials.profile}\`
> **PIN:** \`${credentials.pin}\`

🗓️ *Tu acceso es válido hasta el: ${order.expiresAt.toLocaleDateString()}*

¡Disfruta tu servicio! 🎬🎵

---
*Powered by NexyPass v13.0*`;

      const whatsappUrl = `https://wa.me/${customerData.countryCode.replace('+', '')}${customerData.phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      setShowPurchaseModal(false);
      setSelectedProduct(null);
      setCustomerData({ name: '', countryCode: '+51', phone: '' });
      
      toast.success(`¡Compra realizada! S/ ${selectedProduct.price.toFixed(2)} debitados`, {
        icon: '🎉',
        duration: 5000,
      });

      // Refresh user data
      await refreshUser();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Error al procesar la compra');
    }
  };

  const handleRequestRecharge = async () => {
    const amount = parseFloat(rechargeData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    try {
      await requestRecharge(amount, rechargeData.method);
      setShowRechargeModal(false);
      setRechargeData({ amount: '', method: 'bank' });
    } catch (error) {
      console.error('Recharge request error:', error);
    }
  };

  const parseCredentials = (credentialsString: string) => {
    const parts = credentialsString.split(':');
    return {
      email: parts[0] || '',
      password: parts[1] || '',
      profile: parts[2] || '',
      pin: parts[3] || ''
    };
  };

  const goToWallet = () => {
    setShowInsufficientFunds(false);
    setShowRechargeModal(true);
  };

  return (
    <div className="p-4 space-y-6 mobile-padding">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-50">Tienda NexyPass</h1>
          <p className="text-gray-400">Productos digitales premium</p>
        </div>
        <button
          onClick={loadData}
          className="bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-nexy-blue-500 hover:to-nexy-blue-700 transition-all flex items-center shadow-glow-blue transform hover:scale-105"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 rounded-2xl p-6 text-white shadow-glow-blue animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100">Tu Saldo Disponible</p>
            <p className="text-3xl font-bold">S/ {user?.walletBalance?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRechargeModal(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Recargar
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'Todos' ? '' : category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  (category === 'Todos' && !selectedCategory) || selectedCategory === category
                    ? 'bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white shadow-glow-blue'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="space-y-4 animate-slide-up">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-500">
              Los productos aparecerán aquí una vez que el proveedor los agregue
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const availableStock = getAvailableStock(product.id);
            
            return (
              <div key={product.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg hover:shadow-glow-blue transition-all transform hover:-translate-y-1">
                <div className="flex">
                  <img
                    src={product.imageURL}
                    alt={product.name}
                    className="w-24 h-24 object-cover"
                  />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-50">{product.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{product.category}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            4.8
                          </span>
                          <span className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            {availableStock > 0 ? `${availableStock} disponibles` : 'Sin stock'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-gray-50">
                          S/ {product.price.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleBuyProduct(product)}
                          disabled={availableStock === 0}
                          className={`mt-2 px-4 py-2 rounded-lg font-semibold transition-all flex items-center ${
                            availableStock === 0
                              ? 'bg-slate-700 text-gray-500 cursor-not-allowed border border-slate-600'
                              : user?.walletBalance && user.walletBalance >= product.price
                              ? 'bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white hover:from-nexy-blue-500 hover:to-nexy-blue-700 shadow-glow-blue transform hover:scale-105'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-glow-red'
                          }`}
                        >
                          {availableStock === 0 ? (
                            <>
                              <Package className="h-4 w-4 mr-2" />
                              Sin Stock
                            </>
                          ) : user?.walletBalance && user.walletBalance >= product.price ? (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Comprar
                            </>
                          ) : (
                            <>
                              <Wallet className="h-4 w-4 mr-2" />
                              Recargar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-glow-blue animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-50">Confirmar Compra</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                <img
                  src={selectedProduct.imageURL}
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-50">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-400">S/ {selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="Nombre completo del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Teléfono del Cliente *
                </label>
                <div className="flex space-x-2">
                  <select
                    value={customerData.countryCode}
                    onChange={(e) => setCustomerData({ ...customerData, countryCode: e.target.value })}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                    placeholder="987654321"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Se enviará un mensaje de WhatsApp con las credenciales
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Precio del producto:</span>
                <span className="font-semibold text-gray-50">S/ {selectedProduct.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-400">Tu saldo actual:</span>
                <span className="font-semibold text-gray-50">S/ {user?.walletBalance?.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-600 mt-2 pt-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-gray-300">Saldo después de la compra:</span>
                  <span className="text-nexy-blue-400">
                    S/ {((user?.walletBalance || 0) - selectedProduct.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white rounded-lg hover:from-nexy-blue-500 hover:to-nexy-blue-700 transition-all flex items-center justify-center shadow-glow-blue transform hover:scale-105"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Funds Modal */}
      {showInsufficientFunds && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-nexy-rose-500 rounded-2xl p-6 w-full max-w-md shadow-glow-red animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-nexy-rose-500 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Saldo Insuficiente
              </h3>
              <button
                onClick={() => setShowInsufficientFunds(false)}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                <img
                  src={selectedProduct.imageURL}
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-50">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-400">S/ {selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-nexy-rose-500/10 border border-nexy-rose-500/30 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-center">
                Necesitas <span className="font-bold text-nexy-rose-500">
                  S/ {(selectedProduct.price - (user?.walletBalance || 0)).toFixed(2)}
                </span> más para comprar este producto.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={goToWallet}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center font-semibold shadow-glow-green transform hover:scale-105"
              >
                <Wallet className="h-5 w-5 mr-2" />
                Solicitar Recarga de Saldo
              </button>
              
              <button
                onClick={() => setShowInsufficientFunds(false)}
                className="w-full px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-glow-blue animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-50">Solicitar Recarga</h3>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Monto a Recargar (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={rechargeData.amount}
                  onChange={(e) => setRechargeData({ ...rechargeData, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Método de Pago
                </label>
                <select
                  value={rechargeData.method}
                  onChange={(e) => setRechargeData({ ...rechargeData, method: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                >
                  <option value="bank">Transferencia Bancaria</option>
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                </select>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-sm text-yellow-300">
                  <strong>Importante:</strong> Tu solicitud será revisada por el administrador. 
                  Recibirás una notificación cuando sea aprobada.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRechargeModal(false)}
                className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRequestRecharge}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center shadow-glow-green transform hover:scale-105"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Solicitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
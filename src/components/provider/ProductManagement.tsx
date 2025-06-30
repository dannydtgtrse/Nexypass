import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Package,
  DollarSign,
  Image as ImageIcon,
  Save,
  X,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';

export default function ProductManagement() {
  const { products, addProduct, deleteProduct, addStockToProduct, getAvailableStock } = useData();
  const { sendMessage } = useSocket();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddStock, setShowAddStock] = useState<string | null>(null);
  const [visibleCredentials, setVisibleCredentials] = useState<Set<string>>(new Set());

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    imageURL: '',
    category: '',
  });

  const [newStock, setNewStock] = useState({
    email: '',
    password: '',
    profile: '',
    pin: '',
  });

  const parseCredentials = (credentialsString: string) => {
    const parts = credentialsString.split(':');
    return {
      email: parts[0] || '',
      password: parts[1] || '',
      profile: parts[2] || '',
      pin: parts[3] || ''
    };
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    const productData = {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      imageURL: newProduct.imageURL || 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: newProduct.category,
      stock: [],
      isActive: true
    };

    addProduct(productData);
    setNewProduct({ name: '', price: '', imageURL: '', category: '' });
    setShowAddProduct(false);
    
    sendMessage('product_created', { productName: productData.name });
    
    toast.success('Producto creado exitosamente', {
      icon: '🎉',
      duration: 4000,
    });
  };

  const handleAddStock = (productId: string) => {
    if (!newStock.email || !newStock.password) {
      toast.error('Correo y contraseña son obligatorios');
      return;
    }

    const credentials = `${newStock.email}:${newStock.password}:${newStock.profile}:${newStock.pin}`;
    addStockToProduct(productId, credentials);

    setNewStock({ email: '', password: '', profile: '', pin: '' });
    setShowAddStock(null);
    
    sendMessage('stock_updated', { productId, stockAdded: 1 });
    
    toast.success('Credencial agregada al inventario', {
      icon: '📦',
      duration: 3000,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
    sendMessage('product_deleted', { productId });
    
    toast.success('Producto eliminado', {
      icon: '🗑️',
      duration: 3000,
    });
  };

  const toggleCredentialVisibility = (stockId: string) => {
    const newVisible = new Set(visibleCredentials);
    if (newVisible.has(stockId)) {
      newVisible.delete(stockId);
    } else {
      newVisible.add(stockId);
    }
    setVisibleCredentials(newVisible);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`, {
      icon: '📋',
      duration: 2000,
    });
  };

  return (
    <div className="p-4 space-y-6 mobile-padding">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-50">Gestión de Productos</h1>
          <p className="text-gray-400">Administra tu catálogo y inventario</p>
        </div>
        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-nexy-blue-500 hover:to-nexy-blue-700 transition-all flex items-center shadow-glow-blue transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Producto
        </button>
      </div>

      {/* Products List */}
      <div className="space-y-4 animate-slide-up">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              No hay productos
            </h3>
            <p className="text-gray-500">
              Crea tu primer producto para comenzar a vender
            </p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg hover:shadow-glow-blue transition-all">
              {/* Product Header */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center space-x-4">
                  <img
                    src={product.imageURL}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-50">{product.name}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        S/ {product.price.toFixed(2)}
                      </span>
                      <span className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        {getAvailableStock(product.id)} disponibles
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-gray-400 hover:text-nexy-rose-500 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock Inventory */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-50">Inventario de Credenciales</h4>
                  <button
                    onClick={() => setShowAddStock(product.id)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center shadow-glow-green transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Credencial
                  </button>
                </div>

                {product.stock.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                    <p>No hay credenciales en el inventario</p>
                    <p className="text-sm">Agrega credenciales para comenzar a vender</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {product.stock.map((stockItem) => {
                      const credentials = parseCredentials(stockItem.credentials);
                      const isVisible = visibleCredentials.has(stockItem.id);
                      
                      return (
                        <div
                          key={stockItem.id}
                          className={`p-3 rounded-lg border transition-all ${
                            stockItem.isSold 
                              ? 'bg-slate-700 border-slate-600 opacity-75' 
                              : 'bg-slate-700 border-green-500/30 shadow-glow-green'
                          }`}
                        >
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-gray-300">Email:</span>
                              <div className="flex items-center space-x-2 mt-1">
                                <p className="text-gray-50 font-mono bg-slate-800 px-2 py-1 rounded">
                                  {credentials.email}
                                </p>
                                <button
                                  onClick={() => copyToClipboard(credentials.email, 'Email')}
                                  className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-300">Contraseña:</span>
                              <div className="flex items-center space-x-2 mt-1">
                                <p className="text-gray-50 font-mono bg-slate-800 px-2 py-1 rounded">
                                  {isVisible ? credentials.password : '••••••••'}
                                </p>
                                <button
                                  onClick={() => toggleCredentialVisibility(stockItem.id)}
                                  className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                                >
                                  {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(credentials.password, 'Contraseña')}
                                  className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            {credentials.profile && (
                              <div>
                                <span className="font-semibold text-gray-300">Perfil:</span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <p className="text-gray-50 font-mono bg-slate-800 px-2 py-1 rounded">
                                    {credentials.profile}
                                  </p>
                                  <button
                                    onClick={() => copyToClipboard(credentials.profile, 'Perfil')}
                                    className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                            {credentials.pin && (
                              <div>
                                <span className="font-semibold text-gray-300">PIN:</span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <p className="text-gray-50 font-mono bg-slate-800 px-2 py-1 rounded">
                                    {isVisible ? credentials.pin : '••••'}
                                  </p>
                                  <button
                                    onClick={() => copyToClipboard(credentials.pin, 'PIN')}
                                    className="p-1 text-gray-400 hover:text-nexy-blue-400 transition-colors"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              stockItem.isSold
                                ? 'bg-slate-600 text-gray-300'
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              {stockItem.isSold ? 'Vendido' : 'Disponible'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-glow-blue animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-50">Nuevo Producto</h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="Ej: Netflix Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Precio (S/) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="25.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  value={newProduct.imageURL}
                  onChange={(e) => setNewProduct({ ...newProduct, imageURL: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Categoría
                </label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="Streaming, Música, etc."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddProduct(false)}
                className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProduct}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white rounded-lg hover:from-nexy-blue-500 hover:to-nexy-blue-700 transition-all flex items-center justify-center shadow-glow-blue transform hover:scale-105"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-glow-blue animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-50">Agregar Credencial al Inventario</h3>
              <button
                onClick={() => setShowAddStock(null)}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Correo Electrónico / Usuario *
                </label>
                <input
                  type="email"
                  value={newStock.email}
                  onChange={(e) => setNewStock({ ...newStock, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="usuario@servicio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Contraseña de la Cuenta *
                </label>
                <input
                  type="text"
                  value={newStock.password}
                  onChange={(e) => setNewStock({ ...newStock, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="contraseña123"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  Número de Perfil (opcional)
                </label>
                <input
                  type="text"
                  value={newStock.profile}
                  onChange={(e) => setNewStock({ ...newStock, profile: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="1, 2, 3..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">
                  PIN del Perfil (opcional)
                </label>
                <input
                  type="text"
                  value={newStock.pin}
                  onChange={(e) => setNewStock({ ...newStock, pin: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-nexy-blue-400 focus:border-transparent transition-all"
                  placeholder="1234"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddStock(null)}
                className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAddStock(showAddStock)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center shadow-glow-green transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
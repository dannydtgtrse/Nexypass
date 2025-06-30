import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Star, 
  Clock, 
  Package,
  Search,
  Filter,
  X,
  Phone,
  Globe,
  Flag
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  duration: number;
  rating: number;
  stock: number;
  description: string;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Netflix Premium',
    price: 25.00,
    imageUrl: 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Streaming',
    duration: 30,
    rating: 4.8,
    stock: 15,
    description: 'Acceso completo a Netflix Premium con 4 pantallas simultáneas y calidad 4K'
  },
  {
    id: '2',
    name: 'Spotify Premium',
    price: 15.00,
    imageUrl: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Música',
    duration: 30,
    rating: 4.9,
    stock: 8,
    description: 'Música sin anuncios, descargas offline y calidad superior'
  },
  {
    id: '3',
    name: 'Disney+ Premium',
    price: 20.00,
    imageUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Streaming',
    duration: 30,
    rating: 4.7,
    stock: 12,
    description: 'Todo el contenido de Disney, Marvel, Star Wars y National Geographic'
  }
];

const countries = [
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
];

export default function VendorStore() {
  const { user, updateBalance } = useAuth();
  const [products] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    countryCode: '+51',
    phone: ''
  });

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBuyProduct = (product: Product) => {
    if (!user?.balance || user.balance < product.price) {
      toast.error('Saldo insuficiente', {
        icon: '⚠️',
        action: {
          label: 'Recargar',
          onClick: () => {
            // Navigate to wallet
            window.location.href = '/wallet';
          }
        }
      });
      return;
    }

    setSelectedProduct(product);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (!selectedProduct || !customerData.name || !customerData.phone) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    // Simulate purchase
    const newBalance = (user?.balance || 0) - selectedProduct.price;
    updateBalance(newBalance);

    // Generate WhatsApp message
    const credentials = {
      username: 'demo@netflix.com',
      password: 'demo123',
      profile: '1',
      pin: '1234'
    };

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedProduct.duration);

    const message = `✨🎉 ¡Tu Producto NexyPass ha Llegado! 🎉✨

Hola *${customerData.name}*, aquí están los detalles de tu cuenta:

📦 **Producto:** *${selectedProduct.name}*
💻 **Dispositivos:** *4 pantallas*
⏰ **Duración:** *${selectedProduct.duration} Días*

🔑 **Tus Credenciales de Acceso:**
> **Usuario/Correo:** \`${credentials.username}\`
> **Contraseña:** \`${credentials.password}\`
> **Perfil:** \`${credentials.profile}\`
> **PIN:** \`${credentials.pin}\`

🗓️ *Tu acceso es válido hasta el: ${endDate.toLocaleDateString()}*

¡Disfruta tu servicio! 🎬🎵`;

    const whatsappUrl = `https://wa.me/${customerData.countryCode.replace('+', '')}${customerData.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setShowPurchaseModal(false);
    setSelectedProduct(null);
    setCustomerData({ name: '', countryCode: '+51', phone: '' });
    
    toast.success(`¡Compra realizada! S/ ${selectedProduct.price.toFixed(2)} debitados`);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tienda NexyPass</h1>
        <p className="text-gray-600">Productos digitales premium para tus clientes</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100">Tu Saldo Disponible</p>
            <p className="text-3xl font-bold">S/ {user?.balance?.toFixed(2) || '0.00'}</p>
          </div>
          <Package className="h-12 w-12 text-blue-200" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category === 'Todos' ? '' : category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                (category === 'Todos' && !selectedCategory) || selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-24 h-24 object-cover"
              />
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {product.rating}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {product.duration} días
                      </span>
                      <span className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        {product.stock} disponibles
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      S/ {product.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleBuyProduct(product)}
                      disabled={product.stock === 0}
                      className={`mt-2 px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                        product.stock === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stock === 0 ? 'Agotado' : 'Comprar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Compra</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-600">S/ {selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre completo del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono del Cliente *
                </label>
                <div className="flex space-x-2">
                  <select
                    value={customerData.countryCode}
                    onChange={(e) => setCustomerData({ ...customerData, countryCode: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="987654321"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Se enviará un mensaje de WhatsApp con las credenciales
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Precio del producto:</span>
                <span className="font-medium">S/ {selectedProduct.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Tu saldo actual:</span>
                <span className="font-medium">S/ {user?.balance?.toFixed(2)}</span>
              </div>
              <div className="border-t border-blue-200 mt-2 pt-2">
                <div className="flex items-center justify-between font-semibold">
                  <span>Saldo después de la compra:</span>
                  <span className="text-blue-600">
                    S/ {((user?.balance || 0) - selectedProduct.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
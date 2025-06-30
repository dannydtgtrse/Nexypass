import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  imageURL: string;
  category: string;
  stock: StockItem[];
  isActive: boolean;
  createdAt: Date;
}

interface StockItem {
  id: string;
  credentials: string;
  isSold: boolean;
  soldTo?: string;
  orderId?: string;
  soldAt?: Date;
}

interface Order {
  id: string;
  code: string;
  productName: string;
  priceAtPurchase: number;
  credentialsDelivered: string;
  purchaseURL: string;
  profileInfo: string;
  supplier: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired';
  customerName: string;
  customerPhone: string;
  userId: string;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'balance_add' | 'system';
  amount: number;
  description: string;
  userId: string;
  productId?: string;
  createdAt: Date;
  status: 'completed' | 'pending';
}

interface DataContextType {
  products: Product[];
  orders: Order[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addStockToProduct: (productId: string, credentials: string) => void;
  purchaseProduct: (productId: string, customerData: any) => Promise<Order>;
  addUserBalance: (userId: string, amount: number) => void;
  getAvailableStock: (productId: string) => number;
  getUserOrders: (userId: string) => Order[];
  getStats: () => any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Initialize with empty data
  useEffect(() => {
    // Load from localStorage if exists
    const savedProducts = localStorage.getItem('nexypass_products');
    const savedOrders = localStorage.getItem('nexypass_orders');
    const savedTransactions = localStorage.getItem('nexypass_transactions');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('nexypass_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nexypass_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('nexypass_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
    
    // Add transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'system',
      amount: 0,
      description: `Producto creado: ${newProduct.name}`,
      userId: user?.id || 'system',
      productId: newProduct.id,
      createdAt: new Date(),
      status: 'completed'
    };
    setTransactions(prev => [...prev, transaction]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...updates } : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    
    // Add transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'system',
      amount: 0,
      description: `Producto eliminado`,
      userId: user?.id || 'system',
      productId: id,
      createdAt: new Date(),
      status: 'completed'
    };
    setTransactions(prev => [...prev, transaction]);
  };

  const addStockToProduct = (productId: string, credentials: string) => {
    const stockItem: StockItem = {
      id: Date.now().toString(),
      credentials,
      isSold: false
    };

    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, stock: [...product.stock, stockItem] }
        : product
    ));
  };

  const purchaseProduct = async (productId: string, customerData: any): Promise<Order> => {
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error('Producto no encontrado');

    const availableStock = product.stock.find(item => !item.isSold);
    if (!availableStock) throw new Error('Sin stock disponible');

    // Mark stock as sold
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? {
            ...p,
            stock: p.stock.map(item => 
              item.id === availableStock.id 
                ? { ...item, isSold: true, soldTo: user?.id, soldAt: new Date() }
                : item
            )
          }
        : p
    ));

    // Create order
    const order: Order = {
      id: Date.now().toString(),
      code: `ITC${Date.now().toString().slice(-7)}`,
      productName: product.name,
      priceAtPurchase: product.price,
      credentialsDelivered: availableStock.credentials,
      purchaseURL: getProductURL(product.name),
      profileInfo: parseCredentials(availableStock.credentials).profile || '1',
      supplier: 'NexyPass',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'active',
      customerName: customerData.name,
      customerPhone: customerData.phone,
      userId: user?.id || ''
    };

    setOrders(prev => [...prev, order]);

    // Add transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'purchase',
      amount: -product.price,
      description: `Compra: ${product.name}`,
      userId: user?.id || '',
      productId: product.id,
      createdAt: new Date(),
      status: 'completed'
    };
    setTransactions(prev => [...prev, transaction]);

    return order;
  };

  const addUserBalance = (userId: string, amount: number) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'balance_add',
      amount: amount,
      description: `Recarga de saldo`,
      userId: userId,
      createdAt: new Date(),
      status: 'completed'
    };
    setTransactions(prev => [...prev, transaction]);
  };

  const getAvailableStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.stock.filter(item => !item.isSold).length : 0;
  };

  const getUserOrders = (userId: string) => {
    return orders.filter(order => order.userId === userId);
  };

  const getStats = () => {
    const totalSales = transactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => o.status === 'active').length;
    const totalProducts = products.length;

    return {
      totalSales,
      totalOrders,
      activeOrders,
      totalProducts,
      transactions: transactions.length
    };
  };

  // Helper functions
  const parseCredentials = (credentialsString: string) => {
    const parts = credentialsString.split(':');
    return {
      email: parts[0] || '',
      password: parts[1] || '',
      profile: parts[2] || '',
      pin: parts[3] || ''
    };
  };

  const getProductURL = (productName: string) => {
    const urls: { [key: string]: string } = {
      'Netflix': 'https://netflix.com',
      'Spotify': 'https://spotify.com',
      'Disney+': 'https://disneyplus.com',
      'Amazon Prime': 'https://primevideo.com',
      'YouTube Premium': 'https://youtube.com/premium'
    };
    
    for (const [key, url] of Object.entries(urls)) {
      if (productName.toLowerCase().includes(key.toLowerCase())) {
        return url;
      }
    }
    return 'https://example.com';
  };

  return (
    <DataContext.Provider value={{
      products,
      orders,
      transactions,
      addProduct,
      updateProduct,
      deleteProduct,
      addStockToProduct,
      purchaseProduct,
      addUserBalance,
      getAvailableStock,
      getUserOrders,
      getStats
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
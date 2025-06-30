import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
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

interface RechargeRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  processedAt?: Date;
}

interface DataContextType {
  products: Product[];
  orders: Order[];
  transactions: Transaction[];
  rechargeRequests: RechargeRequest[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'stock'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addStockToProduct: (productId: string, credentials: string) => Promise<void>;
  purchaseProduct: (productId: string, customerData: any) => Promise<Order>;
  addUserBalance: (userId: string, amount: number) => Promise<void>;
  getAvailableStock: (productId: string) => number;
  getUserOrders: (userId: string) => Order[];
  getStats: () => any;
  loadData: () => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  getAllUsers: () => Promise<any[]>;
  requestRecharge: (amount: number, method: string) => Promise<void>;
  approveRecharge: (requestId: string) => Promise<void>;
  rejectRecharge: (requestId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Set up real-time subscriptions
    const productsSubscription = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadProducts();
      })
      .subscribe();

    const ordersSubscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadOrders();
      })
      .subscribe();

    const rechargeSubscription = supabase
      .channel('recharge_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recharge_requests' }, () => {
        loadRechargeRequests();
      })
      .subscribe();

    return () => {
      productsSubscription.unsubscribe();
      ordersSubscription.unsubscribe();
      rechargeSubscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadOrders(),
        loadTransactions(),
        loadRechargeRequests()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      const { data: stockData, error: stockError } = await supabase
        .from('stock_items')
        .select('*');

      if (stockError) throw stockError;

      const productsWithStock = productsData.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        imageURL: product.image_url,
        category: product.category || '',
        isActive: product.is_active,
        createdAt: new Date(product.created_at),
        stock: stockData
          .filter(stock => stock.product_id === product.id)
          .map(stock => ({
            id: stock.id,
            credentials: stock.credentials,
            isSold: stock.is_sold,
            soldTo: stock.sold_to || undefined,
            orderId: stock.order_id || undefined,
            soldAt: stock.sold_at ? new Date(stock.sold_at) : undefined
          }))
      }));

      setProducts(productsWithStock);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersData = data.map(order => ({
        id: order.id,
        code: order.code,
        productName: order.product_name,
        priceAtPurchase: order.price_at_purchase,
        credentialsDelivered: order.credentials_delivered,
        purchaseURL: order.purchase_url,
        profileInfo: order.profile_info,
        supplier: order.supplier,
        createdAt: new Date(order.created_at),
        expiresAt: new Date(order.expires_at),
        status: order.status,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        userId: order.user_id
      }));

      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transactionsData = data.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        userId: transaction.user_id,
        productId: transaction.product_id || undefined,
        createdAt: new Date(transaction.created_at),
        status: transaction.status
      }));

      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadRechargeRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('recharge_requests')
        .select(`
          *,
          users (username)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const requestsData = data.map(request => ({
        id: request.id,
        userId: request.user_id,
        username: (request.users as any)?.username || 'Usuario',
        amount: request.amount,
        method: request.method,
        status: request.status,
        createdAt: new Date(request.created_at),
        processedAt: request.processed_at ? new Date(request.processed_at) : undefined
      }));

      setRechargeRequests(requestsData);
    } catch (error) {
      console.error('Error loading recharge requests:', error);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'stock'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          price: productData.price,
          image_url: productData.imageURL,
          category: productData.category,
          is_active: productData.isActive
        })
        .select()
        .single();

      if (error) throw error;

      // Add transaction
      await supabase
        .from('transactions')
        .insert({
          type: 'system',
          amount: 0,
          description: `Producto creado: ${productData.name}`,
          user_id: user?.id || 'system',
          product_id: data.id,
          status: 'completed'
        });

      toast.success('Producto creado exitosamente');
      await loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error al crear el producto');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          price: updates.price,
          image_url: updates.imageURL,
          category: updates.category,
          is_active: updates.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Delete stock items first
      await supabase
        .from('stock_items')
        .delete()
        .eq('product_id', id);

      // Delete product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Add transaction
      await supabase
        .from('transactions')
        .insert({
          type: 'system',
          amount: 0,
          description: 'Producto eliminado',
          user_id: user?.id || 'system',
          product_id: id,
          status: 'completed'
        });

      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  const addStockToProduct = async (productId: string, credentials: string) => {
    try {
      const { error } = await supabase
        .from('stock_items')
        .insert({
          product_id: productId,
          credentials,
          is_sold: false
        });

      if (error) throw error;

      await loadProducts();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Error al agregar stock');
    }
  };

  const purchaseProduct = async (productId: string, customerData: any): Promise<Order> => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error('Producto no encontrado');

      const availableStock = product.stock.find(item => !item.isSold);
      if (!availableStock) throw new Error('Sin stock disponible');

      // Mark stock as sold
      await supabase
        .from('stock_items')
        .update({
          is_sold: true,
          sold_to: user?.id,
          sold_at: new Date().toISOString()
        })
        .eq('id', availableStock.id);

      // Create order
      const orderData = {
        code: `ITC${Date.now().toString().slice(-7)}`,
        product_name: product.name,
        price_at_purchase: product.price,
        credentials_delivered: availableStock.credentials,
        purchase_url: getProductURL(product.name),
        profile_info: parseCredentials(availableStock.credentials).profile || '1',
        supplier: 'NexyPass',
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        user_id: user?.id || '',
        product_id: product.id,
        status: 'active' as const,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Add transaction
      await supabase
        .from('transactions')
        .insert({
          type: 'purchase',
          amount: -product.price,
          description: `Compra: ${product.name}`,
          user_id: user?.id || '',
          product_id: product.id,
          status: 'completed'
        });

      await loadOrders();
      await loadProducts();

      return {
        id: order.id,
        code: order.code,
        productName: order.product_name,
        priceAtPurchase: order.price_at_purchase,
        credentialsDelivered: order.credentials_delivered,
        purchaseURL: order.purchase_url,
        profileInfo: order.profile_info,
        supplier: order.supplier,
        createdAt: new Date(order.created_at),
        expiresAt: new Date(order.expires_at),
        status: order.status,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        userId: order.user_id
      };
    } catch (error) {
      console.error('Error purchasing product:', error);
      throw error;
    }
  };

  const addUserBalance = async (userId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          type: 'balance_add',
          amount: amount,
          description: 'Recarga de saldo',
          user_id: userId,
          status: 'completed'
        });

      if (error) throw error;

      await loadTransactions();
    } catch (error) {
      console.error('Error adding balance:', error);
      toast.error('Error al agregar saldo');
    }
  };

  const requestRecharge = async (amount: number, method: string) => {
    try {
      const { error } = await supabase
        .from('recharge_requests')
        .insert({
          user_id: user?.id || '',
          amount,
          method,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Solicitud de recarga enviada exitosamente');
      await loadRechargeRequests();
    } catch (error) {
      console.error('Error requesting recharge:', error);
      toast.error('Error al solicitar recarga');
    }
  };

  const approveRecharge = async (requestId: string) => {
    try {
      const request = rechargeRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Solicitud no encontrada');

      // Update request status
      await supabase
        .from('recharge_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      // Update user balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', request.userId)
        .single();

      if (userError) throw userError;

      await supabase
        .from('users')
        .update({
          wallet_balance: userData.wallet_balance + request.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.userId);

      // Add transaction
      await supabase
        .from('transactions')
        .insert({
          type: 'balance_add',
          amount: request.amount,
          description: `Recarga aprobada: ${request.method}`,
          user_id: request.userId,
          status: 'completed'
        });

      toast.success(`Recarga de S/ ${request.amount.toFixed(2)} aprobada`);
      await loadRechargeRequests();
    } catch (error) {
      console.error('Error approving recharge:', error);
      toast.error('Error al aprobar la recarga');
    }
  };

  const rejectRecharge = async (requestId: string) => {
    try {
      await supabase
        .from('recharge_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      toast.success('Solicitud de recarga rechazada');
      await loadRechargeRequests();
    } catch (error) {
      console.error('Error rejecting recharge:', error);
      toast.error('Error al rechazar la recarga');
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_approved: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuario aprobado exitosamente');
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Error al aprobar usuario');
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuario rechazado y eliminado');
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Error al rechazar usuario');
    }
  };

  const getAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        walletBalance: user.wallet_balance,
        totalSpent: 0, // Calculate from transactions if needed
        role: user.role,
        joinDate: new Date(user.created_at).toLocaleDateString(),
        lastActivity: 'Hace 1 min', // Calculate from last activity if needed
        isActive: user.is_approved,
        isPending: !user.is_approved
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
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
      rechargeRequests,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      addStockToProduct,
      purchaseProduct,
      addUserBalance,
      getAvailableStock,
      getUserOrders,
      getStats,
      loadData,
      approveUser,
      rejectUser,
      getAllUsers,
      requestRecharge,
      approveRecharge,
      rejectRecharge
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
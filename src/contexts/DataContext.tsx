import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase, LocalStorageDB, AutoSync, checkSupabaseConnection, isSupabaseConfigured } from '../lib/supabase';
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
  isOnline: boolean;
  supabaseConnected: boolean;
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  
  const localDB = LocalStorageDB.getInstance();

  useEffect(() => {
    // Detectar estado de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadData();
    
    // Configurar subscripciones en tiempo real solo si Supabase está configurado y conectado
    let subscriptions: any[] = [];
    
    const setupRealtimeSubscriptions = async () => {
      if (isSupabaseConfigured && await checkSupabaseConnection()) {
        try {
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

          subscriptions = [productsSubscription, ordersSubscription, rechargeSubscription];
          console.log('✅ Subscripciones en tiempo real configuradas');
        } catch (error) {
          console.log('📱 Subscripciones en tiempo real no disponibles - continuando en modo local');
        }
      }
    };

    setupRealtimeSubscriptions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      subscriptions.forEach(sub => sub?.unsubscribe?.());
    };
  }, [isOnline]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Verificar conectividad con Supabase
      const supabaseAvailable = isSupabaseConfigured && isOnline && await checkSupabaseConnection();
      setSupabaseConnected(supabaseAvailable);

      if (supabaseAvailable) {
        console.log('🌐 Cargando datos desde Supabase...');
        // Intentar cargar desde Supabase
        await Promise.allSettled([
          loadProducts(),
          loadOrders(),
          loadTransactions(),
          loadRechargeRequests()
        ]);
      } else {
        console.log('📱 Cargando datos desde almacenamiento local...');
        // Cargar desde almacenamiento local
        loadLocalData();
      }
    } catch (error) {
      console.error('Error loading data, falling back to local:', error);
      loadLocalData();
      setSupabaseConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalData = () => {
    try {
      const localProducts = localDB.getProducts();
      const localStockItems = localDB.getStockItems();
      const localOrders = localDB.getOrders();
      const localTransactions = localDB.getTransactions();
      const localRechargeRequests = localDB.getRechargeRequests();

      // Procesar productos con stock
      const productsWithStock = localProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        imageURL: product.imageURL,
        category: product.category || '',
        isActive: product.isActive,
        createdAt: new Date(product.createdAt || Date.now()),
        stock: localStockItems
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

      // Procesar órdenes
      const ordersData = localOrders.map(order => ({
        id: order.id,
        code: order.code,
        productName: order.productName,
        priceAtPurchase: order.priceAtPurchase,
        credentialsDelivered: order.credentialsDelivered,
        purchaseURL: order.purchaseURL,
        profileInfo: order.profileInfo,
        supplier: order.supplier,
        createdAt: new Date(order.createdAt),
        expiresAt: new Date(order.expiresAt),
        status: order.status,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        userId: order.userId
      }));

      // Procesar transacciones
      const transactionsData = localTransactions.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        userId: transaction.userId,
        productId: transaction.productId || undefined,
        createdAt: new Date(transaction.createdAt),
        status: transaction.status
      }));

      // Procesar solicitudes de recarga
      const requestsData = localRechargeRequests.map(request => ({
        id: request.id,
        userId: request.userId,
        username: request.username || 'Usuario',
        amount: request.amount,
        method: request.method,
        status: request.status,
        createdAt: new Date(request.createdAt),
        processedAt: request.processedAt ? new Date(request.processedAt) : undefined
      }));

      setProducts(productsWithStock);
      setOrders(ordersData);
      setTransactions(transactionsData);
      setRechargeRequests(requestsData);

      console.log('📱 Datos cargados desde almacenamiento local');
    } catch (error) {
      console.error('Error loading local data:', error);
      // Inicializar con datos vacíos si hay error
      setProducts([]);
      setOrders([]);
      setTransactions([]);
      setRechargeRequests([]);
    }
  };

  const loadProducts = async () => {
    if (!supabaseConnected) {
      loadLocalData();
      return;
    }

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
      
      // Guardar en local storage
      localDB.saveProducts(productsWithStock);
      localDB.saveStockItems(stockData);
    } catch (error) {
      console.error('Error loading products from Supabase:', error);
      setSupabaseConnected(false);
      loadLocalData();
    }
  };

  const loadOrders = async () => {
    if (!supabaseConnected) {
      return;
    }

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
      localDB.saveOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders from Supabase:', error);
      setSupabaseConnected(false);
    }
  };

  const loadTransactions = async () => {
    if (!supabaseConnected) {
      return;
    }

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
      localDB.saveTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions from Supabase:', error);
      setSupabaseConnected(false);
    }
  };

  const loadRechargeRequests = async () => {
    if (!supabaseConnected) {
      return;
    }

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
      localDB.saveRechargeRequests(requestsData);
    } catch (error) {
      console.error('Error loading recharge requests from Supabase:', error);
      setSupabaseConnected(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'stock'>) => {
    try {
      const newProduct = {
        id: localDB.generateId(),
        ...productData,
        createdAt: new Date(),
        stock: []
      };

      if (supabaseConnected) {
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
          newProduct.id = data.id;

          // Agregar transacción
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
        } catch (error) {
          console.log('Guardando producto localmente debido a error de conexión');
          setSupabaseConnected(false);
        }
      }

      // Actualizar estado local
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localDB.saveProducts(updatedProducts);

      toast.success('Producto creado exitosamente');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error al crear el producto');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      if (supabaseConnected) {
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
        } catch (error) {
          console.log('Actualizando producto localmente debido a error de conexión');
          setSupabaseConnected(false);
        }
      }

      // Actualizar estado local
      const updatedProducts = products.map(p => 
        p.id === id ? { ...p, ...updates } : p
      );
      setProducts(updatedProducts);
      localDB.saveProducts(updatedProducts);

      toast.success('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      if (supabaseConnected) {
        try {
          // Eliminar stock items primero
          await supabase
            .from('stock_items')
            .delete()
            .eq('product_id', id);

          // Eliminar producto
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

          if (error) throw error;

          // Agregar transacción
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
        } catch (error) {
          console.log('Eliminando producto localmente debido a error de conexión');
          setSupabaseConnected(false);
        }
      }

      // Actualizar estado local
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      localDB.saveProducts(updatedProducts);

      // Actualizar stock items local
      const currentStock = localDB.getStockItems();
      const updatedStock = currentStock.filter(s => s.product_id !== id);
      localDB.saveStockItems(updatedStock);

      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  const addStockToProduct = async (productId: string, credentials: string) => {
    try {
      const newStockItem = {
        id: localDB.generateId(),
        product_id: productId,
        credentials,
        is_sold: false,
        sold_to: null,
        order_id: null,
        sold_at: null,
        created_at: new Date().toISOString()
      };

      if (supabaseConnected) {
        try {
          const { data, error } = await supabase
            .from('stock_items')
            .insert({
              product_id: productId,
              credentials,
              is_sold: false
            })
            .select()
            .single();

          if (error) throw error;
          newStockItem.id = data.id;
        } catch (error) {
          console.log('Guardando stock localmente debido a error de conexión');
          setSupabaseConnected(false);
        }
      }

      // Actualizar estado local
      const updatedProducts = products.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            stock: [...p.stock, {
              id: newStockItem.id,
              credentials: newStockItem.credentials,
              isSold: newStockItem.is_sold,
              soldTo: newStockItem.sold_to || undefined,
              orderId: newStockItem.order_id || undefined,
              soldAt: newStockItem.sold_at ? new Date(newStockItem.sold_at) : undefined
            }]
          };
        }
        return p;
      });

      setProducts(updatedProducts);
      localDB.saveProducts(updatedProducts);

      // Actualizar stock items local
      const currentStock = localDB.getStockItems();
      localDB.saveStockItems([...currentStock, newStockItem]);

      toast.success('Credencial agregada al inventario');
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

      const orderId = localDB.generateId();
      const orderCode = `ITC${Date.now().toString().slice(-7)}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Crear orden
      const orderData = {
        id: orderId,
        code: orderCode,
        productName: product.name,
        priceAtPurchase: product.price,
        credentialsDelivered: availableStock.credentials,
        purchaseURL: getProductURL(product.name),
        profileInfo: parseCredentials(availableStock.credentials).profile || '1',
        supplier: 'NexyPass',
        customerName: customerData.name,
        customerPhone: customerData.phone,
        userId: user?.id || '',
        createdAt: new Date(),
        expiresAt,
        status: 'active' as const
      };

      if (supabaseConnected) {
        try {
          // Marcar stock como vendido
          await supabase
            .from('stock_items')
            .update({
              is_sold: true,
              sold_to: user?.id,
              sold_at: new Date().toISOString()
            })
            .eq('id', availableStock.id);

          // Crear orden en Supabase
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              code: orderCode,
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
              status: 'active',
              expires_at: expiresAt.toISOString()
            })
            .select()
            .single();

          if (order && !orderError) {
            orderData.id = order.id;
          }

          // Agregar transacción
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
        } catch (error) {
          console.log('Procesando compra localmente debido a error de conexión');
          setSupabaseConnected(false);
        }
      }

      // Actualizar estado local
      const updatedProducts = products.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            stock: p.stock.map(s => 
              s.id === availableStock.id 
                ? { ...s, isSold: true, soldTo: user?.id, soldAt: new Date() }
                : s
            )
          };
        }
        return p;
      });

      const updatedOrders = [...orders, orderData];
      
      setProducts(updatedProducts);
      setOrders(updatedOrders);
      
      localDB.saveProducts(updatedProducts);
      localDB.saveOrders(updatedOrders);

      // Actualizar stock items local
      const currentStock = localDB.getStockItems();
      const updatedStock = currentStock.map(s => 
        s.id === availableStock.id 
          ? { ...s, is_sold: true, sold_to: user?.id, sold_at: new Date().toISOString() }
          : s
      );
      localDB.saveStockItems(updatedStock);

      return orderData;
    } catch (error) {
      console.error('Error purchasing product:', error);
      throw error;
    }
  };

  const addUserBalance = async (userId: string, amount: number) => {
    try {
      const transactionData = {
        id: localDB.generateId(),
        type: 'balance_add' as const,
        amount: amount,
        description: 'Recarga de saldo',
        userId: userId,
        status: 'completed' as const,
        createdAt: new Date()
      };

      if (supabaseConnected) {
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
        } catch (error) {
          console.log('Guardando transacción localmente debido a error de conexión');
          setSupabaseConnected(false);
        }
      }

      // Actualizar estado local
      const updatedTransactions = [...transactions, transactionData];
      setTransactions(updatedTransactions);
      localDB.saveTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error adding balance:', error);
      toast.error('Error al agregar saldo');
    }
  };

  const requestRecharge = async (amount: number, method: string) => {
    try {
      const requestData = {
        id: localDB.generateId(),
        userId: user?.id || '',
        username: user?.username || 'Usuario',
        amount,
        method,
        status: 'pending' as const,
        createdAt: new Date()
      };

      if (supabaseConnected) {
        try {
          const { data, error } = await supabase
            .from('recharge_requests')
            .insert({
              user_id: user?.id || '',
              amount,
              method,
              status: 'pending'
            })
            .select()
            .single();

          if (error) throw error;
          requestData.id = data.id;
        } catch (error) {
          console.log('Guardando solicitud localmente debido a error de conexión');
          setSupabaseConnected(false);
        }
      }

      // Actualizar estado local
      const updatedRequests = [...rechargeRequests, requestData];
      setRechargeRequests(updatedRequests);
      localDB.saveRechargeRequests(updatedRequests);

      toast.success('Solicitud de recarga enviada exitosamente');
    } catch (error) {
      console.error('Error requesting recharge:', error);
      toast.error('Error al solicitar recarga');
    }
  };

  const approveRecharge = async (requestId: string) => {
    try {
      const request = rechargeRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Solicitud no encontrada');

      if (supabaseConnected) {
        try {
          // Actualizar estado de solicitud
          await supabase
            .from('recharge_requests')
            .update({
              status: 'approved',
              processed_at: new Date().toISOString()
            })
            .eq('id', requestId);

          // Actualizar saldo del usuario
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

          // Agregar transacción
          await supabase
            .from('transactions')
            .insert({
              type: 'balance_add',
              amount: request.amount,
              description: `Recarga aprobada: ${request.method}`,
              user_id: request.userId,
              status: 'completed'
            });
        } catch (error) {
          console.log('Procesando aprobación localmente debido a error de conexión');
          setSupabaseConnected(false);
        }
      }

      // Actualizar estado local
      const updatedRequests = rechargeRequests.filter(r => r.id !== requestId);
      setRechargeRequests(updatedRequests);
      localDB.saveRechargeRequests(updatedRequests);

      toast.success(`Recarga de S/ ${request.amount.toFixed(2)} aprobada`);
    } catch (error) {
      console.error('Error approving recharge:', error);
      toast.error('Error al aprobar la recarga');
    }
  };

  const rejectRecharge = async (requestId: string) => {
    try {
      if (supabaseConnected) {
        try {
          await supabase
            .from('recharge_requests')
            .update({
              status: 'rejected',
              processed_at: new Date().toISOString()
            })
            .eq('id', requestId);
        } catch (error) {
          console.log('Procesando rechazo localmente debido a error de conexión');
          setSupabaseConnected(false);
        }
      }

      // Actualizar estado local
      const updatedRequests = rechargeRequests.filter(r => r.id !== requestId);
      setRechargeRequests(updatedRequests);
      localDB.saveRechargeRequests(updatedRequests);

      toast.success('Solicitud de recarga rechazada');
    } catch (error) {
      console.error('Error rejecting recharge:', error);
      toast.error('Error al rechazar la recarga');
    }
  };

  const approveUser = async (userId: string) => {
    try {
      if (supabaseConnected) {
        try {
          const { error } = await supabase
            .from('users')
            .update({
              is_approved: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (error) throw error;
        } catch (error) {
          console.log('Aprobando usuario localmente debido a error de conexión');
          setSupabaseConnected(false);
        }
      }

      toast.success('Usuario aprobado exitosamente');
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Error al aprobar usuario');
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      if (supabaseConnected) {
        try {
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

          if (error) throw error;
        } catch (error) {
          console.log('Rechazando usuario localmente debido a error de conexión');
          setSupabaseConnected(false);
        }
      }

      toast.success('Usuario rechazado y eliminado');
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Error al rechazar usuario');
    }
  };

  const getAllUsers = async () => {
    try {
      if (supabaseConnected) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const usersData = data.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          walletBalance: user.wallet_balance,
          totalSpent: 0, // Calcular desde transacciones si es necesario
          role: user.role,
          joinDate: new Date(user.created_at).toLocaleDateString(),
          lastActivity: 'Hace 1 min', // Calcular desde última actividad si es necesario
          isActive: user.is_approved,
          isPending: !user.is_approved
        }));

        // Guardar en local storage
        localDB.saveUsers(usersData);
        return usersData;
      } else {
        // Cargar desde almacenamiento local
        return localDB.getUsers();
      }
    } catch (error) {
      console.error('Error getting users:', error);
      setSupabaseConnected(false);
      return localDB.getUsers();
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

  // Funciones auxiliares
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
      isOnline,
      supabaseConnected,
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
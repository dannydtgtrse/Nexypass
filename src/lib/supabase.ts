import { createClient } from '@supabase/supabase-js'

// Configuración con fallbacks locales para desarrollo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// Verificar si las variables de entorno están configuradas correctamente
const isSupabaseConfigured = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://demo.supabase.co' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'demo-key';

// Cliente principal de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-application-name': 'NexyPass-v13'
    }
  }
})

// Función para verificar conectividad con Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    console.log('📱 Supabase no configurado - usando modo local');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Error de conexión Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexión Supabase exitosa');
    return true;
  } catch (error) {
    console.log('❌ Supabase no disponible:', error);
    return false;
  }
};

// Exportar estado de configuración
export { isSupabaseConfigured };

// Sistema de almacenamiento local como fallback
export class LocalStorageDB {
  private static instance: LocalStorageDB;
  private prefix = 'nexypass_';

  static getInstance(): LocalStorageDB {
    if (!LocalStorageDB.instance) {
      LocalStorageDB.instance = new LocalStorageDB();
    }
    return LocalStorageDB.instance;
  }

  // Usuarios
  getUsers(): any[] {
    const users = localStorage.getItem(this.prefix + 'users');
    return users ? JSON.parse(users) : [];
  }

  saveUsers(users: any[]): void {
    localStorage.setItem(this.prefix + 'users', JSON.stringify(users));
  }

  // Productos
  getProducts(): any[] {
    const products = localStorage.getItem(this.prefix + 'products');
    return products ? JSON.parse(products) : [];
  }

  saveProducts(products: any[]): void {
    localStorage.setItem(this.prefix + 'products', JSON.stringify(products));
  }

  // Órdenes
  getOrders(): any[] {
    const orders = localStorage.getItem(this.prefix + 'orders');
    return orders ? JSON.parse(orders) : [];
  }

  saveOrders(orders: any[]): void {
    localStorage.setItem(this.prefix + 'orders', JSON.stringify(orders));
  }

  // Transacciones
  getTransactions(): any[] {
    const transactions = localStorage.getItem(this.prefix + 'transactions');
    return transactions ? JSON.parse(transactions) : [];
  }

  saveTransactions(transactions: any[]): void {
    localStorage.setItem(this.prefix + 'transactions', JSON.stringify(transactions));
  }

  // Solicitudes de recarga
  getRechargeRequests(): any[] {
    const requests = localStorage.getItem(this.prefix + 'recharge_requests');
    return requests ? JSON.parse(requests) : [];
  }

  saveRechargeRequests(requests: any[]): void {
    localStorage.setItem(this.prefix + 'recharge_requests', JSON.stringify(requests));
  }

  // Stock items
  getStockItems(): any[] {
    const stock = localStorage.getItem(this.prefix + 'stock_items');
    return stock ? JSON.parse(stock) : [];
  }

  saveStockItems(stock: any[]): void {
    localStorage.setItem(this.prefix + 'stock_items', JSON.stringify(stock));
  }

  // Generar ID único
  generateId(): string {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Sistema de sincronización automática
export class AutoSync {
  private static instance: AutoSync;
  private localDB = LocalStorageDB.getInstance();
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;
  private supabaseAvailable = false;

  static getInstance(): AutoSync {
    if (!AutoSync.instance) {
      AutoSync.instance = new AutoSync();
    }
    return AutoSync.instance;
  }

  constructor() {
    this.setupEventListeners();
    this.checkSupabaseAvailability();
    this.startAutoSync();
  }

  private async checkSupabaseAvailability(): Promise<void> {
    this.supabaseAvailable = await checkSupabaseConnection();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.checkSupabaseAvailability().then(() => {
        if (this.supabaseAvailable) {
          this.syncToSupabase();
        }
      });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.supabaseAvailable = false;
    });
  }

  private startAutoSync(): void {
    // Sincronizar cada 30 segundos si está online y Supabase disponible
    this.syncInterval = setInterval(async () => {
      if (this.isOnline) {
        await this.checkSupabaseAvailability();
        if (this.supabaseAvailable) {
          this.syncToSupabase();
        }
      }
    }, 30000);
  }

  private async syncToSupabase(): Promise<void> {
    if (!this.supabaseAvailable) return;

    try {
      // Verificar conexión a Supabase
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        this.supabaseAvailable = false;
        return;
      }

      // Si la conexión es exitosa, sincronizar datos locales
      await this.syncUsers();
      await this.syncProducts();
      await this.syncOrders();
      await this.syncTransactions();
      await this.syncRechargeRequests();
      
      console.log('✅ Sincronización automática completada');
    } catch (error) {
      console.log('📱 Error en sincronización - continuando en modo local');
      this.supabaseAvailable = false;
    }
  }

  private async syncUsers(): Promise<void> {
    const localUsers = this.localDB.getUsers();
    const pendingUsers = localUsers.filter(user => user.id.startsWith('local_'));

    for (const user of pendingUsers) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert({
            username: user.username,
            email: user.email,
            role: user.role,
            wallet_balance: user.wallet_balance,
            is_approved: user.is_approved
          })
          .select()
          .single();

        if (!error && data) {
          // Actualizar ID local con ID de Supabase
          const updatedUsers = localUsers.map(u => 
            u.id === user.id ? { ...u, id: data.id } : u
          );
          this.localDB.saveUsers(updatedUsers);
        }
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    }
  }

  private async syncProducts(): Promise<void> {
    const localProducts = this.localDB.getProducts();
    const pendingProducts = localProducts.filter(product => product.id.startsWith('local_'));

    for (const product of pendingProducts) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: product.name,
            price: product.price,
            image_url: product.imageURL,
            category: product.category,
            is_active: product.isActive
          })
          .select()
          .single();

        if (!error && data) {
          const updatedProducts = localProducts.map(p => 
            p.id === product.id ? { ...p, id: data.id } : p
          );
          this.localDB.saveProducts(updatedProducts);
        }
      } catch (error) {
        console.error('Error syncing product:', error);
      }
    }
  }

  private async syncOrders(): Promise<void> {
    const localOrders = this.localDB.getOrders();
    const pendingOrders = localOrders.filter(order => order.id.startsWith('local_'));

    for (const order of pendingOrders) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            code: order.code,
            product_name: order.productName,
            price_at_purchase: order.priceAtPurchase,
            credentials_delivered: order.credentialsDelivered,
            purchase_url: order.purchaseURL,
            profile_info: order.profileInfo,
            supplier: order.supplier,
            customer_name: order.customerName,
            customer_phone: order.customerPhone,
            user_id: order.userId,
            product_id: order.productId,
            status: order.status,
            expires_at: order.expiresAt
          })
          .select()
          .single();

        if (!error && data) {
          const updatedOrders = localOrders.map(o => 
            o.id === order.id ? { ...o, id: data.id } : o
          );
          this.localDB.saveOrders(updatedOrders);
        }
      } catch (error) {
        console.error('Error syncing order:', error);
      }
    }
  }

  private async syncTransactions(): Promise<void> {
    const localTransactions = this.localDB.getTransactions();
    const pendingTransactions = localTransactions.filter(transaction => transaction.id.startsWith('local_'));

    for (const transaction of pendingTransactions) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            user_id: transaction.userId,
            product_id: transaction.productId,
            status: transaction.status
          })
          .select()
          .single();

        if (!error && data) {
          const updatedTransactions = localTransactions.map(t => 
            t.id === transaction.id ? { ...t, id: data.id } : t
          );
          this.localDB.saveTransactions(updatedTransactions);
        }
      } catch (error) {
        console.error('Error syncing transaction:', error);
      }
    }
  }

  private async syncRechargeRequests(): Promise<void> {
    const localRequests = this.localDB.getRechargeRequests();
    const pendingRequests = localRequests.filter(request => request.id.startsWith('local_'));

    for (const request of pendingRequests) {
      try {
        const { data, error } = await supabase
          .from('recharge_requests')
          .insert({
            user_id: request.userId,
            amount: request.amount,
            method: request.method,
            status: request.status
          })
          .select()
          .single();

        if (!error && data) {
          const updatedRequests = localRequests.map(r => 
            r.id === request.id ? { ...r, id: data.id } : r
          );
          this.localDB.saveRechargeRequests(updatedRequests);
        }
      } catch (error) {
        console.error('Error syncing recharge request:', error);
      }
    }
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Inicializar sistema de auto-sincronización
AutoSync.getInstance();

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          role: 'user' | 'admin'
          wallet_balance: number
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          role?: 'user' | 'admin'
          wallet_balance?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: 'user' | 'admin'
          wallet_balance?: number
          is_approved?: boolean
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          image_url: string
          category: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          image_url: string
          category?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          image_url?: string
          category?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      stock_items: {
        Row: {
          id: string
          product_id: string
          credentials: string
          is_sold: boolean
          sold_to: string | null
          order_id: string | null
          sold_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          credentials: string
          is_sold?: boolean
          sold_to?: string | null
          order_id?: string | null
          sold_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          credentials?: string
          is_sold?: boolean
          sold_to?: string | null
          order_id?: string | null
          sold_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          code: string
          product_name: string
          price_at_purchase: number
          credentials_delivered: string
          purchase_url: string
          profile_info: string
          supplier: string
          customer_name: string
          customer_phone: string
          user_id: string
          product_id: string
          status: 'active' | 'expired'
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          code: string
          product_name: string
          price_at_purchase: number
          credentials_delivered: string
          purchase_url: string
          profile_info: string
          supplier: string
          customer_name: string
          customer_phone: string
          user_id: string
          product_id: string
          status?: 'active' | 'expired'
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          code?: string
          product_name?: string
          price_at_purchase?: number
          credentials_delivered?: string
          purchase_url?: string
          profile_info?: string
          supplier?: string
          customer_name?: string
          customer_phone?: string
          user_id?: string
          product_id?: string
          status?: 'active' | 'expired'
          expires_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          type: 'purchase' | 'balance_add' | 'system'
          amount: number
          description: string
          user_id: string
          product_id: string | null
          status: 'completed' | 'pending'
          created_at: string
        }
        Insert: {
          id?: string
          type: 'purchase' | 'balance_add' | 'system'
          amount: number
          description: string
          user_id: string
          product_id?: string | null
          status?: 'completed' | 'pending'
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'purchase' | 'balance_add' | 'system'
          amount?: number
          description?: string
          user_id?: string
          product_id?: string | null
          status?: 'completed' | 'pending'
        }
      }
      recharge_requests: {
        Row: {
          id: string
          user_id: string
          amount: number
          method: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          method: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          method?: string
          status?: 'pending' | 'approved' | 'rejected'
          processed_at?: string | null
        }
      }
    }
  }
}
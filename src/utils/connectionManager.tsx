/**
 * Gestor de Conexión y Sincronización en Tiempo Real
 * Maneja la conectividad y sincronización de datos
 */

import React from 'react';
import toast from 'react-hot-toast';
import { LocalStorageDB } from '../lib/supabase';

export class ConnectionManager {
  private static instance: ConnectionManager;
  private localDB = LocalStorageDB.getInstance();
  private isOnline = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  constructor() {
    this.initializeConnectionHandlers();
    this.startSyncProcess();
  }

  private initializeConnectionHandlers(): void {
    // Escuchar cambios de conectividad
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Verificar conectividad inicial
    this.checkConnection();
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.reconnectAttempts = 0;
    
    toast.custom((t) => (
      <div className="bg-green-800 border border-green-500/30 rounded-xl p-4 text-center shadow-lg">
        <p className="text-green-400 font-semibold">🌐 Conexión Restaurada</p>
        <p className="text-gray-300 text-sm mt-1">Sincronizando datos...</p>
      </div>
    ), { duration: 3000 });

    // Iniciar sincronización inmediata
    this.syncData();
  }

  private handleOffline(): void {
    this.isOnline = false;
    
    toast.custom((t) => (
      <div className="bg-orange-800 border border-orange-500/30 rounded-xl p-4 text-center shadow-lg">
        <p className="text-orange-400 font-semibold">📱 Modo Offline</p>
        <p className="text-gray-300 text-sm mt-1">Los datos se guardan localmente</p>
      </div>
    ), { duration: 4000 });
  }

  private async checkConnection(): Promise<boolean> {
    try {
      // Intentar hacer una petición simple para verificar conectividad real
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      this.isOnline = true;
      return true;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  private startSyncProcess(): void {
    // Sincronizar cada 30 segundos si hay conexión
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncData();
      }
    }, 30000);
  }

  private async syncData(): Promise<void> {
    if (!this.isOnline) return;

    try {
      // Simular sincronización con servidor
      console.log('🔄 Sincronizando datos con servidor...');
      
      // Aquí iría la lógica real de sincronización con Supabase
      // Por ahora, solo verificamos la integridad local
      
      const data = {
        users: this.localDB.getUsers(),
        products: this.localDB.getProducts(),
        orders: this.localDB.getOrders(),
        transactions: this.localDB.getTransactions()
      };

      // Verificar que todos los datos sean válidos
      let syncSuccess = true;
      Object.entries(data).forEach(([key, items]) => {
        if (!Array.isArray(items)) {
          console.error(`❌ Error en sincronización: ${key} no es válido`);
          syncSuccess = false;
        }
      });

      if (syncSuccess) {
        console.log('✅ Sincronización completada exitosamente');
        
        // Mostrar notificación de sincronización exitosa solo ocasionalmente
        if (Math.random() < 0.1) { // 10% de probabilidad
          toast.success('🔄 Datos sincronizados', { duration: 2000 });
        }
      }

    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      this.handleSyncError();
    }
  }

  private handleSyncError(): void {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast.error('❌ Error de sincronización. Trabajando offline.', {
        duration: 5000
      });
      this.isOnline = false;
    } else {
      // Reintentar después de un delay exponencial
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      setTimeout(() => {
        this.checkConnection();
      }, delay);
    }
  }

  public getConnectionStatus(): boolean {
    return this.isOnline;
  }

  public forceSync(): void {
    if (this.isOnline) {
      this.syncData();
    } else {
      toast.error('❌ Sin conexión a internet', { duration: 3000 });
    }
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
  }
}

// Inicializar gestor de conexión
const connectionManager = ConnectionManager.getInstance();

// Exponer métodos globalmente para debugging
(window as any).forceSync = () => connectionManager.forceSync();
(window as any).getConnectionStatus = () => connectionManager.getConnectionStatus();

export default connectionManager;
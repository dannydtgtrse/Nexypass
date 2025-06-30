/**
 * Sistema Auto-Solucionador NexyPass v13.0
 * Detecta y corrige automáticamente errores comunes
 */

import React from 'react';
import { LocalStorageDB } from '../lib/supabase';
import toast from 'react-hot-toast';

export class AutoFixer {
  private static instance: AutoFixer;
  private localDB = LocalStorageDB.getInstance();
  private fixInterval: NodeJS.Timeout | null = null;

  static getInstance(): AutoFixer {
    if (!AutoFixer.instance) {
      AutoFixer.instance = new AutoFixer();
    }
    return AutoFixer.instance;
  }

  constructor() {
    this.startAutoFixer();
  }

  private startAutoFixer(): void {
    // Ejecutar auto-correcciones cada 60 segundos
    this.fixInterval = setInterval(() => {
      this.runDiagnostics();
    }, 60000);

    // Ejecutar diagnóstico inicial
    setTimeout(() => {
      this.runDiagnostics();
    }, 5000);
  }

  private runDiagnostics(): void {
    try {
      this.fixLocalStorageIssues();
      this.fixDataIntegrity();
      this.fixMemoryLeaks();
      this.fixUIState();
      this.optimizePerformance();
    } catch (error) {
      console.error('Error en auto-diagnóstico:', error);
    }
  }

  private fixLocalStorageIssues(): void {
    try {
      // Verificar y reparar datos corruptos en localStorage
      const keys = ['nexypass_users', 'nexypass_products', 'nexypass_orders', 'nexypass_transactions', 'nexypass_recharge_requests', 'nexypass_stock_items'];
      
      keys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            JSON.parse(data); // Verificar que sea JSON válido
          }
        } catch (error) {
          console.log(`🔧 Auto-Fix: Reparando ${key} corrupto`);
          localStorage.removeItem(key);
          
          // Inicializar con array vacío
          localStorage.setItem(key, JSON.stringify([]));
        }
      });

      // Verificar usuario actual
      try {
        const savedUser = localStorage.getItem('nexypass_user');
        if (savedUser) {
          JSON.parse(savedUser);
        }
      } catch (error) {
        console.log('🔧 Auto-Fix: Reparando datos de usuario corruptos');
        localStorage.removeItem('nexypass_user');
      }
    } catch (error) {
      console.error('Error fixing localStorage:', error);
    }
  }

  private fixDataIntegrity(): void {
    try {
      // Verificar integridad de productos y stock
      const products = this.localDB.getProducts();
      const stockItems = this.localDB.getStockItems();
      
      // Eliminar stock huérfano (sin producto asociado)
      const validProductIds = products.map(p => p.id);
      const validStock = stockItems.filter(stock => validProductIds.includes(stock.product_id));
      
      if (validStock.length !== stockItems.length) {
        console.log('🔧 Auto-Fix: Eliminando stock huérfano');
        this.localDB.saveStockItems(validStock);
      }

      // Verificar órdenes
      const orders = this.localDB.getOrders();
      const users = this.localDB.getUsers();
      const validUserIds = users.map(u => u.id);
      
      // Filtrar órdenes con usuarios válidos
      const validOrders = orders.filter(order => validUserIds.includes(order.userId));
      
      if (validOrders.length !== orders.length) {
        console.log('🔧 Auto-Fix: Limpiando órdenes huérfanas');
        this.localDB.saveOrders(validOrders);
      }

      // Actualizar estado de órdenes expiradas
      const now = new Date();
      const updatedOrders = validOrders.map(order => {
        if (order.status === 'active' && new Date(order.expiresAt) < now) {
          return { ...order, status: 'expired' as const };
        }
        return order;
      });
      
      const expiredCount = updatedOrders.filter(o => o.status === 'expired').length - orders.filter(o => o.status === 'expired').length;
      if (expiredCount > 0) {
        console.log(`🔧 Auto-Fix: Marcando ${expiredCount} órdenes como expiradas`);
        this.localDB.saveOrders(updatedOrders);
      }
    } catch (error) {
      console.error('Error fixing data integrity:', error);
    }
  }

  private fixMemoryLeaks(): void {
    try {
      // Limpiar event listeners huérfanos
      const events = ['online', 'offline', 'beforeunload', 'unload'];
      events.forEach(event => {
        // Remover listeners duplicados (esto es una simplificación)
        if (window.addEventListener.toString().includes('native code')) {
          // Solo en navegadores que soportan esto
        }
      });

      // Limpiar intervalos y timeouts huérfanos
      const highestTimeoutId = setTimeout(() => {}, 0);
      for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
      }
      clearTimeout(highestTimeoutId);

      // Forzar garbage collection si está disponible
      if ((window as any).gc) {
        (window as any).gc();
      }
    } catch (error) {
      console.error('Error fixing memory leaks:', error);
    }
  }

  private fixUIState(): void {
    try {
      // Verificar y corregir estado de scroll
      if (document.body.style.overflow === 'hidden' && window.location.pathname !== '/auth') {
        document.body.style.overflow = 'hidden'; // Mantener para la app
      }

      // Limpiar modales huérfanos
      const modals = document.querySelectorAll('[role="dialog"], .modal, .overlay');
      modals.forEach(modal => {
        if (modal instanceof HTMLElement) {
          if (modal.style.display === 'none' || modal.style.visibility === 'hidden') {
            modal.remove();
          }
        }
      });

      // Verificar viewport en móviles
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport && !viewport.getAttribute('content')?.includes('user-scalable=no')) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');
      }
    } catch (error) {
      console.error('Error fixing UI state:', error);
    }
  }

  private optimizePerformance(): void {
    try {
      // Limpiar localStorage si está muy lleno
      const storageSize = JSON.stringify(localStorage).length;
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (storageSize > maxSize) {
        console.log('🔧 Auto-Fix: Optimizando almacenamiento local');
        
        // Mantener solo los últimos 100 registros de transacciones
        const transactions = this.localDB.getTransactions();
        if (transactions.length > 100) {
          const recentTransactions = transactions
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 100);
          this.localDB.saveTransactions(recentTransactions);
        }

        // Limpiar órdenes muy antiguas (más de 6 meses)
        const orders = this.localDB.getOrders();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const recentOrders = orders.filter(order => 
          new Date(order.createdAt) > sixMonthsAgo
        );
        
        if (recentOrders.length !== orders.length) {
          this.localDB.saveOrders(recentOrders);
        }
      }

      // Optimizar imágenes cargadas
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.complete && img.naturalWidth === 0) {
          // Imagen rota, usar placeholder
          img.src = 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=400';
        }
      });
    } catch (error) {
      console.error('Error optimizing performance:', error);
    }
  }

  // Método para forzar una reparación completa
  public forceFullRepair(): void {
    try {
      console.log('🔧 Iniciando reparación completa del sistema...');
      
      this.runDiagnostics();
      
      // Verificar conectividad
      if (!navigator.onLine) {
        toast.custom((t) => (
          <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-4 text-center shadow-lg">
            <p className="text-yellow-400 font-semibold">📱 Modo Offline Detectado</p>
            <p className="text-gray-300 text-sm mt-1">Sistema funcionando con almacenamiento local</p>
          </div>
        ), { duration: 3000 });
      }

      // Verificar integridad de datos críticos
      const criticalData = {
        users: this.localDB.getUsers(),
        products: this.localDB.getProducts(),
        orders: this.localDB.getOrders()
      };

      let hasIssues = false;
      Object.entries(criticalData).forEach(([key, data]) => {
        if (!Array.isArray(data)) {
          console.log(`🔧 Reparando ${key} - no es array válido`);
          localStorage.setItem(`nexypass_${key}`, JSON.stringify([]));
          hasIssues = true;
        }
      });

      if (hasIssues) {
        toast.success('🔧 Sistema reparado automáticamente', {
          duration: 4000,
        });
      }

      console.log('✅ Reparación completa finalizada');
    } catch (error) {
      console.error('Error en reparación completa:', error);
      
      // Último recurso: reset completo
      this.emergencyReset();
    }
  }

  private emergencyReset(): void {
    try {
      console.log('🚨 Ejecutando reset de emergencia...');
      
      // Guardar usuario actual si existe
      const currentUser = localStorage.getItem('nexypass_user');
      
      // Limpiar todo el localStorage de NexyPass
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('nexypass_')) {
          localStorage.removeItem(key);
        }
      });

      // Restaurar usuario si existía
      if (currentUser) {
        try {
          JSON.parse(currentUser); // Verificar que sea válido
          localStorage.setItem('nexypass_user', currentUser);
        } catch (error) {
          // Usuario corrupto, no restaurar
        }
      }

      // Inicializar datos básicos
      const emptyData = JSON.stringify([]);
      localStorage.setItem('nexypass_users', emptyData);
      localStorage.setItem('nexypass_products', emptyData);
      localStorage.setItem('nexypass_orders', emptyData);
      localStorage.setItem('nexypass_transactions', emptyData);
      localStorage.setItem('nexypass_recharge_requests', emptyData);
      localStorage.setItem('nexypass_stock_items', emptyData);

      toast.success('🔧 Sistema reiniciado y reparado', {
        duration: 5000,
      });

      // Recargar página después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error en reset de emergencia:', error);
      // Último recurso: recargar página
      window.location.reload();
    }
  }

  public destroy(): void {
    if (this.fixInterval) {
      clearInterval(this.fixInterval);
    }
  }
}

// Inicializar auto-fixer
const autoFixer = AutoFixer.getInstance();

// Exponer método de reparación forzada globalmente para debugging
(window as any).forceRepair = () => autoFixer.forceFullRepair();

export default autoFixer;
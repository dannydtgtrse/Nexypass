import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';
import './utils/autoFixer'; // Inicializar auto-solucionador

// Configuración global para manejo de errores
window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
  
  // Auto-recuperación para errores críticos
  if (event.error?.message?.includes('ChunkLoadError') || 
      event.error?.message?.includes('Loading chunk')) {
    console.log('🔧 Auto-Fix: Recargando por error de chunk');
    window.location.reload();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rechazada no manejada:', event.reason);
  
  // Prevenir que el error se propague
  event.preventDefault();
});

// Configuración de Service Worker para modo offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registro falló: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            border: '1px solid #374151',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: 'Inter, sans-serif'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F9FAFB',
            },
            style: {
              border: '1px solid #10B981',
              boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.25)',
            }
          },
          error: {
            iconTheme: {
              primary: '#F43F5E',
              secondary: '#F9FAFB',
            },
            style: {
              border: '1px solid #F43F5E',
              boxShadow: '0 25px 50px -12px rgba(244, 63, 94, 0.25)',
            }
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
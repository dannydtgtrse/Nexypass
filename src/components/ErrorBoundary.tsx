import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Auto-recuperación después de 5 segundos
    setTimeout(() => {
      this.handleReload();
    }, 5000);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-nexy-rose-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-glow-red animate-slide-up">
            <div className="mb-6">
              <div className="w-16 h-16 bg-nexy-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-nexy-rose-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-50 mb-2">
                Sistema Auto-Recuperándose
              </h1>
              <p className="text-gray-300">
                Se detectó un error y el sistema se está recuperando automáticamente
              </p>
            </div>

            <div className="bg-nexy-rose-500/10 border border-nexy-rose-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-nexy-rose-300 font-medium">
                ⚡ Auto-Solucionador Activado
              </p>
              <p className="text-xs text-nexy-rose-400 mt-1">
                El sistema se reiniciará automáticamente en unos segundos
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-gradient-to-r from-nexy-blue-400 to-nexy-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-nexy-blue-500 hover:to-nexy-blue-700 transition-all flex items-center justify-center shadow-glow-blue transform hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reiniciar Ahora
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full border border-slate-600 text-gray-300 py-3 px-4 rounded-xl font-semibold hover:bg-slate-700 transition-all flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir al Inicio
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  Detalles del Error (Desarrollo)
                </summary>
                <div className="mt-2 p-3 bg-slate-900 rounded-lg text-xs text-gray-400 overflow-auto max-h-32">
                  <pre>{this.state.error.toString()}</pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2">{this.state.errorInfo.componentStack}</pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
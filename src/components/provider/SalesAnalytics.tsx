import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const salesData = [
  { period: 'Hoy', sales: 1250, orders: 15, change: '+12%', changeType: 'increase' },
  { period: 'Esta Semana', sales: 8750, orders: 89, change: '+8%', changeType: 'increase' },
  { period: 'Este Mes', sales: 32450, orders: 342, change: '+15%', changeType: 'increase' },
  { period: 'Total', sales: 125680, orders: 1456, change: '+22%', changeType: 'increase' },
];

const topProducts = [
  { name: 'Netflix Premium', sales: 45, revenue: 1125, percentage: 35 },
  { name: 'Spotify Premium', sales: 32, revenue: 480, percentage: 25 },
  { name: 'Disney+ Premium', sales: 28, revenue: 700, percentage: 22 },
  { name: 'Amazon Prime', sales: 15, revenue: 375, percentage: 12 },
  { name: 'YouTube Premium', sales: 8, revenue: 120, percentage: 6 },
];

const topVendors = [
  { name: 'María García', sales: 28, revenue: 1400, percentage: 32 },
  { name: 'Carlos Mendoza', sales: 22, revenue: 1100, percentage: 25 },
  { name: 'Ana López', sales: 18, revenue: 900, percentage: 21 },
  { name: 'Luis Rodríguez', sales: 12, revenue: 600, percentage: 14 },
  { name: 'Sofia Vargas', sales: 7, revenue: 350, percentage: 8 },
];

export default function SalesAnalytics() {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analíticas de Ventas</h1>
        <p className="text-gray-600">Monitorea el rendimiento de tu plataforma</p>
      </div>

      {/* Sales Overview */}
      <div className="grid grid-cols-2 gap-4">
        {salesData.map((data) => (
          <div key={data.period} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{data.period}</h3>
              <div className={`flex items-center text-sm font-medium ${
                data.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.changeType === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {data.change}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">S/ {data.sales.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{data.orders} órdenes</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Ventas</h3>
        <div className="h-48 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <p className="text-gray-600">Gráfico de tendencias</p>
            <p className="text-sm text-gray-500">Próximamente disponible</p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h3>
          <Package className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={product.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} ventas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">S/ {product.revenue}</p>
                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${product.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Vendors */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mejores Vendedores</h3>
          <Users className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {topVendors.map((vendor, index) => (
            <div key={vendor.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{vendor.name}</p>
                  <p className="text-sm text-gray-600">{vendor.sales} ventas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">S/ {vendor.revenue}</p>
                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${vendor.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Promedio por Venta</p>
              <p className="text-2xl font-bold">S/ 28.50</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Tasa de Conversión</p>
              <p className="text-2xl font-bold">68%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
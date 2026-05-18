import { useState, useEffect, useCallback } from 'react';
import { TimeRangeSelector } from '@/shared/ui/TimeRangeSelector';
import { Users, ShoppingBag, DollarSign, TrendingUp, Package, BarChart3, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  getSummary, getSalesEvolution, getTopProducts, getOrdersByStatus,
  type MetricsSummary, type SalesPoint, type TopProduct, type OrderStatusCount,
  CURRENCY_FORMATTER,
} from '@/shared/api/metrics-api';
import { downloadAsCSV } from '@/shared/lib/export-utils';

export default function DashboardPage() {
  const [range, setRange] = useState(30);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [sales, setSales] = useState<SalesPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrderStatusCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (days: number) => {
    setLoading(true);
    try {
        const [s, sl, tp, os] = await Promise.all([
            getSummary(),
            getSalesEvolution(days),
            getTopProducts(15, days),
            getOrdersByStatus(days),
          ]);
      setSummary(s);
      setSales(sl);
      setTopProducts(tp);
      setOrdersByStatus(os);
    } catch (err) {
      console.error('Failed to fetch metrics', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  const handleExportSales = () => {
    downloadAsCSV(sales, `ventas_evolucion_${range}d`);
  };

  const handleExportProducts = () => {
    downloadAsCSV(topProducts, 'productos_top_ventas');
  };

  if (loading && !summary) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  const maxRevenue = Math.max(...sales.map((s) => s.revenue), 1);
  const maxProductQty = Math.max(...topProducts.map((p) => p.total_quantity), 1);
  const maxStatusCount = Math.max(...ordersByStatus.map((o) => o.count), 1);

  return (
    <div className="min-h-screen bg-surface-custom-950 p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header with Range Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Panel de Control</h1>
          <p className="text-surface-custom-400 mt-1 font-medium">Análisis avanzado de rendimiento y ventas.</p>
        </div>
        
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>

      {/* Stats Summary with Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Usuarios', value: summary?.total_users ?? '-', trend: '+12%', up: true, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Pedidos', value: summary?.total_orders ?? '-', trend: '+5%', up: true, icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Ingresos', value: summary ? CURRENCY_FORMATTER.format(summary.total_revenue) : '-', trend: '+8.2%', up: true, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Ticket Prom.', value: summary ? CURRENCY_FORMATTER.format(summary.average_order_value) : '-', trend: '-2.1%', up: false, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map((stat, i) => (
          <div key={i} className="card-premium p-6 flex flex-col justify-between group hover:border-primary-500/30 transition-all">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500">{stat.label}</p>
              <p className="text-3xl font-black text-white mt-1 tracking-tighter italic">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Evolution */}
        <div className="lg:col-span-2 card-premium p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp size={120} />
          </div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <TrendingUp size={20} className="text-primary-400" />
              </div>
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Evolución de Ventas</h2>
            </div>
            <button 
              onClick={handleExportSales}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-surface-custom-400 hover:text-white transition-all"
            >
              <Download size={14} />
              Exportar CSV
            </button>
          </div>

          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-surface-custom-500">
              <BarChart3 size={64} className="mb-4 opacity-10 animate-pulse" />
              <p className="italic font-medium">Iniciando escaneo de transacciones...</p>
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              {sales.map((point) => (
                <div key={point.date} className="flex items-center gap-4 group">
                  <div className="w-24 shrink-0">
                    <span className="text-[10px] font-black font-mono text-surface-custom-500 uppercase tracking-widest group-hover:text-primary-400 transition-colors">
                      {new Date(point.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 bg-surface-custom-900/50 rounded-full h-5 relative overflow-hidden border border-white/5 backdrop-blur-sm">
                    <div
                      className="gradient-primary h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                      style={{ width: `${(point.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <div className="w-32 text-right">
                    <span className="text-sm font-black text-white italic group-hover:text-primary-400 transition-colors">
                      {CURRENCY_FORMATTER.format(point.revenue)}
                    </span>
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-[10px] font-black text-surface-custom-600 italic">x{point.orders}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="card-premium p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-secondary-500/20 rounded-lg">
              <Package size={20} className="text-secondary-400" />
            </div>
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Estados de Pedido</h2>
          </div>
          
          {ordersByStatus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <Package size={48} />
              <p className="mt-4 text-sm italic font-bold">Sin actividad registrada.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {ordersByStatus.map((item) => (
                <div key={item.status} className="space-y-2 group">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-surface-custom-400 uppercase tracking-[0.2em] group-hover:text-secondary-400 transition-colors">
                      {item.status}
                    </span>
                    <span className="text-lg font-black text-white italic">{item.count}</span>
                  </div>
                  <div className="w-full bg-surface-custom-900/50 rounded-full h-2 border border-white/5 overflow-hidden backdrop-blur-sm">
                    <div
                      className="bg-secondary-500 h-full rounded-full shadow-[0_0_10px_rgba(var(--secondary-500),0.5)] transition-all duration-1000"
                      style={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="card-premium p-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <ShoppingBag size={20} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Productos Más Vendidos</h2>
          </div>
          <button 
            onClick={handleExportProducts}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-surface-custom-400 hover:text-white transition-all"
          >
            <Download size={14} />
            Exportar CSV
          </button>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-surface-custom-500 text-center py-20 italic font-bold">No hay datos de productos en este período.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topProducts.map((product, i) => (
              <div key={product.product_name} className="flex flex-col gap-3 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-surface-custom-600 italic">RANKING #{i + 1}</span>
                  <span className="text-xs font-black text-emerald-400 italic">{CURRENCY_FORMATTER.format(product.total_revenue)}</span>
                </div>
                <p className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-primary-400 transition-colors">
                  {product.product_name}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-custom-900/50 rounded-full h-1.5 border border-white/5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000"
                      style={{ width: `${(product.total_quantity / maxProductQty) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-surface-custom-400 shrink-0 italic">{product.total_quantity} UNID.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

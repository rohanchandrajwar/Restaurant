import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { formatINR, formatDate, ORDER_STATUS_FLOW } from '@/lib/format';
import type { Order } from '@/types';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { Package, Clock, IndianRupee, TrendingUp, RefreshCw, X } from 'lucide-react';

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 15 seconds
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: status as Order['status'] } : o))
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: status as Order['status'] });
    }
    setUpdating(null);
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  // Stats
  const activeOrders = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
  const totalRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Admin Dashboard</h1>
            <p className="text-stone-500 text-sm mt-1">Manage all orders and update their status</p>
          </div>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-800">{activeOrders.length}</div>
                <div className="text-sm text-stone-500">Active Orders</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-800">{pendingCount}</div>
                <div className="text-sm text-stone-500">Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-800">{formatINR(totalRevenue)}</div>
                <div className="text-sm text-stone-500">Revenue (Delivered)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            All ({orders.length})
          </button>
          {ORDER_STATUS_FLOW.map((status) => {
            const count = orders.filter((o) => o.status === status.key).length;
            return (
              <button
                key={status.key}
                onClick={() => setFilter(status.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status.key
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {status.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Orders table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-stone-100 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <TrendingUp className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No orders in this category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-stone-800">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <OrderStatusBadge status={order.status} />
                      <span className="text-xs text-stone-400">
                        {order.payment_method.toUpperCase()} · {order.payment_status}
                      </span>
                    </div>
                    <div className="text-sm text-stone-500 mb-1">
                      {formatDate(order.created_at)} · {formatINR(order.total_amount)}
                    </div>
                    <div className="text-sm text-stone-600">
                      {order.order_items?.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                    {order.delivery_address && (
                      <div className="text-xs text-stone-400 mt-1">Deliver to: {order.delivery_address}</div>
                    )}
                  </div>

                  {/* Status actions */}
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUS_FLOW.map((status) => (
                      <button
                        key={status.key}
                        onClick={() => updateStatus(order.id, status.key)}
                        disabled={updating === order.id || order.status === status.key}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          order.status === status.key
                            ? 'bg-amber-500 text-white cursor-default'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-40'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-800">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {selectedOrder.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-stone-600">{item.quantity}x {item.name}</span>
                  <span className="text-stone-800">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatINR(selectedOrder.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatINR, formatDate, getStatusInfo, ORDER_STATUS_FLOW } from '@/lib/format';
import type { Order } from '@/types';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { User, Mail, Phone, Package, Clock, ChevronRight, MapPin } from 'lucide-react';

export default function Account() {
  const { user, profile, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ full_name: fullName, phone })
        .eq('id', user!.id);
      await refreshProfile();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  // Order status progress tracker
  function OrderTracker({ order }: { order: Order }) {
    const currentIdx = ORDER_STATUS_FLOW.findIndex((s) => s.key === order.status);
    if (order.status === 'cancelled') return null;

    return (
      <div className="flex items-center gap-1 mt-3">
        {ORDER_STATUS_FLOW.slice(0, 5).map((step, idx) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  idx <= currentIdx
                    ? 'bg-gradient-to-br from-amber-500 to-red-600 text-white'
                    : 'bg-stone-200 text-stone-400'
                }`}
              >
                {idx < currentIdx ? '✓' : idx + 1}
              </div>
              <span className={`text-[10px] font-medium ${idx <= currentIdx ? 'text-stone-700' : 'text-stone-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < 4 && (
              <div className={`h-0.5 flex-1 mx-1 -mt-4 ${idx < currentIdx ? 'bg-amber-500' : 'bg-stone-200'}`} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white text-xl font-bold">
                  {(profile?.full_name ?? 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-stone-800">{profile?.full_name || 'User'}</h2>
                  <p className="text-sm text-stone-500">{profile?.is_admin ? 'Administrator' : 'Customer'}</p>
                </div>
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Full Name</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Phone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Add phone number"
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Mail className="w-4 h-4 text-stone-400" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Phone className="w-4 h-4 text-stone-400" />
                    <span>{profile?.phone || 'Not provided'}</span>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full mt-4 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order History
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-stone-100 rounded-xl h-32 animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border border-stone-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-stone-800">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(order.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">{formatINR(order.total_amount)}</span>
                          </span>
                          {order.delivery_address && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <MapPin className="w-3 h-3" />
                              {order.delivery_address}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-300" />
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-2">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-stone-600">{item.quantity}x {item.name}</span>
                          <span className="text-stone-500">{formatINR(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Status tracker */}
                    <OrderTracker order={order} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

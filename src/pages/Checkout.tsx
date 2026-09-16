import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatINR } from '@/lib/format';
import { UPI_CONFIG } from '@/lib/supabase';
import { CheckCircle, ArrowLeft, Copy, Check } from 'lucide-react';
import type { Order } from '@/types';

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build UPI deep link for QR code
  const upiId = UPI_CONFIG.payeeVpa;
  const upiName = UPI_CONFIG.payeeName;
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${totalAmount}&cu=INR&tn=SpiceGardenOrder`;

  async function placeOrder() {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    try {
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          total_amount: totalAmount,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
          notes: notes || null,
          delivery_address: address || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;
      const newOrder = orderData as Order;

      // Insert order items
      const orderItems = items.map((ci) => ({
        order_id: newOrder.id,
        menu_item_id: ci.menu_item.id,
        name: ci.menu_item.name,
        price: ci.menu_item.price,
        quantity: ci.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderId(newOrder.id);
      clearCart();
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Empty cart guard
  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-[60vh] bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-2">Your cart is empty</h2>
          <Link to="/menu" className="text-amber-600 font-medium hover:underline">Browse menu</Link>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-stone-500 mb-1">
            {paymentMethod === 'upi'
              ? 'Please scan the QR code below to complete your UPI payment.'
              : 'Your order has been placed. Pay on delivery.'}
          </p>
          {orderId && (
            <p className="text-sm text-stone-400 mb-6">Order ID: {orderId.slice(0, 8).toUpperCase()}</p>
          )}

          {paymentMethod === 'upi' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-xl border-2 border-stone-200">
                  <QRCodeSVG value={upiLink} size={200} level="M" />
                </div>
              </div>
              <p className="text-sm text-stone-600 mb-2">Scan with any UPI app (GPay, PhonePe, Paytm, etc.)</p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-stone-500">UPI ID:</span>
                <code className="font-mono text-stone-800 bg-stone-100 px-2 py-0.5 rounded">{upiId}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(upiId); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="text-amber-600 hover:text-amber-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-3 text-lg font-bold text-stone-800">{formatINR(totalAmount)}</div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link
              to="/account"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-semibold shadow-sm hover:shadow-md transition-all"
            >
              View My Orders
            </Link>
            <Link
              to="/menu"
              className="px-6 py-3 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-100 transition-colors"
            >
              Order More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-amber-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to cart
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery details */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h2 className="font-bold text-stone-800 mb-4">Delivery Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Delivery Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    placeholder="Enter your full delivery address..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Order Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Any special instructions for the kitchen..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h2 className="font-bold text-stone-800 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === 'upi'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">UPI</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-stone-800 text-sm">UPI / QR Code</div>
                    <div className="text-xs text-stone-500">Pay with GPay, PhonePe, Paytm, or any UPI app</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-amber-500' : 'border-stone-300'}`}>
                    {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-stone-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">COD</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-stone-800 text-sm">Cash on Delivery</div>
                    <div className="text-xs text-stone-500">Pay with cash when your order arrives</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-amber-500' : 'border-stone-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-20">
              <h2 className="font-bold text-stone-800 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map((ci) => (
                  <div key={ci.menu_item.id} className="flex items-center justify-between text-sm">
                    <span className="text-stone-600 truncate flex-1">
                      {ci.quantity}x {ci.menu_item.name}
                    </span>
                    <span className="text-stone-800 font-medium ml-2">{formatINR(ci.menu_item.price * ci.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatINR(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-stone-800 text-base">
                  <span>Total</span>
                  <span>{formatINR(totalAmount)}</span>
                </div>
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
              )}

              <button
                onClick={placeOrder}
                disabled={submitting || !address.trim()}
                className="mt-6 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Placing Order...' : `Place Order · ${formatINR(totalAmount)}`}
              </button>
              {!address.trim() && (
                <p className="mt-2 text-xs text-stone-400 text-center">Please enter a delivery address</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

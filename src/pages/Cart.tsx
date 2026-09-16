import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/format';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Your cart is empty</h2>
          <p className="text-stone-500 mb-6">Browse our menu and add some delicious dishes to your cart.</p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-semibold shadow-sm hover:shadow-md transition-all"
          >
            Browse Menu
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Your Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm text-stone-500 hover:text-red-600 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((ci) => (
              <div
                key={ci.menu_item.id}
                className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4"
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                  {ci.menu_item.image_url && (
                    <img src={ci.menu_item.image_url} alt={ci.menu_item.name} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${ci.menu_item.is_veg ? 'border-green-600' : 'border-red-600'}`}>
                      {ci.menu_item.is_veg ? <div className="w-1.5 h-1.5 rounded-full bg-green-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                    </div>
                    <h3 className="font-semibold text-stone-800 truncate">{ci.menu_item.name}</h3>
                  </div>
                  <p className="text-sm text-stone-500 mt-0.5">{formatINR(ci.menu_item.price)} each</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(ci.menu_item.id, ci.quantity - 1)}
                    className="w-7 h-7 rounded-md bg-white flex items-center justify-center hover:bg-stone-200 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{ci.quantity}</span>
                  <button
                    onClick={() => updateQuantity(ci.menu_item.id, ci.quantity + 1)}
                    className="w-7 h-7 rounded-md bg-white flex items-center justify-center hover:bg-stone-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-stone-800">{formatINR(ci.menu_item.price * ci.quantity)}</div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(ci.menu_item.id)}
                  className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-20">
              <h2 className="font-bold text-stone-800 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatINR(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-stone-200 pt-3 mt-3 flex justify-between font-bold text-stone-800 text-base">
                  <span>Total</span>
                  <span>{formatINR(totalAmount)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-semibold shadow-sm hover:shadow-md transition-all"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/menu"
                className="mt-3 w-full inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

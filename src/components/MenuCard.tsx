import { Plus, Leaf, Flame } from 'lucide-react';
import type { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/format';

export default function MenuCard({ item }: { item: MenuItem }) {
  const { addToCart } = useCart();

  const spiceColor =
    item.spice_level === 'hot'
      ? 'text-red-600 bg-red-50'
      : item.spice_level === 'medium'
      ? 'text-orange-600 bg-orange-50'
      : 'text-green-600 bg-green-50';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-stone-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            <Flame className="w-12 h-12" />
          </div>
        )}
        {/* Veg/non-veg badge */}
        <div className="absolute top-3 left-3">
          <div
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
              item.is_veg ? 'border-green-600 bg-white' : 'border-red-600 bg-white'
            }`}
          >
            {item.is_veg ? (
              <Leaf className="w-3 h-3 text-green-600" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-red-600" />
            )}
          </div>
        </div>
        {/* Spice level badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium ${spiceColor} flex items-center gap-1`}>
          <Flame className="w-3 h-3" />
          {item.spice_level}
        </div>
        {!item.is_available && (
          <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-stone-800 px-4 py-2 rounded-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-stone-800 text-base leading-tight mb-1">{item.name}</h3>
        <p className="text-sm text-stone-500 line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-stone-800">{formatINR(item.price)}</span>
          <button
            onClick={() => addToCart(item)}
            disabled={!item.is_available}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { MenuItem } from '@/types';
import MenuCard from '@/components/MenuCard';
import { Search } from 'lucide-react';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Rice', 'Breads', 'Desserts', 'Beverages'];

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .then(({ data }) => {
        setItems((data as MenuItem[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (vegOnly && !item.is_veg) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase()) &&
          !(item.description ?? '').toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [items, category, search, vegOnly]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-800 to-stone-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Our Menu</h1>
          <p className="text-stone-400">Explore our authentic Indian dishes — freshly prepared with traditional spices</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Veg toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              vegOnly
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${vegOnly ? 'border-green-600' : 'border-stone-300'}`}>
              {vegOnly && <div className="w-2 h-2 rounded-full bg-green-600" />}
            </div>
            Veg Only
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300 hover:text-amber-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-stone-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-400 text-lg">No dishes found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

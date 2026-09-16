import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Star, Clock, Award, ArrowRight, Utensils, Truck, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { MenuItem } from '@/types';
import MenuCard from '@/components/MenuCard';

export default function Home() {
  const [featured, setFeatured] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .limit(6)
      .then(({ data }) => {
        setFeatured((data as MenuItem[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/29148133/pexels-photo-29148133.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
            alt="Indian food"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/70 to-stone-900/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm mb-6">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-amber-200 text-sm font-medium">Rated #1 Indian Restaurant in the City</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              Authentic Indian Flavors, <span className="text-amber-400">Delivered to Your Door</span>
            </h1>
            <p className="text-lg text-stone-300 leading-relaxed mb-8">
              From tandoor-grilled kebabs to rich, creamy curries — every dish is crafted with traditional spices
              and recipes passed down through generations. Order online and pay with UPI.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Explore Menu
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold border border-white/20 hover:bg-white/20 transition-all"
              >
                Order Now
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold text-amber-400">50+</div>
                <div className="text-sm text-stone-400">Authentic Dishes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-400">15k+</div>
                <div className="text-sm text-stone-400">Orders Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-400">4.8</div>
                <div className="text-sm text-stone-400">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Utensils className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 text-sm">Authentic Recipes</h3>
                <p className="text-sm text-stone-500">Traditional cooking methods</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 text-sm">Fast Delivery</h3>
                <p className="text-sm text-stone-500">30-45 min to your door</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 text-sm">UPI Payments</h3>
                <p className="text-sm text-stone-500">Pay securely with QR code</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured dishes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4" />
              Chef's Specials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-3">Most Loved Dishes</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              Discover the flavors that keep our customers coming back for more
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-stone-100 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-amber-500 text-amber-600 font-semibold hover:bg-amber-50 transition-colors"
            >
              View Full Menu
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3822749/pexels-photo-3822749.jpeg?auto=compress&cs=tinysrgb&w=900&h=700"
                alt="Restaurant interior"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-lg p-6 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-800">25 Years</div>
                    <div className="text-sm text-stone-500">of culinary excellence</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4" />
                Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
                A Legacy of Spice and Tradition
              </h2>
              <p className="text-stone-600 leading-relaxed mb-4">
                For over 25 years, Spice Garden has been serving authentic Indian cuisine made from
                hand-ground spices and family recipes. Our chefs bring the flavors of North and South India
                together under one roof.
              </p>
              <p className="text-stone-600 leading-relaxed mb-6">
                Every dish is prepared fresh to order, using locally sourced ingredients and traditional
                cooking techniques — from our tandoor oven to our slow-cooked curries.
              </p>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm text-stone-700 font-medium">Fresh ingredients daily</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm text-stone-700 font-medium">Hand-ground spices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Taste the Best Indian Food in Town?
          </h2>
          <p className="text-amber-100 text-lg mb-8">
            Browse our menu, add to cart, and pay with UPI — it's that simple.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-amber-600 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Order Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

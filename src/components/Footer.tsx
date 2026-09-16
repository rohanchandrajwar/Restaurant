import { Flame, MapPin, Phone, Clock, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-white">Spice Garden</span>
                <span className="text-[10px] text-amber-500 font-medium tracking-widest uppercase">Indian Kitchen</span>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Authentic Indian cuisine crafted with traditional spices and recipes passed down through generations.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-amber-600 flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-amber-600 flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-amber-600 flex items-center justify-center transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                <span>42 MG Road, Bengaluru, Karnataka 560001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>+91 80 1234 5678</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Hours</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Mon - Thu: 11am - 10pm</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Fri - Sat: 11am - 11pm</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Sunday: 12pm - 10pm</span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/menu" className="hover:text-amber-500 transition-colors">Full Menu</a></li>
              <li><a href="/cart" className="hover:text-amber-500 transition-colors">Your Cart</a></li>
              <li><a href="/login" className="hover:text-amber-500 transition-colors">Sign In</a></li>
              <li><a href="/account" className="hover:text-amber-500 transition-colors">My Orders</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-10 pt-6 text-center text-sm text-stone-500">
          <p>&copy; {new Date().getFullYear()} Spice Garden. All rights reserved. Made with passion for Indian cuisine.</p>
        </div>
      </div>
    </footer>
  );
}

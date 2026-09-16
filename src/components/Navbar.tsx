import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu as MenuIcon, X, Flame } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-amber-600'
        : 'text-stone-600 hover:text-amber-600'
    }`;

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold text-stone-800 tracking-tight">Spice Garden</span>
              <span className="text-[10px] text-amber-600 font-medium tracking-widest uppercase">Indian Kitchen</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/menu" className={navLinkClass}>
              Menu
            </NavLink>
            {user && (
              <NavLink to="/account" className={navLinkClass}>
                My Account
              </NavLink>
            )}
            {profile?.is_admin && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-stone-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-in fade-in zoom-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/account"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <User className="w-4 h-4 text-stone-600" />
                  <span className="text-sm font-medium text-stone-700">
                    {profile?.full_name || 'Account'}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5 text-stone-600" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:opacity-90 transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200 py-4 space-y-2">
            <NavLink to="/" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-amber-50 text-amber-600' : 'text-stone-600 hover:bg-stone-50'}`} end onClick={() => setMobileOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/menu" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-amber-50 text-amber-600' : 'text-stone-600 hover:bg-stone-50'}`} onClick={() => setMobileOpen(false)}>
              Menu
            </NavLink>
            {user && (
              <NavLink to="/account" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-amber-50 text-amber-600' : 'text-stone-600 hover:bg-stone-50'}`} onClick={() => setMobileOpen(false)}>
                My Account
              </NavLink>
            )}
            {profile?.is_admin && (
              <NavLink to="/admin" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-amber-50 text-amber-600' : 'text-stone-600 hover:bg-stone-50'}`} onClick={() => setMobileOpen(false)}>
                Admin
              </NavLink>
            )}
            {user ? (
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50"
              >
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

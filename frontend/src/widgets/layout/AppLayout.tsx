import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBasket, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Settings, 
  Home, 
  Package, 
  ClipboardList, 
  Users, 
  MapPin, 
  FolderTree,
  ChefHat
} from 'lucide-react';
import { useAuthStore } from '@/shared/store/auth-store';
import { useCartStore, getTotalItems } from '@/shared/store/cart-store';
import { getNavItemsForRole } from '@/shared/config/navigation';
import type { UserRole } from '@/shared/config/roles';

interface AppLayoutProps {
  children: React.ReactNode;
}

const iconMap: Record<string, any> = {
  'Home': Home,
  'Products': Package,
  'Ingredients': ChefHat,
  'Categories': FolderTree,
  'Orders': ClipboardList,
  'Users': Users,
  'Addresses': MapPin,
  'Profile': UserIcon,
  'Cart': ShoppingBasket,
  'System Config': Settings,
  'Dashboard': LayoutDashboard,
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const totalItems = getTotalItems(useCartStore((s) => s.items));

  const navItems = getNavItemsForRole(user?.role as UserRole | undefined | null);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  // Separate client-facing links from management links
  const clientLinks = navItems.filter(item => ['Home', 'Products'].includes(item.label));
  const adminLinks = navItems.filter(item => !['Home', 'Products', 'Cart', 'Profile'].includes(item.label));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAdminSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-custom-950 text-surface-custom-200">
      {/* Admin Sidebar / Drawer */}
      <AnimatePresence>
        {adminSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdminSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-surface-custom-900/80 backdrop-blur-2xl z-[70] shadow-2xl border-r border-white/10 p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                    <LayoutDashboard size={22} />
                  </div>
                  <span className="text-xl font-bold text-white tracking-tight">Panel Admin</span>
                </div>
                <button 
                  onClick={() => setAdminSidebarOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-surface-custom-400"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-grow space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 mb-4 px-4">Gestión de Tienda</p>
                {adminLinks.map((item) => {
                  const Icon = iconMap[item.label] || Package;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-900/20 translate-x-2'
                          : 'text-surface-custom-400 hover:bg-white/5 hover:text-white hover:shadow-sm'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="mt-auto pt-8 border-t border-white/5">
                <div className="bg-white/5 rounded-2xl p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 gradient-primary rounded-xl shadow-sm flex items-center justify-center text-white font-bold">
                    {user?.first_name?.[0]}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user?.first_name}</p>
                    <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">{user?.role}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Premium Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-2 px-4' : 'py-4 px-6'
        }`}
      >
        <nav
          className={`max-w-7xl mx-auto transition-all duration-300 ${
            scrolled ? 'glass rounded-2xl px-4 py-2 shadow-lg shadow-black/20' : 'bg-transparent py-2'
          }`}
        >
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-transform">
                  <ShoppingBasket size={24} />
                </div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary-400 transition-colors">
                  Food<span className="text-primary-400">Store</span>
                </span>
              </Link>

              {/* Desktop Nav - Public */}
              <div className="hidden md:flex items-center space-x-1">
                {clientLinks.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? 'text-primary-400 bg-primary-400/10'
                          : 'text-surface-custom-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                
                {/* Admin Trigger */}
                {isAdmin && (
                  <button
                    onClick={() => setAdminSidebarOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 transition-all ml-2"
                  >
                    <Menu size={18} />
                    <span>Administración</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {user ? (
                <div className="flex items-center space-x-1">
                  <Link
                    to="/cart"
                    className="relative p-2.5 rounded-xl text-surface-custom-400 hover:bg-primary-400/10 hover:text-primary-400 transition-all group"
                  >
                    <ShoppingBasket size={22} className="group-hover:scale-110 transition-transform" />
                    <AnimatePresence>
                      {totalItems > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 bg-secondary-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-surface-custom-900 shadow-sm"
                        >
                          {totalItems > 99 ? '99+' : totalItems}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                  
                  <div className="h-6 w-px bg-white/10 mx-2" />
                  
                  <div className="hidden sm:flex flex-col items-end mr-3">
                    <span className="text-xs font-bold text-white">{user.first_name}</span>
                    <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">{user.role}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl text-surface-custom-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="px-5 py-2 text-sm font-bold text-surface-custom-400 hover:bg-white/5 rounded-xl transition-all">
                    Login
                  </Link>
                  <Link to="/register" className="px-5 py-2 gradient-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all active:scale-95">
                    Empieza Ahora
                  </Link>
                </div>
              )}

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl text-surface-custom-300 bg-white/10 ml-2"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Content (Midnight Style) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] md:hidden"
          >
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setMobileMenuOpen(false)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mt-24 mx-4 bg-surface-custom-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = iconMap[item.label] || Package;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all ${
                          isActive ? 'bg-primary-500 text-white shadow-lg' : 'text-surface-custom-400 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 p-4 bg-red-400/10 text-red-400 rounded-2xl font-bold"
              >
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-16">
        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-custom-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white">
                <ShoppingBasket size={18} />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">FoodStore</span>
            </div>
            <p className="text-sm text-surface-custom-500 font-medium tracking-tight">
              &copy; {new Date().getFullYear()} FoodStore. Midnight Edition.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

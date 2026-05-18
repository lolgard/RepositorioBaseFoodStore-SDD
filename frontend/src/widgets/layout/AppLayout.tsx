import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
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
  ChefHat,
  Sidebar,
  MoreVertical
} from 'lucide-react';
import { useAuthStore } from '@/shared/store/auth-store';
import { useCartStore, getTotalItems } from '@/shared/store/cart-store';
import { getNavItemsForRole } from '@/shared/config/navigation';
import type { UserRole } from '@/shared/config/roles';
import { useNotifications } from '@/shared/lib/useNotifications';

interface AppLayoutProps {
  children: React.ReactNode;
}

const iconMap: Record<string, any> = {
  'Home': Home,
  'Catálogo': Package,
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

const labelTranslations: Record<string, string> = {
  'Home': 'Inicio',
  'Catálogo': 'Catálogo',
  'Ingredients': 'Ingredientes',
  'Categories': 'Categorías',
  'Orders': 'Mis Pedidos',
  'Users': 'Usuarios',
  'Addresses': 'Direcciones',
  'Profile': 'Mi Perfil',
  'Cart': 'Mi Carrito',
  'System Config': 'Configuración',
  'Dashboard': 'Estadísticas',
};

export function AppLayout({ children }: AppLayoutProps) {
  useNotifications();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const totalItems = getTotalItems(useCartStore((s) => s.items));
  const navItems = getNavItemsForRole(user?.role as UserRole | undefined | null);

  // Responsive state management
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(false);
      } else {
        // Default desktop behavior is expanded
        setIsExpanded(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menus on navigation change
  useEffect(() => {
    setMobileOpen(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
  };

  // Group NavItems
  const shopLabels = ['Home', 'Catálogo', 'Cart'];
  const accountLabels = ['Profile', 'Addresses', 'Orders'];
  const adminLabels = ['Dashboard', 'Users', 'Ingredients', 'Categories', 'System Config'];

  const shopItems = navItems.filter((item) => shopLabels.includes(item.label));
  const accountItems = navItems.filter((item) => accountLabels.includes(item.label));
  const adminItems = navItems.filter((item) => adminLabels.includes(item.label));

  const renderNavGroup = (title: string, items: typeof navItems) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1 select-none">
        {isExpanded ? (
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-custom-500 mb-3 px-4 mt-6">
            {title}
          </p>
        ) : (
          <div className="border-t border-white/5 my-4 w-8 mx-auto" />
        )}
        
        {items.map((item) => {
          const Icon = iconMap[item.label] || Package;
          const isActive = location.pathname === item.path;
          let label = labelTranslations[item.label] || item.label;
          if (item.label === 'Orders' && user?.role !== 'CLIENTE') {
            label = 'Pedidos';
          }
          const isCart = item.label === 'Cart';

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              title={!isExpanded ? label : undefined}
              className={`flex items-center rounded-xl font-bold transition-all relative group/item ${
                isExpanded ? 'px-4 py-3 space-x-3 mx-2' : 'p-3.5 justify-center mx-2'
              } ${
                isActive
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-surface-custom-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {/* Active Left Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 gradient-primary rounded-full" />
              )}
              
              <div className="relative flex items-center justify-center shrink-0">
                <Icon size={20} className="shrink-0 transition-transform group-hover/item:scale-105" />
                {isCart && totalItems > 0 && !isExpanded && (
                  <span className="absolute -top-1.5 -right-1.5 bg-secondary-500 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-surface-custom-900 shadow-sm animate-pulse">
                    {totalItems}
                  </span>
                )}
              </div>

              {isExpanded && (
                <span className="text-sm font-medium tracking-tight truncate flex-grow">
                  {label}
                </span>
              )}

              {isCart && totalItems > 0 && isExpanded && (
                <span className="bg-secondary-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 ml-auto shrink-0 shadow-sm">
                  {totalItems}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between py-6">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className={`flex items-center justify-between px-4 ${isExpanded ? '' : 'justify-center'}`}>
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-transform shrink-0">
              <ShoppingBasket size={22} />
            </div>
            {isExpanded && (
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary-400 transition-colors">
                Food<span className="text-primary-400">Store</span>
              </span>
            )}
          </Link>
          
          {isExpanded && !isMobile && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-white/5 text-surface-custom-400 hover:text-white rounded-lg transition-all"
              title="Colapsar menú"
            >
              <Sidebar size={18} />
            </button>
          )}
        </div>

        {/* Expand Trigger when collapsed */}
        {!isExpanded && !isMobile && (
          <div className="flex justify-center">
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 hover:bg-white/5 text-surface-custom-400 hover:text-white rounded-lg transition-all"
              title="Expandir menú"
            >
              <Sidebar size={18} />
            </button>
          </div>
        )}

        {/* Scrollable Navigation */}
        <nav className="space-y-4 px-1 max-h-[68vh] overflow-y-auto custom-scrollbar">
          {renderNavGroup('Tienda', shopItems)}
          {renderNavGroup('Mi Cuenta', accountItems)}
          {renderNavGroup('Administración', adminItems)}
        </nav>
      </div>

      {/* Bottom Profile Section */}
      <div className="px-2 relative">
        <div className="h-px bg-white/5 my-4 mx-2" />
        
        <div 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`flex items-center rounded-xl p-2.5 cursor-pointer hover:bg-white/5 transition-all text-left relative ${
            isExpanded ? 'space-x-3 justify-between' : 'justify-center'
          }`}
        >
          <div className="flex items-center space-x-3 min-w-0">
            {user?.image_url ? (
              <img
                src={user.image_url}
                alt="Foto de perfil"
                className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name}`;
                }}
              />
            ) : (
              <div className="w-10 h-10 gradient-primary rounded-xl shadow-md flex items-center justify-center text-white font-bold text-base shrink-0 select-none">
                {user?.first_name?.[0]}
              </div>
            )}
            
            {isExpanded && (
              <div className="min-w-0 flex-grow select-none">
                <p className="text-sm font-bold text-white truncate leading-tight">{user?.first_name}</p>
                <p className="text-[9px] text-primary-400 font-bold uppercase tracking-widest leading-none mt-1">
                  {user?.role === 'CLIENTE' ? 'Cliente' : user?.role}
                </p>
              </div>
            )}
          </div>
          
          {isExpanded && (
            <MoreVertical size={16} className="text-surface-custom-500 shrink-0" />
          )}
        </div>

        {/* Profile Menu Drop-up */}
        <AnimatePresence>
          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setShowProfileMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`absolute z-50 bg-surface-custom-900 border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col space-y-1 w-48 ${
                  isExpanded ? 'left-2 bottom-16' : 'left-14 bottom-16'
                }`}
              >
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-surface-custom-300 hover:bg-white/5 hover:text-white transition-all text-left"
                >
                  <UserIcon size={16} />
                  <span>Ver Mi Perfil</span>
                </button>
                
                <div className="h-px bg-white/5 my-1" />
                
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all text-left"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-surface-custom-950 text-surface-custom-200 overflow-x-hidden">
      
      {/* desktop sidebar */}
      {!isMobile && (
        <motion.aside
          animate={{ width: isExpanded ? 256 : 80 }}
          transition={{ type: 'spring', damping: 22, stiffness: 170 }}
          className="fixed top-0 bottom-0 left-0 z-40 bg-[#0c0c0e]/80 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0 overflow-visible"
        >
          {sidebarContent}
        </motion.aside>
      )}

      {/* mobile drawer header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#0c0c0e]/80 backdrop-blur-md border-b border-white/5 z-40 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 hover:bg-white/5 text-surface-custom-300 hover:text-white rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white shadow-md transform group-hover:rotate-12 transition-transform">
                <ShoppingBasket size={18} />
              </div>
              <span className="text-base font-bold tracking-tight text-white group-hover:text-primary-400 transition-colors">
                FoodStore
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {user?.role === 'CLIENTE' && (
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-surface-custom-400 hover:bg-primary-400/10 hover:text-primary-400 transition-all"
              >
                <ShoppingBasket size={20} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-secondary-500 text-white text-[8px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border border-surface-custom-900 shadow-sm"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )}

            <Link
              to="/profile"
              className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-sm"
            >
              {user?.image_url ? (
                <img
                  src={user.image_url}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name}`;
                  }}
                />
              ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center text-white font-bold text-xs">
                  {user?.first_name?.[0]}
                </div>
              )}
            </Link>
          </div>
        </header>
      )}

      {/* mobile drawer sliding container */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
            />
            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-[#0c0c0e] z-[60] shadow-2xl border-r border-white/10"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-surface-custom-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Force expanded view for mobile drawer */}
              {(() => {
                const prevExpanded = isExpanded;
                // Temporarily force true for rendering
                const content = sidebarContent;
                return (
                  <div className="h-full flex flex-col justify-between py-6">
                    {/* Re-render content with forced expanded configuration */}
                    <div className="space-y-6">
                      {/* Mobile Brand Header */}
                      <div className="flex items-center px-4">
                        <Link to="/" className="flex items-center space-x-3 group">
                          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                            <ShoppingBasket size={22} />
                          </div>
                          <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary-400 transition-colors">
                            Food<span className="text-primary-400">Store</span>
                          </span>
                        </Link>
                      </div>

                      {/* Scrollable Navigation */}
                      <nav className="space-y-4 px-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {renderNavGroup('Tienda', shopItems)}
                        {renderNavGroup('Mi Cuenta', accountItems)}
                        {renderNavGroup('Administración', adminItems)}
                      </nav>
                    </div>

                    {/* Bottom profile info */}
                    <div className="px-2 relative">
                      <div className="h-px bg-white/5 my-4 mx-2" />
                      
                      <div 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center rounded-xl p-2.5 cursor-pointer hover:bg-white/5 transition-all text-left relative space-x-3 justify-between"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {user?.image_url ? (
                            <img
                              src={user.image_url}
                              alt="Foto de perfil"
                              className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0 shadow-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name}`;
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 gradient-primary rounded-xl shadow-md flex items-center justify-center text-white font-bold text-base shrink-0 select-none">
                              {user?.first_name?.[0]}
                            </div>
                          )}
                          
                          <div className="min-w-0 flex-grow select-none">
                            <p className="text-sm font-bold text-white truncate leading-tight">{user?.first_name}</p>
                            <p className="text-[9px] text-primary-400 font-bold uppercase tracking-widest leading-none mt-1">
                              {user?.role === 'CLIENTE' ? 'Cliente' : user?.role}
                            </p>
                          </div>
                        </div>
                        
                        <MoreVertical size={16} className="text-surface-custom-500 shrink-0" />
                      </div>

                      {/* Drop-up profile items */}
                      <AnimatePresence>
                        {showProfileMenu && (
                          <>
                            <div 
                              className="fixed inset-0 z-40 bg-transparent" 
                              onClick={() => setShowProfileMenu(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-2 bottom-16 z-50 bg-surface-custom-900 border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col space-y-1 w-48"
                            >
                              <button
                                onClick={() => {
                                  setShowProfileMenu(false);
                                  navigate('/profile');
                                }}
                                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-surface-custom-300 hover:bg-white/5 hover:text-white transition-all text-left"
                              >
                                <UserIcon size={16} />
                                <span>Ver Mi Perfil</span>
                              </button>
                              
                              <div className="h-px bg-white/5 my-1" />
                              
                              <button
                                onClick={() => {
                                  setShowProfileMenu(false);
                                  handleLogout();
                                }}
                                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all text-left"
                              >
                                <LogOut size={16} />
                                <span>Cerrar Sesión</span>
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <motion.div
        animate={{ 
          paddingLeft: isMobile ? 0 : (isExpanded ? 256 : 80),
          paddingTop: isMobile ? 64 : 0
        }}
        transition={{ type: 'spring', damping: 22, stiffness: 170 }}
        className="flex-grow min-w-0 flex flex-col min-h-screen"
      >
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer inside the main viewport */}
        <footer className="bg-[#08080a] border-t border-white/5 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-center sm:text-left">
              <div className="flex items-center space-x-2 select-none">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white shadow-sm">
                  <ShoppingBasket size={18} />
                </div>
                <span className="font-bold text-base text-white tracking-tight">FoodStore</span>
              </div>
              <p className="text-xs text-surface-custom-500 font-medium tracking-tight">
                &copy; {new Date().getFullYear()} FoodStore. Midnight Edition.
              </p>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}

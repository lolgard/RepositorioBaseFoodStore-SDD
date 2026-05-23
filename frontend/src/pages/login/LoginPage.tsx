import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, ShoppingBasket, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/shared/store/auth-store';
import { getDefaultRouteForRole } from '@/shared/lib/redirect-by-role';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Read updated user from store after login
      const currentUser = useAuthStore.getState().user;
      const redirectTo = searchParams.get('redirect') || getDefaultRouteForRole(currentUser?.role);
      navigate(redirectTo, { replace: true });
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="fixed inset-0 flex bg-surface-custom-950 overflow-hidden">
      {/* Left Pane - Branding & Inspiration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-custom-900 items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=1200&auto=format&fit=crop" 
            alt="Food background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950/90 to-surface-custom-950/100" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg space-y-8"
        >
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white shadow-2xl">
            <ShoppingBasket size={32} />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Bienvenido a <br />
              <span className="text-primary-400">FoodStore Premium</span>
            </h1>
            <p className="text-surface-custom-400 text-lg leading-relaxed">
              Ingresá para gestionar tus pedidos y descubrir la mejor selección de productos frescos de la zona.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-primary-400">
                <ShieldCheck size={20} />
                <span className="font-bold text-sm uppercase tracking-widest">Seguro</span>
              </div>
              <p className="text-xs text-surface-custom-500">Protección de datos de grado bancario.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-primary-400">
                <ArrowRight size={20} />
                <span className="font-bold text-sm uppercase tracking-widest">Rápido</span>
              </div>
              <p className="text-xs text-surface-custom-500">Login en un solo paso y checkout veloz.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24 bg-surface-custom-950">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-4xl font-bold tracking-tight text-white">Iniciar Sesión</h2>
            <p className="text-surface-custom-500 font-medium">
              Es un gusto tenerte de vuelta.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-2xl text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-custom-500 ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-custom-600 group-focus-within:text-primary-400 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    placeholder="ejemplo@correo.com"
                    className="input-premium pl-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-surface-custom-500">Contraseña</label>
                  <a href="#" className="text-xs font-bold text-primary-400 hover:text-primary-300">Olvidé mi clave</a>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-custom-600 group-focus-within:text-primary-400 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError(); }}
                    placeholder="••••••••"
                    className="input-premium pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-custom-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-premium gradient-primary text-white py-4 flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-surface-custom-500">
            ¿No tenés una cuenta?{' '}
            <Link to="/register" className="font-bold text-primary-400 hover:text-primary-300 hover:underline">
              Registrate gratis
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

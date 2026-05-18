import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, ShoppingBasket, ShieldCheck, Sparkles, Clock, MapPin, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/shared/store/auth-store';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    clearError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      return;
    }
    try {
      await register({ ...formData, role: 'CLIENTE' });
      navigate('/login', { replace: true });
    } catch {
      // Error handles by store
    }
  };

  const passwordsMatch = formData.password === confirmPassword || confirmPassword === '';

  return (
    <div className="fixed inset-0 flex bg-surface-custom-950 overflow-hidden">
      {/* Left Pane - Branding & Inspiration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-custom-900 items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop" 
            alt="Fresh ingredients" 
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
              Unite a la <br />
              <span className="text-primary-400">Revolución Gourmet</span>
            </h1>
            <p className="text-surface-custom-400 text-lg leading-relaxed">
              Creá una cuenta hoy mismo y empezá a disfrutar de los beneficios exclusivos para miembros de FoodStore.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 pt-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-primary-400">
                <Sparkles size={18} />
                <span className="font-bold text-xs uppercase tracking-widest">Exclusivo</span>
              </div>
              <p className="text-[11px] text-surface-custom-500">Acceso a preventas y ofertas especiales.</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-primary-400">
                <Clock size={18} />
                <span className="font-bold text-xs uppercase tracking-widest">Historial</span>
              </div>
              <p className="text-[11px] text-surface-custom-500">Visualizá el detalle completo de tus consumos.</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-primary-400">
                <MapPin size={18} />
                <span className="font-bold text-xs uppercase tracking-widest">Práctico</span>
              </div>
              <p className="text-[11px] text-surface-custom-500">Guardá múltiples direcciones para tu delivery.</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-primary-400">
                <ShieldCheck size={18} />
                <span className="font-bold text-xs uppercase tracking-widest">Soporte</span>
              </div>
              <p className="text-[11px] text-surface-custom-500">Atención y seguimiento prioritario en tus envíos.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-surface-custom-950 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-4xl font-bold tracking-tight text-white">Crear Cuenta</h2>
            <p className="text-surface-custom-500 font-medium">
              Completá tus datos para empezar a comprar.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-custom-500 ml-1">Nombre</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-custom-600 group-focus-within:text-primary-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange('first_name')}
                    placeholder="Juan"
                    className="input-premium pl-12 py-3"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-custom-500 ml-1">Apellido</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange('last_name')}
                  placeholder="Pérez"
                  className="input-premium py-3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-surface-custom-500 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-custom-600 group-focus-within:text-primary-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="juan@ejemplo.com"
                  className="input-premium pl-12 py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-custom-500 ml-1">Contraseña</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-custom-600 group-focus-within:text-primary-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange('password')}
                    placeholder="•••••"
                    className="input-premium pl-12 pr-12 py-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-custom-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-custom-500 ml-1">Confirmar</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-custom-600 group-focus-within:text-primary-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                    placeholder="•••••"
                    className={`input-premium pl-12 pr-12 py-3 ${!passwordsMatch ? 'border-red-500/40 text-red-300 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-custom-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwordsMatch}
              className="w-full btn-premium gradient-primary text-white py-4 flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 disabled:opacity-70 mt-4"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Crear Cuenta Gratis</span>
                  <UserPlus size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-surface-custom-500">
            ¿Ya tenés una cuenta?{' '}
            <Link to="/login" className="font-bold text-primary-400 hover:text-primary-300 hover:underline">
              Iniciar Sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

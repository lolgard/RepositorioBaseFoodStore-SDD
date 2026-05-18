import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBasket, ArrowRight, Star, Clock, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-24 pb-20 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold uppercase tracking-wider border border-primary-500/20">
              <Star size={14} className="fill-primary-400" />
              <span>Calidad Gourmet Garantizada</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Sabor real, <br />
              <span className="text-gradient">directo a tu mesa.</span>
            </h1>
            
            <p className="text-lg text-surface-custom-400 max-w-lg leading-relaxed">
              Descubrí la selección más exclusiva de productos frescos y gourmet. 
              Calidad premium seleccionada a mano para los paladares más exigentes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/products')}
                className="btn-premium gradient-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary-500/20 flex items-center justify-center space-x-2 group"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-surface-custom-950 bg-surface-custom-800 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=food${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-surface-custom-500">
                <span className="font-bold text-white">+2.5k</span> clientes felices
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
            <div className="relative glass p-4 rounded-[2.5rem] shadow-2xl rotate-3">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop" 
                alt="Delicious Food" 
                className="rounded-[2rem] w-full h-[500px] object-cover opacity-80"
              />
              <div className="absolute -bottom-6 -left-6 glass p-6 rounded-3xl shadow-2xl -rotate-6 animate-float">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-secondary-500/20 text-secondary-400 rounded-2xl">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-surface-custom-500 font-bold uppercase tracking-tighter">Entrega Rápida</p>
                    <p className="text-sm font-bold text-white">En menos de 45 min</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            icon: ShoppingBasket, 
            title: 'Productos Frescos', 
            desc: 'Seleccionados diariamente de los mejores productores locales.',
            color: 'bg-emerald-500/10 text-emerald-400'
          },
          { 
            icon: ShieldCheck, 
            title: 'Pago Seguro', 
            desc: 'Tus transacciones están protegidas con los más altos estándares.',
            color: 'bg-blue-500/10 text-blue-400'
          },
          { 
            icon: Star, 
            title: 'Atención Premium', 
            desc: 'Soporte personalizado para cada uno de nuestros clientes.',
            color: 'bg-amber-500/10 text-amber-400'
          }
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="card-premium p-8 space-y-4"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 ${feature.color}`}>
              <feature.icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-white">{feature.title}</h3>
            <p className="text-surface-custom-400 leading-relaxed text-sm">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Featured CTA */}
      <section className="relative rounded-[3rem] overflow-hidden gradient-primary p-12 md:p-24 text-center space-y-8 shadow-2xl shadow-primary-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <h2 className="text-4xl md:text-5xl font-bold text-white max-w-2xl mx-auto leading-tight">
          ¿Listo para elevar tu experiencia culinaria?
        </h2>
        <p className="text-primary-50/80 text-lg max-w-xl mx-auto">
          Unite a miles de amantes de la cocina que ya disfrutan de la calidad premium de FoodStore.
        </p>
        <button 
          onClick={() => navigate('/products')}
          className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-primary-50 hover:-translate-y-1 transition-all"
        >
          Empezar a Comprar
        </button>
      </section>
    </div>
  );
}

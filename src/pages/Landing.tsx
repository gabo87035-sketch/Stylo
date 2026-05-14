import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, Sparkles, User, ArrowRight } from 'lucide-react';

export default function Landing() {
  const { profile } = useAuth();
  const options = [
    {
      id: 'cliente',
      title: 'Cliente',
      description: 'Reserva tu cita en segundos',
      icon: User,
      color: 'bg-blue-600',
      textColor: 'text-blue-100',
      path: '/login?role=cliente',
    },
    {
      id: 'barbero',
      title: 'Barbero',
      description: 'Gestiona tu barbería urbana',
      icon: Scissors,
      color: 'bg-zinc-900',
      textColor: 'text-zinc-100',
      path: '/login?role=barbero',
    },
    {
      id: 'salonera',
      title: 'Salonera',
      description: 'Tu agenda estética premium',
      icon: Sparkles,
      color: 'bg-pink-400',
      textColor: 'text-pink-50',
      path: '/login?role=salonera',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-900/40 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-900/20 blur-[150px] rounded-full delay-1000 animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-16"
      >
        <div className="inline-block p-5 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10 mb-8 shadow-2xl shadow-white/5">
          <Scissors className="w-14 h-14 text-white" />
        </div>
        <h1 className="text-6xl md:text-8xl font-bebas tracking-[0.2em] mb-6 uppercase text-white shadow-sm">
          STEY<span className="text-barber-gold">LOOK</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-2xl font-poppins font-light max-w-xl mx-auto leading-relaxed">
          El santuario para la <span className="text-white italic">belleza exclusiva</span> y el cuidado moderno.
        </p>

        {profile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10"
          >
            <Link
              to={profile.tipo === 'cliente' ? '/cliente' : profile.tipo === 'barbero' ? '/barbero' : '/salon'}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-white/20"
            >
              Ir a mi Panel <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 mb-12"
      >
        Selecciona tu experiencia
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl px-4">
        {options.map((opt, idx) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + idx * 0.15, duration: 0.8, ease: "easeOut" }}
          >
            <Link 
              to={opt.path}
              className={`group relative block h-80 overflow-hidden rounded-[2rem] p-10 ${opt.color} transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl active:scale-95`}
            >
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <opt.icon className="w-40 h-40" />
              </div>
              
              <div className="relative h-full flex flex-col justify-end">
                <div className="mb-4 p-4 w-fit rounded-2xl bg-black/10 backdrop-blur-md border border-white/10">
                  <opt.icon className={`w-8 h-8 ${opt.textColor}`} />
                </div>
                <h3 className={`text-4xl font-bold ${opt.textColor} mb-2 tracking-tight`}>
                  {opt.title}
                </h3>
                <p className={`text-base ${opt.textColor} opacity-70 font-medium leading-tight max-w-[200px]`}>
                  {opt.description}
                </p>
                <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                  Entrar <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-20 text-zinc-600 text-[10px] font-bold tracking-[0.5em] uppercase"
      >
        EST. 2026 Steylook Global Group
      </motion.div>
    </div>

  );
}

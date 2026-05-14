import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signInAsDemo } = useAuth();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = (searchParams.get('role') || 'cliente') as 'cliente' | 'barbero' | 'salonera';

  const getRolePath = () => {
    if (role === 'barbero') return '/barbero';
    if (role === 'salonera') return '/salon';
    return '/cliente';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const pseudoEmail = `${telefono.replace(/\s+/g, '')}@steylook.com`;
    const pseudoPassword = `pass_${telefono.replace(/\s+/g, '')}`;
    const dest = getRolePath();

    try {
      await signInWithEmailAndPassword(auth, pseudoEmail, pseudoPassword);
      navigate(dest);
    } catch (err: any) {
      console.warn("Login fallido, intentando entrar como invitado...", err.message);
      try {
        await signInAnonymously(auth);
        signInAsDemo(nombre || 'Usuario', telefono, role);
        navigate(dest);
      } catch (anonErr) {
        signInAsDemo(nombre || 'Usuario', telefono, role);
        navigate(dest);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs uppercase tracking-widest font-semibold">Volver</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tighter mb-2">Bienvenido</h2>
            <p className="text-zinc-400 font-light">Entra como <span className="text-white font-medium capitalize">{role === 'salonera' ? 'Estilista' : role}</span></p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 ml-4">Tu Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre completo"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-light"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 ml-4">Teléfono</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 600 000 000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-light"
                required
              />
            </div>

            {error && <p className="text-red-400 text-xs px-4">{error}</p>}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : <><LogIn className="w-5 h-5" /> Acceder</>}
            </button>
          </form>

          <p className="text-center mt-10 text-zinc-500 text-sm font-light">
            ¿Es tu primera vez? <Link to={`/register?role=${role}`} className="text-white font-medium hover:underline">Regístrate aquí</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

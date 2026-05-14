import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { signInAsDemo } = useAuth();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = (searchParams.get('role') || 'cliente') as 'cliente' | 'barbero' | 'salonera';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPhone = telefono.replace(/\s+/g, '');
    const pseudoEmail = `${cleanPhone}@steylook.com`;
    const pseudoPassword = `pass_${cleanPhone}`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, pseudoEmail, pseudoPassword);
      const user = userCredential.user;
      
      const userDocPath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), {
          nombre,
          email: pseudoEmail,
          telefono,
          tipo: role,
          foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`,
          createdAt: new Date().toISOString()
        });
      } catch (fsErr) {
        console.warn("Error guardando en Firestore, pero seguiremos en modo demo local.", fsErr);
        if (fsErr instanceof Error && fsErr.message.includes('permission')) {
          handleFirestoreError(fsErr, OperationType.WRITE, userDocPath);
        }
      }
      
      navigate('/');
    } catch (err: any) {
      console.warn("Registro fallido, intentando crear sesión de invitado...", err.message);
      
      // Fallback: Entrar como invitado si el Auth falla
      try {
        await signInAnonymously(auth);
        signInAsDemo(nombre, telefono, role);
        navigate('/');
      } catch (anonErr) {
        signInAsDemo(nombre, telefono, role);
        navigate('/');
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
        <Link to="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs uppercase tracking-widest font-semibold">Regresar</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tighter mb-2">Nueva Cuenta</h2>
            <p className="text-zinc-400 font-light italic">Regístrate como <span className="text-white font-medium capitalize">{role === 'salonera' ? 'Estilista' : role}</span></p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-black text-zinc-500 ml-4">Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
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
              {loading ? 'Creando...' : <><UserPlus className="w-5 h-5" /> Crear Cuenta</>}
            </button>
          </form>

          <p className="text-center mt-8 text-zinc-500 text-sm font-light">
            ¿Ya tienes cuenta? <Link to={`/login?role=${role}`} className="text-white font-medium hover:underline">Inicia Sesión</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

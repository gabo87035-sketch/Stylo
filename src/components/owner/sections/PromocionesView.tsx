import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Tag, Percent, Clock, X, Check } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';

interface Props { theme: OwnerTheme; }
interface Promo { id:string; title:string; discount:string; code:string; expires:string; status:'active'|'scheduled'|'expired'; uses:number; }

const PROMOS: Promo[] = [
  { id:'1', title:'Promo Fin de Semana',  discount:'20% OFF',  code:'FIN20',   expires:'2026-05-19', status:'active',    uses:14 },
  { id:'2', title:'Combo Corte + Barba', discount:'$10 OFF',  code:'COMBO10', expires:'2026-05-31', status:'active',    uses:8  },
  { id:'3', title:'Día del Padre',       discount:'15% OFF',  code:'PADRE15', expires:'2026-06-15', status:'scheduled', uses:0  },
  { id:'4', title:'Semana Santa',        discount:'25% OFF',  code:'SANTA25', expires:'2026-04-05', status:'expired',   uses:31 },
];

export default function PromocionesView({ theme: t }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', discount:'', code:'', expires:'' });

  const STATUS_STYLE: Record<string, { bg:string; text:string; label:string }> = {
    active:    { bg:'rgba(34,197,94,0.15)',  text:'#22c55e', label:'Activa'     },
    scheduled: { bg:t.accentLight,          text:t.accent,  label:'Programada' },
    expired:   { bg:'rgba(161,161,170,0.15)',text:'#71717a', label:'Expirada'   },
  };

  const card   = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted  = { color: t.textMuted };
  const accent = { color: t.accent };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Marketing</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Promociones</h2>
      </motion.div>

      {/* Top actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          {[
            { label:'Activas',     count: PROMOS.filter(p=>p.status==='active').length    },
            { label:'Programadas', count: PROMOS.filter(p=>p.status==='scheduled').length },
            { label:'Expiradas',   count: PROMOS.filter(p=>p.status==='expired').length   },
          ].map(s => (
            <div key={s.label} className="rounded-2xl px-4 py-3 text-center" style={card}>
              <p style={{ color: t.text }} className="text-xl font-black">{s.count}</p>
              <p style={muted} className="text-[10px] font-black uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105"
          style={{ background: t.accent, color: '#fff' }}>
          <Plus size={16} /> Nueva Promoción
        </button>
      </div>

      {/* Promo cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {PROMOS.map((p, i) => {
          const ss = STATUS_STYLE[p.status];
          return (
            <motion.div key={p.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i*0.08 }}
              className="rounded-2xl p-6 relative overflow-hidden" style={card}>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Percent size={80} />
              </div>

              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: t.accentLight }}>
                  <Tag size={22} style={accent} />
                </div>
                <span className="text-[10px] font-black px-3 py-1 rounded-full"
                  style={{ background: ss.bg, color: ss.text }}>{ss.label}</span>
              </div>

              <h3 style={{ color: t.text }} className="font-black text-xl mb-1">{p.title}</h3>
              <p style={accent} className="text-3xl font-black mb-4">{p.discount}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span style={muted} className="text-xs">Código</span>
                  <code className="text-xs font-black px-3 py-1 rounded-lg"
                    style={{ background: t.accentMid, color: t.accent }}>{p.code}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span style={muted} className="text-xs flex items-center gap-1">
                    <Clock size={11} /> Expira
                  </span>
                  <span style={{ color: t.text }} className="text-xs font-bold">{p.expires}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={muted} className="text-xs">Usos</span>
                  <span style={accent} className="text-xs font-black">{p.uses} veces</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create promo modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)' }}
            onClick={e => { if(e.target===e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.9, opacity:0 }}
              className="w-full max-w-md rounded-3xl p-8 relative"
              style={{ background: t.isDark ? '#1a1a1a' : '#fff', border:`1px solid ${t.border}` }}>
              <button onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full transition-all hover:scale-110"
                style={{ background: t.accentLight, color: t.accent }}><X size={16} /></button>
              <h3 style={{ color: t.text }} className="font-black text-2xl mb-6">Nueva Promoción</h3>
              {[
                { key:'title',    label:'Nombre',       placeholder:'Ej: Promo Fin de Semana' },
                { key:'discount', label:'Descuento',    placeholder:'Ej: 20% OFF o $10 OFF'   },
                { key:'code',     label:'Código',       placeholder:'Ej: PROMO20'              },
                { key:'expires',  label:'Fecha de vencimiento', placeholder:'2026-06-30', type:'date' },
              ].map(f => (
                <div key={f.key} className="mb-4">
                  <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1.5">{f.label}</label>
                  <input value={(form as any)[f.key]} type={(f as any).type || 'text'}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
                    style={{ background: t.inputBg, border:`1.5px solid ${t.border}`, color: t.text }} />
                </div>
              ))}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-black"
                  style={{ background: t.accentLight, color: t.accent }}>Cancelar</button>
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105"
                  style={{ background: t.accent, color:'#fff' }}>
                  <Check size={16} className="inline mr-2" />Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

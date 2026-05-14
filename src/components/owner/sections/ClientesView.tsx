import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Star, MessageSquare, Calendar } from 'lucide-react';
import { OwnerTheme, mockAppointments, mockSalonAppointments } from '../ownerTheme';

interface Props { theme: OwnerTheme; }

const BARBER_CLIENTS = [
  { id: '1', name: 'Carlos Méndez',   avatar: 'CM', visits: 12, lastVisit: '2026-05-14', spent: 420, rating: 5 },
  { id: '2', name: 'Alejandro Ruiz',  avatar: 'AR', visits: 8,  lastVisit: '2026-05-14', spent: 280, rating: 4 },
  { id: '3', name: 'Miguel Torres',   avatar: 'MT', visits: 5,  lastVisit: '2026-05-10', spent: 175, rating: 5 },
  { id: '4', name: 'Sebastián Mora',  avatar: 'SM', visits: 3,  lastVisit: '2026-05-08', spent: 105, rating: 4 },
  { id: '5', name: 'Andrés Castillo', avatar: 'AC', visits: 15, lastVisit: '2026-05-01', spent: 525, rating: 5 },
  { id: '6', name: 'Luis Herrera',    avatar: 'LH', visits: 7,  lastVisit: '2026-04-28', spent: 245, rating: 4 },
];
const SALON_CLIENTS = [
  { id: '1', name: 'Elena García',   avatar: 'EG', visits: 14, lastVisit: '2026-05-14', spent: 1190, rating: 5 },
  { id: '2', name: 'Sofía Martínez', avatar: 'SM', visits: 9,  lastVisit: '2026-05-14', spent: 630,  rating: 5 },
  { id: '3', name: 'Lorena Ruiz',    avatar: 'LR', visits: 6,  lastVisit: '2026-05-10', spent: 420,  rating: 4 },
  { id: '4', name: 'Valentina Cruz', avatar: 'VC', visits: 4,  lastVisit: '2026-05-08', spent: 380,  rating: 5 },
  { id: '5', name: 'Gabriela Pérez', avatar: 'GP', visits: 11, lastVisit: '2026-05-01', spent: 935,  rating: 4 },
  { id: '6', name: 'Isabella Mora',  avatar: 'IM', visits: 8,  lastVisit: '2026-04-28', spent: 680,  rating: 5 },
];

export default function ClientesView({ theme: t }: Props) {
  const clients = t.role === 'barbero' ? BARBER_CLIENTS : SALON_CLIENTS;
  const [search, setSearch] = useState('');

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Base de datos</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Mis Clientes</h2>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Clientes', value: clients.length },
          { label: 'Activos (mes)',  value: clients.filter(c => c.lastVisit >= '2026-05-01').length },
          { label: 'VIP (10+ visitas)', value: clients.filter(c => c.visits >= 10).length },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-5" style={card}>
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
            <p style={{ color: t.text }} className="text-3xl font-black">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={muted} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cliente..." className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none"
          style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} />
      </div>

      {/* Client table */}
      <motion.div className="rounded-2xl overflow-hidden" style={card}>
        {/* Header */}
        <div className="hidden sm:grid grid-cols-5 px-5 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
          {['Cliente', 'Visitas', 'Última Visita', 'Total Gastado', 'Acciones'].map(h => (
            <p key={h} style={muted} className="text-[10px] font-black uppercase tracking-widest">{h}</p>
          ))}
        </div>
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 sm:gap-0 px-5 py-4 transition-all hover:scale-[1.005]"
            style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${t.border}` : 'none' }}>
            {/* Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: t.accentLight, color: t.accent }}>{c.avatar}</div>
              <div>
                <p style={{ color: t.text }} className="font-black text-sm">{c.name}</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={10} style={{ color: j < c.rating ? '#f59e0b' : t.textMuted }}
                      fill={j < c.rating ? '#f59e0b' : 'none'} />
                  ))}
                </div>
              </div>
            </div>
            {/* Visits */}
            <div className="sm:block">
              <span className="px-3 py-1 rounded-full text-xs font-black"
                style={{ background: c.visits >= 10 ? t.accentLight : 'transparent', color: c.visits >= 10 ? t.accent : t.textMuted }}>
                {c.visits} citas {c.visits >= 10 ? '⭐ VIP' : ''}
              </span>
            </div>
            {/* Last visit */}
            <p style={muted} className="text-xs font-medium">{c.lastVisit}</p>
            {/* Spent */}
            <p style={{ color: t.text }} className="font-black text-sm">${c.spent}</p>
            {/* Actions */}
            <div className="flex gap-2">
              <button className="p-2 rounded-lg transition-all hover:scale-110"
                style={{ background: t.accentLight, color: t.accent }} title="Ver historial de citas">
                <Calendar size={15} />
              </button>
              <button className="p-2 rounded-lg transition-all hover:scale-110"
                style={{ background: t.accentLight, color: t.accent }} title="Enviar mensaje">
                <MessageSquare size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

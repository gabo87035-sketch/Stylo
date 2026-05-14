import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';
import { OwnerTheme, mockAppointments, mockSalonAppointments } from '../ownerTheme';

interface Props { theme: OwnerTheme; }
type Status = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada'
};
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  confirmed: { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e' },
  completed: { bg: 'rgba(99,102,241,0.15)', text: '#6366f1' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444' },
};

export default function CitasView({ theme: t }: Props) {
  const allAppts = t.role === 'barbero' ? mockAppointments : mockSalonAppointments;
  const [filter, setFilter] = useState<Status>('all');
  const [search, setSearch] = useState('');

  const filtered = allAppts.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch = a.clientName.toLowerCase().includes(search.toLowerCase()) ||
                        a.service.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  const tabs: { key: Status; label: string }[] = [
    { key: 'all',       label: 'Todas' },
    { key: 'pending',   label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Gestión</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Mis Citas</h2>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={muted} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente o servicio..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
            style={{
              background: t.inputBg, border: `1px solid ${t.border}`,
              color: t.text
            }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all hover:scale-105"
            style={{
              background: filter === tab.key ? t.accent : t.accentLight,
              color: filter === tab.key ? '#fff' : t.accent,
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments list */}
      <motion.div className="rounded-2xl overflow-hidden" style={card}>
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <p style={muted} className="font-bold">No se encontraron citas.</p>
            </div>
          ) : (
            filtered.map((a, i) => (
              <motion.div key={a.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 transition-all hover:scale-[1.005]"
                style={{
                  borderBottom: i < filtered.length - 1 ? `1px solid ${t.border}` : 'none',
                  background: i % 2 === 0 ? 'transparent' : (t.isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)')
                }}>
                {/* Client info */}
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: t.accentLight, color: t.accent }}>
                    {a.clientAvatar}
                  </div>
                  <div>
                    <p style={{ color: t.text }} className="font-black text-sm">{a.clientName}</p>
                    <p style={muted} className="text-xs">{a.service}</p>
                    <p style={muted} className="text-xs mt-0.5">{a.date} — {a.time}</p>
                  </div>
                </div>

                {/* Status + price + actions */}
                <div className="flex items-center gap-3 ml-16 sm:ml-0">
                  <span className="font-black text-sm" style={{ color: t.text }}>${a.price}</span>
                  <span className="text-[10px] font-black px-3 py-1 rounded-full"
                    style={{ background: STATUS_COLORS[a.status].bg, color: STATUS_COLORS[a.status].text }}>
                    {STATUS_LABEL[a.status]}
                  </span>
                  {a.status === 'pending' && (
                    <div className="flex gap-1">
                      <button className="p-2 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                        title="Confirmar">
                        <CheckCircle size={16} />
                      </button>
                      <button className="p-2 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                        title="Cancelar">
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

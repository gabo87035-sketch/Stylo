import React from 'react';
import { motion } from 'motion/react';
import { Calendar, TrendingUp, Users, Star, CheckCircle, Clock, ChevronRight, Zap } from 'lucide-react';
import { OwnerTheme, mockAppointments, mockSalonAppointments } from '../ownerTheme';

interface Props { theme: OwnerTheme; onNavigate: (section: string) => void; }

const weeklyData = [
  { day: 'L', value: 280, pct: 65 }, { day: 'M', value: 340, pct: 80 },
  { day: 'X', value: 210, pct: 50 }, { day: 'J', value: 390, pct: 92 },
  { day: 'V', value: 425, pct: 100 }, { day: 'S', value: 380, pct: 89 },
  { day: 'D', value: 95,  pct: 22  },
];

export default function DashboardView({ theme: t, onNavigate }: Props) {
  const appts = t.role === 'barbero' ? mockAppointments : mockSalonAppointments;
  const today = appts.filter(a => a.date === '2026-05-14');
  const pending = today.filter(a => a.status === 'pending').length;
  const income  = today.reduce((s, a) => s + a.price, 0);

  const stats = [
    { label: 'Citas Hoy',     value: String(today.length), icon: Calendar,    trend: '+2 vs ayer' },
    { label: 'Ingresos',      value: `$${income}`,         icon: TrendingUp,  trend: '+18% semana' },
    { label: 'Pendientes',    value: String(pending),       icon: Clock,       trend: 'por confirmar' },
    { label: 'Rating',        value: '4.9 ★',               icon: Star,        trend: '12 reseñas' },
  ];

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  return (
    <div>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-2">Panel General</p>
        <h2 style={{ color: t.text }} className="text-4xl font-black tracking-tight">
          {t.role === 'barbero' ? 'Dashboard Diario' : 'Mi Estudio de Belleza'}
        </h2>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform"
            style={card}
          >
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <s.icon size={48} />
            </div>
            <p style={muted} className="text-[10px] font-bold uppercase tracking-widest mb-3">{s.label}</p>
            <p style={{ color: t.text }} className="text-3xl font-black mb-1">{s.value}</p>
            <p style={accent} className="text-[11px] font-bold">{s.trend}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upcoming appointments */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 rounded-2xl p-6" style={card}>
          <div className="flex items-center justify-between mb-6">
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest">Citas de Hoy</p>
            <button onClick={() => onNavigate('citas')} style={accent}
              className="text-xs font-black flex items-center gap-1 hover:opacity-70 transition-opacity">
              Ver todas <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {today.slice(0, 4).map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                style={{ background: t.isDark ? 'rgba(255,255,255,0.03)' : '#F9F9FB', border: `1px solid ${t.border}` }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: t.accentLight, color: t.accent }}>
                  {a.clientAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: t.text }} className="font-bold text-sm truncate">{a.clientName}</p>
                  <p style={muted} className="text-xs">{a.service}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p style={{ color: t.text }} className="text-sm font-black">{a.time}</p>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{
                      background: a.status === 'confirmed' ? 'rgba(34,197,94,0.15)' : t.accentLight,
                      color: a.status === 'confirmed' ? '#22c55e' : t.accent
                    }}>
                    {a.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weekly income chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 rounded-2xl p-6 flex flex-col" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">Ingresos Semanales</p>
          <p style={{ color: t.text }} className="text-2xl font-black mb-6">$2,120</p>
          <div className="flex items-end gap-2 flex-1">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg transition-all duration-700" style={{
                  height: `${(d.pct / 100) * 120}px`,
                  background: i === 4 ? t.accent : t.accentLight,
                  minHeight: '8px'
                }} />
                <span style={muted} className="text-[10px] font-bold">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-6 rounded-2xl p-6" style={card}>
        <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={12} /> Acciones Rápidas
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Nueva Cita',     section: 'citas',         icon: Calendar     },
            { label: 'Ver Horarios',   section: 'horarios',      icon: Clock        },
            { label: 'Mis Servicios',  section: 'servicios',     icon: CheckCircle  },
            { label: 'Estadísticas',   section: 'estadisticas',  icon: TrendingUp   },
          ].map(q => (
            <button key={q.label} onClick={() => onNavigate(q.section)}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:scale-105"
              style={{ background: t.accentLight, border: `1px solid ${t.accentMid}` }}>
              <q.icon size={18} style={accent} />
              <span style={accent} className="text-xs font-black">{q.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

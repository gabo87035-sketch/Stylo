import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';
import { OwnerTheme, mockAppointments, mockSalonAppointments } from '../ownerTheme';

interface Props { theme: OwnerTheme; }

const DAYS_SHORT = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function CalendarioView({ theme: t }: Props) {
  const today = new Date(2026, 4, 14); // May 14 2026
  const [current, setCurrent] = useState({ year: 2026, month: 4 });
  const [selected, setSelected] = useState<number | null>(14);

  const appts = t.role === 'barbero' ? mockAppointments : mockSalonAppointments;

  // Days with appointments
  const apptDays = new Set(appts.map(a => parseInt(a.date.split('-')[2])));

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const prev = () => setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
  const next = () => setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });

  const selectedAppts = selected
    ? appts.filter(a => parseInt(a.date.split('-')[2]) === selected)
    : [];

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Vista mensual</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Calendario</h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 rounded-2xl p-6" style={card}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 style={{ color: t.text }} className="text-xl font-black">
              {MONTHS[current.month]} {current.year}
            </h3>
            <div className="flex gap-2">
              <button onClick={prev} className="p-2 rounded-xl transition-all hover:scale-110"
                style={{ background: t.accentLight, color: t.accent }}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={next} className="p-2 rounded-xl transition-all hover:scale-110"
                style={{ background: t.accentLight, color: t.accent }}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map(d => (
              <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest py-2"
                style={muted}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === 14 && current.month === 4 && current.year === 2026;
              const hasAppt = apptDays.has(day);
              const isSelected = selected === day;
              return (
                <button key={day} onClick={() => setSelected(day)}
                  className="aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all hover:scale-110 relative"
                  style={{
                    background: isSelected ? t.accent : isToday ? t.accentLight : 'transparent',
                    color: isSelected ? '#fff' : t.text,
                  }}>
                  {day}
                  {hasAppt && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                      style={{ background: t.accent }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-4" style={{ borderTop: `1px solid ${t.border}` }}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
              <span style={muted} className="text-xs font-bold">Con citas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: t.accentLight, border: `2px solid ${t.accent}` }} />
              <span style={muted} className="text-xs font-bold">Hoy</span>
            </div>
          </div>
        </motion.div>

        {/* Selected day panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-4">
            {selected ? `${selected} de ${MONTHS[current.month]}` : 'Selecciona un día'}
          </p>

          {selectedAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: t.accentLight }}>
                <Clock size={28} style={accent} />
              </div>
              <p style={{ color: t.text }} className="font-bold mb-1">Sin citas</p>
              <p style={muted} className="text-xs">No hay citas programadas para este día.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedAppts.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="p-4 rounded-xl" style={{ background: t.isDark ? 'rgba(255,255,255,0.04)' : '#F9F9FB', border: `1px solid ${t.border}` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: t.accentLight, color: t.accent }}>
                      {a.clientAvatar}
                    </div>
                    <div>
                      <p style={{ color: t.text }} className="text-sm font-bold leading-tight">{a.clientName}</p>
                      <p style={muted} className="text-xs">{a.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={accent} className="text-xs font-black flex items-center gap-1">
                      <Clock size={12} /> {a.time}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{
                        background: a.status === 'confirmed' ? 'rgba(34,197,94,0.15)' : a.status === 'cancelled' ? 'rgba(239,68,68,0.15)' : t.accentLight,
                        color: a.status === 'confirmed' ? '#22c55e' : a.status === 'cancelled' ? '#ef4444' : t.accent
                      }}>
                      {a.status === 'confirmed' ? 'Confirmada' : a.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

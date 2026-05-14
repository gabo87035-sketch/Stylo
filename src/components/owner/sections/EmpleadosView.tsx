import React from 'react';
import { motion } from 'motion/react';
import { UserCheck, Clock, Star, Calendar } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';

interface Props { theme: OwnerTheme; }

const BARBER_EMPLOYEES = [
  { id: '1', name: 'Ramón Díaz',    role: 'Master Barber',      avatar: 'RD', todayCitas: 5, rating: 4.9, specialty: 'Fades & Diseños', since: '2024-01' },
  { id: '2', name: 'Jorge Silva',   role: 'Barber Senior',      avatar: 'JS', todayCitas: 4, rating: 4.7, specialty: 'Cortes Clásicos', since: '2024-06' },
  { id: '3', name: 'David Rojas',   role: 'Barber Jr.',         avatar: 'DR', todayCitas: 3, rating: 4.5, specialty: 'Barba & Afeitado', since: '2025-02' },
];

const SALON_EMPLOYEES = [
  { id: '1', name: 'María Fernández', role: 'Estilista Senior', avatar: 'MF', todayCitas: 4, rating: 5.0, specialty: 'Color & Mechas',  since: '2023-11' },
  { id: '2', name: 'Paola Gómez',     role: 'Colorista',        avatar: 'PG', todayCitas: 3, rating: 4.8, specialty: 'Colorimetría',     since: '2024-03' },
  { id: '3', name: 'Diana Torres',    role: 'Manicurista',      avatar: 'DT', todayCitas: 5, rating: 4.6, specialty: 'Nail Art & Spa',   since: '2025-01' },
];

const SCHEDULE = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

export default function EmpleadosView({ theme: t }: Props) {
  const employees = t.role === 'barbero' ? BARBER_EMPLOYEES : SALON_EMPLOYEES;

  // Mock schedule per employee
  const schedule: Record<string, Record<string, string | null>> = {
    '1': { '09:00': 'Carlos M.', '10:30': null, '11:00': 'Miguel T.', '14:00': 'Andrés C.', '16:00': 'Luis H.' },
    '2': { '09:30': 'Sebastián M.', '11:00': 'Ricardo V.', '14:30': null, '15:00': 'Fernando L.' },
    '3': { '10:00': 'José P.', '12:00': null, '15:00': 'Omar G.' },
  };

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Equipo</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Empleados</h2>
      </motion.div>

      {/* Employee cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {employees.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-6" style={card}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black"
                style={{ background: t.accentLight, color: t.accent }}>{e.avatar}</div>
              <span className="text-[10px] font-black px-2 py-1 rounded-full"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Activo</span>
            </div>
            <h3 style={{ color: t.text }} className="font-black text-lg leading-tight">{e.name}</h3>
            <p style={accent} className="text-xs font-bold mb-3">{e.role}</p>
            <p style={muted} className="text-xs mb-4">{e.specialty}</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span style={muted} className="text-xs flex items-center gap-1">
                  <Calendar size={12} /> Citas hoy
                </span>
                <span style={{ color: t.text }} className="text-sm font-black">{e.todayCitas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={muted} className="text-xs flex items-center gap-1">
                  <Star size={12} /> Rating
                </span>
                <span style={accent} className="text-sm font-black">{e.rating} ★</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={muted} className="text-xs flex items-center gap-1">
                  <UserCheck size={12} /> Desde
                </span>
                <span style={muted} className="text-xs font-bold">{e.since}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Today's schedule grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden" style={card}>
        <div className="p-5" style={{ borderBottom: `1px solid ${t.border}` }}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest">Agenda del día</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                <th className="p-3 text-left text-[10px] font-black uppercase tracking-widest" style={muted}>Hora</th>
                {employees.map(e => (
                  <th key={e.id} className="p-3 text-left text-[10px] font-black uppercase tracking-widest" style={muted}>{e.name.split(' ')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((hour, hi) => (
                <tr key={hour} style={{ borderBottom: hi < SCHEDULE.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                  <td className="p-3 text-xs font-black" style={muted}>{hour}</td>
                  {employees.map(e => {
                    const client = schedule[e.id]?.[hour];
                    return (
                      <td key={e.id} className="p-3">
                        {client ? (
                          <span className="text-xs font-bold px-3 py-1 rounded-lg"
                            style={{ background: t.accentLight, color: t.accent }}>
                            {client}
                          </span>
                        ) : (
                          <span className="text-xs" style={muted}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

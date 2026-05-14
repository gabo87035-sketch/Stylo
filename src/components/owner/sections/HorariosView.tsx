import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, X, AlertTriangle, ChevronDown, Check } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';

interface Props { theme: OwnerTheme; }

const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
const DAYS  = ['Lun 14', 'Mar 15', 'Mié 16', 'Jue 17', 'Vie 18', 'Sáb 19', 'Dom 20'];

interface BlockedSlot { reason: string; fromOnwards: boolean; }

type SlotMap = Record<string, Record<string, BlockedSlot | null>>;

const defaultBlocked: SlotMap = {
  'Lun 14': { '13:00': { reason: 'Almuerzo', fromOnwards: false } },
  'Mié 16': { '15:00': { reason: 'Reunión de equipo', fromOnwards: true }, '16:00': { reason: 'Reunión de equipo', fromOnwards: false }, '17:00': { reason: 'Reunión de equipo', fromOnwards: false } },
  'Sáb 19': { '18:00': { reason: 'Cierre anticipado', fromOnwards: true }, '19:00': { reason: 'Cierre anticipado', fromOnwards: false }, '20:00': { reason: 'Cierre anticipado', fromOnwards: false } },
};

const MOCK_BOOKED: Record<string, string[]> = {
  'Lun 14': ['09:00','10:00','11:00'],
  'Mar 15': ['09:00','11:00','14:00'],
  'Mié 16': ['09:00','10:00','11:00'],
  'Vie 18': ['09:00','10:00','11:00','12:00','14:00'],
};

interface ModalState { day: string; hour: string; }

export default function HorariosView({ theme: t }: Props) {
  const [blocked, setBlocked]     = useState<SlotMap>(defaultBlocked);
  const [modal, setModal]         = useState<ModalState | null>(null);
  const [reason, setReason]       = useState('');
  const [blockOnwards, setBlockOnwards] = useState(false);

  const card   = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted  = { color: t.textMuted };
  const accent = { color: t.accent };

  const isBlocked = (day: string, hour: string) => !!blocked[day]?.[hour];
  const isBooked  = (day: string, hour: string) => MOCK_BOOKED[day]?.includes(hour);

  const handleBlock = () => {
    if (!modal) return;
    const { day, hour } = modal;
    const hourIdx = HOURS.indexOf(hour);
    if (hourIdx === -1) return;

    setBlocked(prev => {
      const next = { ...prev, [day]: { ...prev[day] } };
      if (blockOnwards) {
        HOURS.slice(hourIdx).forEach(h => {
          next[day][h] = { reason: reason || 'No disponible', fromOnwards: h === hour };
        });
      } else {
        next[day][hour] = { reason: reason || 'No disponible', fromOnwards: false };
      }
      return next;
    });
    setModal(null);
    setReason('');
    setBlockOnwards(false);
  };

  const handleUnblock = (day: string, hour: string) => {
    setBlocked(prev => {
      const next = { ...prev, [day]: { ...prev[day] } };
      delete next[day][hour];
      return next;
    });
  };

  const totalBlocked = Object.values(blocked).reduce((sum: number, day) =>
    sum + Object.values(day as Record<string, BlockedSlot | null>).filter(Boolean).length, 0);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Disponibilidad</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Horarios</h2>
        <p style={muted} className="text-sm mt-1">
          Haz clic en un horario para bloquearlo. Puedes bloquear una hora específica o desde esa hora en adelante.
        </p>
      </motion.div>

      {/* Legend + stats */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {[
          { color: t.accentLight, border: t.accent, textColor: t.accent, label: 'Disponible' },
          { color: 'rgba(239,68,68,0.12)', border: '#ef4444', textColor: '#ef4444', label: 'Bloqueado' },
          { color: 'rgba(99,102,241,0.12)', border: '#6366f1', textColor: '#6366f1', label: 'Reservado' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md" style={{ background: l.color, border: `1.5px solid ${l.border}` }} />
            <span style={{ color: l.textColor }} className="text-xs font-bold">{l.label}</span>
          </div>
        ))}
        {(totalBlocked as number) > 0 && (
          <span className="text-xs font-black px-3 py-1 rounded-full ml-auto"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
            {totalBlocked} horas bloqueadas esta semana
          </span>
        )}
      </div>

      {/* Schedule grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden" style={card}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                <th className="p-4 text-left w-20">
                  <span style={muted} className="text-[10px] font-black uppercase tracking-widest">Hora</span>
                </th>
                {DAYS.map(day => (
                  <th key={day} className="p-4 text-center">
                    <span style={{ color: day === 'Lun 14' ? t.accent : t.textMuted }}
                      className="text-xs font-black">{day}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour, hi) => (
                <tr key={hour} style={{ borderBottom: hi < HOURS.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                  <td className="p-3 pl-4">
                    <span style={muted} className="text-xs font-black font-mono">{hour}</span>
                  </td>
                  {DAYS.map(day => {
                    const blockedInfo = blocked[day]?.[hour];
                    const booked      = isBooked(day, hour);
                    const isBlock     = !!blockedInfo;

                    let bg = t.isDark ? 'rgba(255,255,255,0.03)' : '#F9F9FB';
                    let borderColor = t.border;
                    let cursor = 'pointer';

                    if (booked)   { bg = 'rgba(99,102,241,0.12)'; borderColor = '#6366f1'; cursor = 'default'; }
                    if (isBlock)  { bg = 'rgba(239,68,68,0.12)';  borderColor = '#ef4444'; }

                    return (
                      <td key={day} className="p-2 text-center">
                        <button
                          disabled={booked}
                          onClick={() => isBlock ? handleUnblock(day, hour) : setModal({ day, hour })}
                          className="w-full h-10 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all hover:scale-105 disabled:cursor-default disabled:hover:scale-100"
                          style={{ background: bg, border: `1.5px solid ${borderColor}` }}
                          title={isBlock ? `Bloqueado: ${blockedInfo.reason}` : booked ? 'Reservado' : 'Clic para bloquear'}
                        >
                          {booked ? (
                            <span style={{ color: '#6366f1' }} className="text-[10px] font-black">●</span>
                          ) : isBlock ? (
                            <>
                              <Lock size={12} style={{ color: '#ef4444' }} />
                              <span style={{ color: '#ef4444' }} className="text-[10px] truncate max-w-[60px]">
                                {blockedInfo.reason}
                              </span>
                            </>
                          ) : (
                            <span style={{ color: t.textMuted }} className="text-[10px] opacity-40 group-hover:opacity-100">
                              Libre
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Block modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl p-8 relative"
              style={{ background: t.isDark ? '#1a1a1a' : '#fff', border: `1px solid ${t.border}` }}>
              <button onClick={() => setModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full transition-all hover:scale-110"
                style={{ background: t.accentLight, color: t.accent }}>
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.12)' }}>
                  <Lock size={22} style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <h3 style={{ color: t.text }} className="font-black text-xl">Bloquear Horario</h3>
                  <p style={muted} className="text-sm">{modal.day} — {modal.hour}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-5">
                <label style={muted} className="text-xs font-black uppercase tracking-widest block mb-2">
                  Motivo del bloqueo
                </label>
                <input
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Ej: Cita personal, reunión, almuerzo..."
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                  style={{ background: t.inputBg, border: `1.5px solid ${t.border}`, color: t.text }}
                />
              </div>

              {/* Quick reason chips */}
              <div className="flex flex-wrap gap-2 mb-5">
                {['Almuerzo', 'Reunión', 'Cita médica', 'Descanso', 'Cierre anticipado'].map(r => (
                  <button key={r} onClick={() => setReason(r)}
                    className="px-3 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105"
                    style={{
                      background: reason === r ? t.accent : t.accentLight,
                      color: reason === r ? '#fff' : t.accent,
                    }}>
                    {r}
                  </button>
                ))}
              </div>

              {/* Block onwards toggle */}
              <button
                onClick={() => setBlockOnwards(!blockOnwards)}
                className="w-full flex items-center justify-between p-4 rounded-2xl mb-6 transition-all"
                style={{
                  background: blockOnwards ? 'rgba(239,68,68,0.08)' : t.accentLight,
                  border: `1.5px solid ${blockOnwards ? '#ef4444' : t.border}`
                }}>
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} style={{ color: blockOnwards ? '#ef4444' : t.textMuted }} />
                  <div className="text-left">
                    <p style={{ color: t.text }} className="text-sm font-black">Bloquear desde {modal.hour} en adelante</p>
                    <p style={muted} className="text-xs">Se bloquearán todas las horas restantes del día</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: blockOnwards ? '#ef4444' : t.border }}>
                  {blockOnwards && <Check size={14} color="#fff" />}
                </div>
              </button>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => setModal(null)}
                  className="flex-1 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105"
                  style={{ background: t.accentLight, color: t.accent }}>
                  Cancelar
                </button>
                <button onClick={handleBlock}
                  className="flex-1 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105"
                  style={{ background: '#ef4444', color: '#fff' }}>
                  <Lock size={15} className="inline mr-2" />
                  Bloquear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

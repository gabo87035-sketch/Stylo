import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, DollarSign, CheckCircle, XCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';

interface Props { theme: OwnerTheme; }

interface ServiceRequest {
  clientName: string; clientAvatar: string; date: string; time: string;
}
interface Service {
  id: string; name: string; price: number; duration: number;
  category: string; requests: ServiceRequest[];
}

const BARBER_SERVICES: Service[] = [
  {
    id: '1', name: 'Fade & Barba', price: 35, duration: 45, category: 'Premium',
    requests: [
      { clientName: 'Carlos Méndez',   clientAvatar: 'CM', date: 'Hoy',    time: '09:00' },
      { clientName: 'Andrés Castillo', clientAvatar: 'AC', date: 'Hoy',    time: '14:00' },
      { clientName: 'Marcos Reyes',    clientAvatar: 'MR', date: 'Mañana', time: '11:00' },
    ],
  },
  {
    id: '2', name: 'Corte Clásico', price: 25, duration: 30, category: 'Básico',
    requests: [
      { clientName: 'Alejandro Ruiz', clientAvatar: 'AR', date: 'Hoy',    time: '10:30' },
      { clientName: 'Luis Herrera',   clientAvatar: 'LH', date: 'Mañana', time: '09:00' },
    ],
  },
  {
    id: '3', name: 'Tratamiento Capilar', price: 45, duration: 60, category: 'Tratamiento',
    requests: [
      { clientName: 'Miguel Torres', clientAvatar: 'MT', date: 'Hoy', time: '12:00' },
    ],
  },
  {
    id: '4', name: 'Barba Royale', price: 18, duration: 20, category: 'Básico',
    requests: [
      { clientName: 'Sebastián Mora', clientAvatar: 'SM', date: 'Hoy',    time: '14:00' },
      { clientName: 'Emilio Cano',    clientAvatar: 'EC', date: 'Mañana', time: '16:00' },
    ],
  },
];

const SALON_SERVICES: Service[] = [
  {
    id: '1', name: 'Color & Hidratación', price: 85, duration: 120, category: 'Color',
    requests: [
      { clientName: 'Elena García',   clientAvatar: 'EG', date: 'Hoy',    time: '09:00' },
      { clientName: 'Gabriela Pérez', clientAvatar: 'GP', date: 'Mañana', time: '10:00' },
      { clientName: 'Nathaly Mora',   clientAvatar: 'NM', date: 'Mañana', time: '14:00' },
    ],
  },
  {
    id: '2', name: 'Manicura Spa', price: 45, duration: 60, category: 'Uñas',
    requests: [
      { clientName: 'Sofía Martínez', clientAvatar: 'SM', date: 'Hoy',    time: '11:00' },
      { clientName: 'Isabella Mora',  clientAvatar: 'IM', date: 'Mañana', time: '12:00' },
    ],
  },
  {
    id: '3', name: 'Corte Mariposa', price: 60, duration: 45, category: 'Corte',
    requests: [
      { clientName: 'Lorena Ruiz', clientAvatar: 'LR', date: 'Hoy', time: '13:30' },
    ],
  },
  {
    id: '4', name: 'Keratina Express', price: 95, duration: 90, category: 'Tratamiento',
    requests: [
      { clientName: 'Valentina Cruz', clientAvatar: 'VC', date: 'Hoy',    time: '15:00' },
      { clientName: 'Daniela Ríos',   clientAvatar: 'DR', date: 'Mañana', time: '09:30' },
    ],
  },
];

export default function ServiciosView({ theme: t }: Props) {
  const services = t.role === 'barbero' ? BARBER_SERVICES : SALON_SERVICES;
  const [expanded, setExpanded] = useState<string | null>('1');

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Catálogo</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Servicios & Solicitudes</h2>
        <p style={muted} className="text-sm mt-1">Gestiona tus servicios y las citas pendientes por confirmar.</p>
      </motion.div>

      {/* Summary strip */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-1">
        {[
          { label: 'Servicios activos',     value: services.length },
          { label: 'Total solicitudes hoy', value: services.reduce((s, sv) => s + sv.requests.filter(r => r.date === 'Hoy').length, 0) },
          { label: 'Mañana',                value: services.reduce((s, sv) => s + sv.requests.filter(r => r.date === 'Mañana').length, 0) },
        ].map((s, i) => (
          <div key={s.label} className="rounded-2xl px-5 py-4 flex-shrink-0" style={card}>
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
            <p style={{ color: t.text }} className="text-2xl font-black">{s.value}</p>
          </div>
        ))}
        <button className="rounded-2xl px-5 py-4 flex items-center gap-2 flex-shrink-0 transition-all hover:scale-105"
          style={{ background: t.accent, color: '#fff' }}>
          <Plus size={16} />
          <span className="text-xs font-black uppercase tracking-wider">Nuevo Servicio</span>
        </button>
      </div>

      {/* Service list with expandable requests */}
      <div className="space-y-4">
        {services.map((sv, i) => (
          <motion.div key={sv.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl overflow-hidden" style={card}>
            {/* Service header */}
            <button
              onClick={() => setExpanded(expanded === sv.id ? null : sv.id)}
              className="w-full flex items-center justify-between p-6 text-left transition-all"
              style={{ background: expanded === sv.id ? t.accentLight : 'transparent' }}>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                  style={{ background: t.accentMid, color: t.accent }}>
                  {sv.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ color: t.text }} className="font-black text-lg leading-tight">{sv.name}</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full mr-2"
                    style={{ background: t.accentLight, color: t.accent }}>{sv.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p style={accent} className="font-black text-xl">${sv.price}</p>
                  <p style={muted} className="text-xs flex items-center gap-1 justify-end">
                    <Clock size={11} /> {sv.duration} min
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-3 py-1 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                    {sv.requests.length} solicitud{sv.requests.length !== 1 ? 'es' : ''}
                  </span>
                  {expanded === sv.id ? <ChevronUp size={18} style={accent} /> : <ChevronDown size={18} style={muted} />}
                </div>
              </div>
            </button>

            {/* Expanded: requests */}
            <AnimatePresence>
              {expanded === sv.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="px-6 pb-6" style={{ borderTop: `1px solid ${t.border}` }}>
                    <p style={muted} className="text-[10px] font-black uppercase tracking-widest py-4">
                      Solicitudes de Cita
                    </p>
                    <div className="space-y-3">
                      {sv.requests.map((req, ri) => (
                        <motion.div key={ri} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: ri * 0.06 }}
                          className="flex items-center justify-between p-4 rounded-xl"
                          style={{ background: t.isDark ? 'rgba(255,255,255,0.04)' : '#F9F9FB', border: `1px solid ${t.border}` }}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black"
                              style={{ background: t.accentMid, color: t.accent }}>
                              {req.clientAvatar}
                            </div>
                            <div>
                              <p style={{ color: t.text }} className="font-black text-sm">{req.clientName}</p>
                              <p style={muted} className="text-xs flex items-center gap-1">
                                <Clock size={11} />
                                {req.date} — {req.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105"
                              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                              <CheckCircle size={14} /> Confirmar
                            </button>
                            <button className="p-2 rounded-xl transition-all hover:scale-110"
                              style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                              <XCircle size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

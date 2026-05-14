import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Camera, Globe, Bell, Lock, Palette } from 'lucide-react';
import { OwnerTheme, BARBER_PALETTES, SALON_PALETTES } from '../ownerTheme';
import { useAuth } from '../../../context/AuthContext';

interface Props { 
  theme: OwnerTheme;
  onPaletteChange?: (id: string) => void;
  currentPalette?: string;
}

export default function ConfiguracionView({ theme: t, onPaletteChange, currentPalette }: Props) {
  const { profile, signOut } = useAuth();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    nombre:    profile?.nombre    || '',
    telefono:  profile?.telefono  || '',
    shopName:  t.role === 'barbero' ? 'The Royal Barber' : 'Aura Beauty Studio',
    address:   'Calle Mayor 12, Centro',
    bio:       t.role === 'barbero'
      ? 'Estilo clásico y moderno para el caballero exigente.'
      : 'Especialistas en color, estilismo y cuidado capilar.',
    openTime:  '09:00',
    closeTime: '20:00',
    notifEmail:    true,
    notifWhatsapp: true,
    notifSMS:      false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const card   = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted  = { color: t.textMuted };
  const accent = { color: t.accent };

  const Field = ({ label, value, onChange, type = 'text' }: { label:string; value:string; onChange:(v:string)=>void; type?:string }) => (
    <div>
      <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none resize-none transition-all"
          style={{ background: t.inputBg, border: `1.5px solid ${t.border}`, color: t.text }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
          style={{ background: t.inputBg, border: `1.5px solid ${t.border}`, color: t.text }} />
      )}
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }: { label:string; desc:string; value:boolean; onChange:(v:boolean)=>void }) => (
    <div className="flex items-center justify-between py-3" style={{ borderBottom:`1px solid ${t.border}` }}>
      <div>
        <p style={{ color: t.text }} className="text-sm font-bold">{label}</p>
        <p style={muted} className="text-xs">{desc}</p>
      </div>
      <button onClick={() => onChange(!value)}
        className="w-12 h-6 rounded-full transition-all relative"
        style={{ background: value ? t.accent : t.border }}>
        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
          style={{ left: value ? '26px' : '2px' }} />
      </button>
    </div>
  );

  return (
    <div>
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Ajustes</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Configuración</h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
          className="rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-5 flex items-center gap-2">
            <Camera size={12} /> Perfil Personal
          </p>
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black"
              style={{ background: t.accentLight, color: t.accent }}>
              {profile?.nombre?.charAt(0) || 'U'}
            </div>
            <button className="px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105"
              style={{ background: t.accentLight, color: t.accent }}>
              <Camera size={14} className="inline mr-1" /> Cambiar foto
            </button>
          </div>
          <div className="space-y-4">
            <Field label="Nombre completo" value={form.nombre} onChange={v => setForm(p => ({...p, nombre:v}))} />
            <Field label="Teléfono" value={form.telefono} onChange={v => setForm(p => ({...p, telefono:v}))} type="tel" />
          </div>
        </motion.div>

        {/* Shop info */}
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
          className="rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-5 flex items-center gap-2">
            <Globe size={12} /> Información del Negocio
          </p>
          <div className="space-y-4">
            <Field label={t.role === 'barbero' ? 'Nombre de la Barbería' : 'Nombre del Salón'}
              value={form.shopName} onChange={v => setForm(p => ({...p, shopName:v}))} />
            <Field label="Dirección" value={form.address} onChange={v => setForm(p => ({...p, address:v}))} />
            <Field label="Descripción" value={form.bio} onChange={v => setForm(p => ({...p, bio:v}))} type="textarea" />
          </div>
        </motion.div>

        {/* Hours */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          className="rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-5 flex items-center gap-2">
            <Bell size={12} /> Horario de Atención
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Apertura"  value={form.openTime}  onChange={v => setForm(p => ({...p, openTime:v}))}  type="time" />
            <Field label="Cierre"    value={form.closeTime} onChange={v => setForm(p => ({...p, closeTime:v}))} type="time" />
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <Bell size={12} /> Notificaciones
          </p>
          <Toggle label="Email" desc="Recibe citas y cambios por correo"
            value={form.notifEmail} onChange={v => setForm(p => ({...p, notifEmail:v}))} />
          <Toggle label="WhatsApp" desc="Alertas instantáneas por WhatsApp"
            value={form.notifWhatsapp} onChange={v => setForm(p => ({...p, notifWhatsapp:v}))} />
          <Toggle label="SMS" desc="Mensajes de texto para recordatorios"
            value={form.notifSMS} onChange={v => setForm(p => ({...p, notifSMS:v}))} />
        </motion.div>


        {/* Theme Settings */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
          className="lg:col-span-2 rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-5 flex items-center gap-2">
            <Palette size={12} /> Apariencia de la Interfaz
          </p>
          <div className="flex flex-wrap gap-4">
            {(t.role === 'barbero' ? BARBER_PALETTES : SALON_PALETTES).map(p => {
              const isActive = (currentPalette || (t.role === 'barbero' ? 'gold' : 'rose')) === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onPaletteChange && onPaletteChange(p.id)}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all hover:scale-105"
                  style={{
                    background: isActive ? p.accentLight : 'transparent',
                    border: `1.5px solid ${isActive ? p.accent : t.border}`
                  }}
                >
                  <div className="w-12 h-12 rounded-full" style={{ background: p.accent }} />
                  <span style={{ color: t.text }} className="text-xs font-bold">{p.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Save + Danger zone */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all hover:scale-105"
          style={{ background: saved ? '#22c55e' : t.accent, color:'#fff' }}>
          <Save size={18} />
          {saved ? '¡Guardado!' : 'Guardar Cambios'}
        </button>
        <button onClick={signOut}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all hover:scale-105"
          style={{ background:'rgba(239,68,68,0.12)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)' }}>
          <Lock size={16} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

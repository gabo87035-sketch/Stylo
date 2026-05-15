import React from 'react';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';

interface Props { theme: OwnerTheme; }

const MONTHLY = [
  { m:'Dic', v:1820 }, { m:'Ene', v:2100 }, { m:'Feb', v:1950 },
  { m:'Mar', v:2400 }, { m:'Abr', v:2750 }, { m:'May', v:2120 },
];
const MAX_V = 2750;

const BARBER_SERVICES_POP = [
  { name:'Fade & Barba',       pct:42, count:38 },
  { name:'Corte Clásico',      pct:31, count:28 },
  { name:'Barba Royale',       pct:17, count:15 },
  { name:'Tratamiento Capilar',pct:10, count:9  },
];
const SALON_SERVICES_POP = [
  { name:'Color & Hidratación',pct:38, count:32 },
  { name:'Manicura Spa',       pct:25, count:21 },
  { name:'Keratina Express',   pct:22, count:18 },
  { name:'Corte Mariposa',     pct:15, count:12 },
];

const HOURS_HEAT = ['09','10','11','12','13','14','15','16','17','18'];
const HEAT_DATA  = [8,14,18,12,6,17,19,15,10,5];

export default function EstadisticasView({ theme: t }: Props) {
  const services = t.role === 'barbero' ? BARBER_SERVICES_POP : SALON_SERVICES_POP;
  const card   = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted  = { color: t.textMuted };
  const accent = { color: t.accent };

  const handleExportReport = () => {
    const headers = ['Mes', 'Ingresos (USD)'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + MONTHLY.map(m => `${m.m},${m.v}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_ingresos_${t.role}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Métricas</p>
          <h2 style={{ color: t.text }} className="text-3xl font-black">Estadísticas</h2>
        </motion.div>

        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          onClick={handleExportReport} 
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
          style={{ background: t.accent, color: t.cardBg }}>
          <Download size={18} />
          <span>Exportar Reporte</span>
        </motion.button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Retención',    value:'78%',   sub:'clientes recurrentes' },
          { label:'Ticket prom.', value:'$38',   sub:'por servicio' },
          { label:'Citas/semana', value:'42',    sub:'promedio mensual'  },
          { label:'Satisfacción', value:'4.9★',  sub:'rating general'   },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay: i*0.08 }}
            className="rounded-2xl p-5" style={card}>
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-2">{k.label}</p>
            <p style={{ color: t.text }} className="text-3xl font-black mb-1">{k.value}</p>
            <p style={muted} className="text-xs">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly revenue bar chart */}
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
          className="rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">Ingresos Mensuales</p>
          <p style={{ color: t.text }} className="text-2xl font-black mb-6">
            ${MONTHLY.reduce((s,m) => s+m.v, 0).toLocaleString()}
            <span style={muted} className="text-sm font-medium ml-2">últimos 6 meses</span>
          </p>
          <div className="flex items-end gap-3 h-36">
            {MONTHLY.map((m, i) => (
              <div key={m.m} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${(m.v / MAX_V) * 100}%` }}
                  transition={{ delay: 0.3 + i*0.08, duration: 0.6, ease:'easeOut' }}
                  className="w-full rounded-t-xl min-h-[4px]"
                  style={{ background: i === MONTHLY.length-1 ? t.accent : t.accentLight }} />
                <span style={muted} className="text-[10px] font-black">{m.m}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Service popularity */}
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
          className="rounded-2xl p-6" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-6">Servicios Populares</p>
          <div className="space-y-5">
            {services.map((s, i) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ color: t.text }} className="text-sm font-bold">{s.name}</span>
                  <span style={muted} className="text-xs font-black">{s.count} citas · {s.pct}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden"
                  style={{ background: t.isDark ? 'rgba(255,255,255,0.06)' : '#F0F0F0' }}>
                  <motion.div className="h-full rounded-full"
                    initial={{ width:0 }} animate={{ width:`${s.pct}%` }}
                    transition={{ delay: 0.4 + i*0.1, duration:0.7, ease:'easeOut' }}
                    style={{ background: t.accent }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Peak hours heatmap */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
        className="rounded-2xl p-6" style={card}>
        <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-6">Horas Pico</p>
        <div className="flex items-end gap-3 h-28">
          {HOURS_HEAT.map((h, i) => {
            const pct = (HEAT_DATA[i] / 19) * 100;
            return (
              <div key={h} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height:0 }} animate={{ height:`${pct}%` }}
                  transition={{ delay: 0.5 + i*0.06, duration:0.5 }}
                  className="w-full rounded-t-lg min-h-[4px]"
                  style={{
                    background: pct > 80 ? t.accent : pct > 50 ? t.accentMid : t.accentLight,
                  }} />
                <span style={muted} className="text-[10px] font-black">{h}h</span>
              </div>
            );
          })}
        </div>
        <p style={muted} className="text-xs mt-4">
          🔥 Horas más ocupadas: <span style={accent} className="font-black">14:00 – 16:00</span>
        </p>
      </motion.div>
    </div>
  );
}

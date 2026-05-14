import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';

interface Props { theme: OwnerTheme; }

const TRANSACTIONS = [
  { id:'1', client:'Carlos Méndez',   service:'Fade & Barba',        amount:35, date:'Hoy 09:00',    method:'Efectivo',    type:'in'  as const },
  { id:'2', client:'Alejandro Ruiz',  service:'Corte Clásico',        amount:25, date:'Hoy 10:30',    method:'Transferencia',type:'in' as const },
  { id:'3', client:'Miguel Torres',   service:'Tratamiento Capilar',  amount:45, date:'Hoy 12:00',    method:'Tarjeta',      type:'in' as const },
  { id:'4', client:'Proveedor',       service:'Suministros',          amount:80, date:'Ayer 14:00',   method:'Transferencia',type:'out' as const },
  { id:'5', client:'Sebastián Mora',  service:'Barba Royale',         amount:18, date:'Ayer 15:00',   method:'Efectivo',     type:'in' as const },
  { id:'6', client:'Luis Herrera',    service:'Corte Clásico',        amount:25, date:'Ayer 17:00',   method:'Tarjeta',      type:'in' as const },
];

const SALON_TRANSACTIONS = [
  { id:'1', client:'Elena García',    service:'Color & Hidratación',  amount:85, date:'Hoy 09:00',  method:'Tarjeta',       type:'in' as const },
  { id:'2', client:'Sofía Martínez',  service:'Manicura Spa',         amount:45, date:'Hoy 11:00',  method:'Transferencia', type:'in' as const },
  { id:'3', client:'Lorena Ruiz',     service:'Corte Mariposa',       amount:60, date:'Hoy 13:30',  method:'Efectivo',      type:'in' as const },
  { id:'4', client:'Proveedor',       service:'Productos capilares',  amount:120,date:'Ayer 10:00', method:'Transferencia', type:'out' as const },
  { id:'5', client:'Valentina Cruz',  service:'Keratina Express',     amount:95, date:'Ayer 15:00', method:'Tarjeta',       type:'in' as const },
  { id:'6', client:'Isabella Mora',   service:'Manicura Spa',         amount:45, date:'Ayer 16:30', method:'Efectivo',      type:'in' as const },
];

const METHOD_ICONS: Record<string,string> = { Efectivo:'💵', Tarjeta:'💳', Transferencia:'📱' };

export default function PagosView({ theme: t }: Props) {
  const txs = t.role === 'barbero' ? TRANSACTIONS : SALON_TRANSACTIONS;
  const income  = txs.filter(x => x.type === 'in').reduce((s,x) => s+x.amount, 0);
  const expense = txs.filter(x => x.type === 'out').reduce((s,x) => s+x.amount, 0);

  const card   = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted  = { color: t.textMuted };
  const accent = { color: t.accent };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Finanzas</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Pagos</h2>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label:'Ingresos totales',   value:`$${income}`,   color:'#22c55e', icon: ArrowUpRight   },
          { label:'Gastos totales',     value:`$${expense}`,  color:'#ef4444', icon: ArrowDownRight },
          { label:'Balance neto',       value:`$${income-expense}`, color: t.accent, icon: TrendingUp },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: i*0.1 }}
            className="rounded-2xl p-6 flex items-center gap-4" style={card}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: `${s.color}22` }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Method breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {['Efectivo','Tarjeta','Transferencia'].map((method, i) => {
          const total = txs.filter(x => x.method === method && x.type === 'in').reduce((s,x)=>s+x.amount,0);
          return (
            <motion.div key={method} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay: 0.2 + i*0.07 }}
              className="rounded-2xl p-5 text-center" style={card}>
              <div className="text-3xl mb-2">{METHOD_ICONS[method]}</div>
              <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">{method}</p>
              <p style={{ color: t.text }} className="text-xl font-black">${total}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Transactions */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
        className="rounded-2xl overflow-hidden" style={card}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom:`1px solid ${t.border}` }}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest">Transacciones Recientes</p>
        </div>
        {txs.map((tx, i) => (
          <div key={tx.id} className="flex items-center justify-between px-5 py-4 transition-all hover:scale-[1.005]"
            style={{ borderBottom: i < txs.length-1 ? `1px solid ${t.border}` : 'none' }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: tx.type==='in' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
                {METHOD_ICONS[tx.method]}
              </div>
              <div>
                <p style={{ color: t.text }} className="font-bold text-sm">{tx.client}</p>
                <p style={muted} className="text-xs">{tx.service} · {tx.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-lg" style={{ color: tx.type==='in' ? '#22c55e' : '#ef4444' }}>
                {tx.type==='in' ? '+' : '-'}${tx.amount}
              </p>
              <p style={muted} className="text-[10px] font-bold">{tx.method}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

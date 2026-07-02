import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { BarChart2, Lock, AlertTriangle, TrendingUp, Package, DollarSign, ArrowRightLeft, Download, Shield } from 'lucide-react';
import type { AppState } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  state: AppState;
}

const ACCENT = '#C4652B';
const CHART_COLORS = ['#C4652B', '#5B7B5A', '#B5956A', '#8B6B4A', '#A5BDA4'];

function daysSince(dateStr: string): number {
  return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function KPICard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      padding: '16px 20px', background: '#FAFAF8', border: '1px solid #D8D3CD',
      borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 8,
      borderLeft: accent ? `3px solid ${ACCENT}` : '1px solid #D8D3CD',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7A7369' }}>{label}</span>
        <span style={{ color: accent ? ACCENT : '#9E9690', opacity: 0.7 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', fontWeight: 500, color: '#1A1917' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#7A7369' }}>{sub}</div>}
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === 'gerente1234') {
      onLogin();
    } else {
      setError(true);
      setPw('');
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', background: '#F7F6F4', minHeight: '100%' }}>
      <div style={{ width: 340, background: '#FAFAF8', border: '1px solid #D8D3CD', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #D8D3CD', background: '#1A1917', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart2 size={20} style={{ color: ACCENT }} />
          <div>
            <div style={{ color: '#EAE7E3', fontSize: '14px', fontWeight: 600 }}>Panel Gerencial</div>
            <div style={{ color: '#5A554F', fontSize: '11px' }}>Acceso restringido — solo gerencia</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EAE7E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} style={{ color: '#7A7369' }} />
            </div>
            <div style={{ fontSize: '13px', color: '#7A7369' }}>Introduce la contraseña de acceso</div>
          </div>
          <div>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              placeholder="Contraseña"
              style={{
                width: '100%', padding: '9px 12px', border: `1px solid ${error ? '#C23B22' : '#D8D3CD'}`,
                borderRadius: 4, fontSize: '14px', boxSizing: 'border-box',
                fontFamily: 'JetBrains Mono, monospace', outline: 'none', letterSpacing: '0.08em',
              }}
            />
            {error && <div style={{ fontSize: '12px', color: '#C23B22', marginTop: 4 }}>Contraseña incorrecta</div>}
          </div>
          <button type="submit" style={{
            width: '100%', padding: '10px', background: ACCENT, color: '#fff',
            border: 'none', borderRadius: 4, fontSize: '14px', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Acceder
          </button>
          <div style={{ fontSize: '11px', color: '#9E9690', textAlign: 'center' }}>
            Pista: gerente + año + 4 dígitos
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1917', border: 'none', borderRadius: 4, padding: '8px 12px' }}>
      <div style={{ color: '#7A7369', fontSize: '11px', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: '#EAE7E3', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
          {p.name}: <strong>${p.value}</strong>
        </div>
      ))}
    </div>
  );
}

function Dashboard({ state }: { state: AppState }) {
  const [activeTab, setActiveTab] = useState('analitica');

  // KPIs
  const ventas = state.ventas;
  const revenueTotal = ventas.reduce((s, v) => s + v.precioVenta, 0);
  const gananciaTotal = ventas.reduce((s, v) => s + (v.precioVenta - v.precioCosto), 0);
  const activePrestamos = state.prestamos.filter(p => p.estado === 'activo');
  const ventasExternas = ventas.filter(v => v.vendidoPor === 'local_externo').length;
  const tasaConversion = activePrestamos.length > 0
    ? Math.round((ventas.filter(v => v.vendidoPor === 'local_externo').length / (activePrestamos.length + ventas.filter(v => v.vendidoPor === 'local_externo').length)) * 100)
    : 0;

  // Chart data: ventas por semana (last 3 weeks from July 1 2026)
  const weekBuckets = [
    { semana: '10-16 Jun', inicio: '2026-06-10', fin: '2026-06-16' },
    { semana: '17-23 Jun', inicio: '2026-06-17', fin: '2026-06-23' },
    { semana: '24-30 Jun', inicio: '2026-06-24', fin: '2026-06-30' },
    { semana: '01 Jul', inicio: '2026-07-01', fin: '2026-07-01' },
  ];

  const ventasPorSemana = weekBuckets.map(b => ({
    semana: b.semana,
    'Bodega Central': ventas.filter(v => v.fecha >= b.inicio && v.fecha <= b.fin && v.vendidoPor === 'local_original')
      .reduce((s, v) => s + v.precioVenta, 0),
    'Locales Externos': ventas.filter(v => v.fecha >= b.inicio && v.fecha <= b.fin && v.vendidoPor === 'local_externo')
      .reduce((s, v) => s + v.precioVenta, 0),
  }));

  // Distribution
  const dist = [
    { name: 'Bodega Central', value: ventas.filter(v => v.vendidoPor === 'local_original').length },
    { name: 'Locales Externos', value: ventasExternas },
  ];

  // By brand
  const byMarca: Record<string, number> = {};
  ventas.forEach(v => {
    const z = state.zapatos.find(z => z.id === v.zapatoId);
    if (z) byMarca[z.marca] = (byMarca[z.marca] ?? 0) + 1;
  });
  const marcaData = Object.entries(byMarca).map(([marca, ventas]) => ({ marca, ventas })).sort((a, b) => b.ventas - a.ventas);

  // By local externo performance
  const localPerf = state.localesExternos.map(l => {
    const prestamosLocal = state.prestamos.filter(p => p.localExternoId === l.id);
    const ventasLocal = ventas.filter(v => v.localExternoId === l.id);
    const totalPrestamos = prestamosLocal.length;
    const conversion = totalPrestamos > 0 ? Math.round((ventasLocal.length / totalPrestamos) * 100) : 0;
    const ingresos = ventasLocal.reduce((s, v) => s + v.precioVenta, 0);
    return { nombre: l.nombre.split(' ').slice(0, 2).join(' '), conversion, ingresos, ventasN: ventasLocal.length, prestamosN: totalPrestamos };
  });

  // Auditoria: prestamos vencidos
  const prestamosAlerta = activePrestamos.filter(p => daysSince(p.fechaPrestamo) > 15);
  const prestamosGraves = activePrestamos.filter(p => daysSince(p.fechaPrestamo) > 30);

  const tabTrigger = (value: string, label: string): React.CSSProperties => ({
    padding: '9px 18px', border: 'none', background: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500, color: activeTab === value ? '#1A1917' : '#7A7369',
    borderBottom: activeTab === value ? `2px solid ${ACCENT}` : '2px solid transparent',
    fontFamily: 'inherit',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #D8D3CD', background: '#FAFAF8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <BarChart2 size={16} style={{ color: ACCENT }} />
          <h1 style={{ margin: 0 }}>Panel Gerencial</h1>
        </div>
        <div style={{ fontSize: '12px', color: '#7A7369' }}>Vista ejecutiva · Solo dueños y gerentes</div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ padding: '12px 16px', borderBottom: '1px solid #D8D3CD', background: '#F7F6F4', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        <KPICard icon={<DollarSign size={15} />} label="Ingresos Totales" value={`$${revenueTotal}`} sub={`${ventas.length} ventas registradas`} accent />
        <KPICard icon={<TrendingUp size={15} />} label="Ganancia Total" value={`$${gananciaTotal.toFixed(0)}`} sub={`Margen: ${revenueTotal > 0 ? Math.round((gananciaTotal / revenueTotal) * 100) : 0}%`} />
        <KPICard icon={<ArrowRightLeft size={15} />} label="Pares Prestados" value={activePrestamos.length} sub={`${prestamosAlerta.length} con alerta`} />
        <KPICard icon={<Package size={15} />} label="Tasa Conversión" value={`${tasaConversion}%`} sub="préstamos → ventas" accent />
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs.List style={{ borderBottom: '1px solid #D8D3CD', background: '#FAFAF8', padding: '0 8px', display: 'flex', outline: 'none', overflowX: 'auto', overflowY: 'hidden', flexShrink: 0 }}>
          {[['analitica','Analítica'],['auditoria','Auditoría'],['por_local','Por Local'],['reportes','Reportes']].map(([v, l]) => (
            <Tabs.Trigger key={v} value={v} style={tabTrigger(v, l)}>{l}</Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* ANALÍTICA */}
        <Tabs.Content value="analitica" style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Ventas por semana */}
            <div style={{ background: '#FAFAF8', border: '1px solid #D8D3CD', borderRadius: 4, padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px' }}>Ventas por Semana</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ventasPorSemana} barSize={18}>
                  <CartesianGrid key="cg-weekly" strokeDasharray="3 3" stroke="#EAE7E3" vertical={false} />
                  <XAxis key="xaxis-weekly" dataKey="semana" tick={{ fontSize: 11, fill: '#7A7369' }} axisLine={false} tickLine={false} />
                  <YAxis key="yaxis-weekly" tick={{ fontSize: 11, fill: '#7A7369', fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip key="tooltip-weekly" content={<CustomTooltip />} />
                  <Legend key="legend-weekly" wrapperStyle={{ fontSize: '11px', paddingTop: 8 }} />
                  <Bar key="bar-bodega" dataKey="Bodega Central" fill="#1A1917" radius={[2, 2, 0, 0]} />
                  <Bar key="bar-externos" dataKey="Locales Externos" fill={ACCENT} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribución */}
            <div style={{ background: '#FAFAF8', border: '1px solid #D8D3CD', borderRadius: 4, padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px' }}>Distribución de Ventas</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    key="pie-dist"
                    data={dist}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ name, percent }: { name: string; percent: number }) =>
                      `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {dist.map((entry, i) => (
                      <Cell key={`dist-cell-${entry.name}-${i}`} fill={CHART_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip key="tooltip-dist" formatter={(v: number) => [`${v} ventas`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Rendimiento por local */}
            <div style={{ background: '#FAFAF8', border: '1px solid #D8D3CD', borderRadius: 4, padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px' }}>Conversión por Local Externo (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={localPerf} layout="vertical" barSize={14}>
                  <CartesianGrid key="cg-local" strokeDasharray="3 3" stroke="#EAE7E3" horizontal={false} />
                  <XAxis key="xaxis-local" type="number" tick={{ fontSize: 11, fill: '#7A7369' }} axisLine={false} tickLine={false} />
                  <YAxis key="yaxis-local" type="category" dataKey="nombre" tick={{ fontSize: 11, fill: '#7A7369' }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip key="tooltip-local" formatter={(v: number) => [`${v}%`, 'Conversión']} />
                  <Bar key="bar-conversion" dataKey="conversion" fill={ACCENT} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Rotación por marca */}
            <div style={{ background: '#FAFAF8', border: '1px solid #D8D3CD', borderRadius: 4, padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px' }}>Ventas por Marca</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marcaData} barSize={18}>
                  <CartesianGrid key="cg-marca" strokeDasharray="3 3" stroke="#EAE7E3" vertical={false} />
                  <XAxis key="xaxis-marca" dataKey="marca" tick={{ fontSize: 10, fill: '#7A7369' }} axisLine={false} tickLine={false} />
                  <YAxis key="yaxis-marca" tick={{ fontSize: 11, fill: '#7A7369' }} axisLine={false} tickLine={false} />
                  <Tooltip key="tooltip-marca" formatter={(v: number) => [`${v}`, 'Ventas']} />
                  <Bar key="bar-ventas-marca" dataKey="ventas" fill="#5B7B5A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Tabs.Content>

        {/* AUDITORÍA */}
        <Tabs.Content value="auditoria" style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {prestamosGraves.length > 0 && (
            <div style={{ background: '#FEF0EE', border: '1px solid #E89688', borderRadius: 4, padding: '12px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <AlertTriangle size={14} style={{ color: '#C23B22' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8B2A1A' }}>
                  {prestamosGraves.length} préstamos críticos (+30 días)
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#8B2A1A' }}>Estos pares requieren acción inmediata: contactar al local o emitir devolución forzosa.</div>
            </div>
          )}

          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Préstamos con Alerta (+15 días)</h3>
          {prestamosAlerta.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5B7B5A', fontSize: '13px', padding: '20px 0' }}>
              <Shield size={16} /> Sin alertas activas. Todos los préstamos dentro del plazo.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Par</th><th>Código</th><th>Talla</th><th>Local</th><th>Contacto</th><th>Días Préstamo</th><th>Valor</th><th>Riesgo</th></tr>
              </thead>
              <tbody>
                {prestamosAlerta.sort((a, b) => daysSince(b.fechaPrestamo) - daysSince(a.fechaPrestamo)).map(p => {
                  const z = state.zapatos.find(z => z.id === p.zapatoId);
                  const l = state.localesExternos.find(l => l.id === p.localExternoId);
                  const d = daysSince(p.fechaPrestamo);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{z?.marca} {z?.nombre}</div>
                        <div style={{ fontSize: '11px', color: '#7A7369' }}>{z?.color} · T.{z?.talla}</div>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#7A7369' }}>{z?.codigo}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{z?.talla}</td>
                      <td>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{l?.nombre}</div>
                        <div style={{ fontSize: '11px', color: '#7A7369' }}>{!l?.activo && '⚠ Local inactivo'}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#7A7369' }}>{l?.telefono}</td>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '14px', color: d > 30 ? '#C23B22' : '#C49A3A' }}>
                          {d}d
                        </span>
                        <div style={{ fontSize: '10px', color: '#9E9690' }}>{new Date(p.fechaPrestamo).toLocaleDateString('es-VE')}</div>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>${z?.precioVentaSugerido}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 100, fontSize: '11px', fontWeight: 600,
                          background: d > 30 ? '#FEF0EE' : '#FDF4E7',
                          border: `1px solid ${d > 30 ? '#E89688' : '#C49A3A'}`,
                          color: d > 30 ? '#C23B22' : '#7A5C0F',
                        }}>
                          {d > 30 ? 'Crítico' : 'Alerta'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Tabs.Content>

        {/* POR LOCAL */}
        <Tabs.Content value="por_local" style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>Préstamos Activos por Local Externo</h3>
          {state.localesExternos.map(l => {
            const prestsLocal = activePrestamos.filter(p => p.localExternoId === l.id);
            if (prestsLocal.length === 0) return null;
            const valorComprometido = prestsLocal.reduce((s, p) => {
              const z = state.zapatos.find(z => z.id === p.zapatoId);
              return s + (z?.precioVentaSugerido ?? 0);
            }, 0);

            return (
              <div key={l.id} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ margin: 0 }}>{l.nombre}</h3>
                    <span style={{ fontSize: '12px', color: '#7A7369' }}>{l.contacto} · {l.telefono}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: '12px' }}>
                    <span style={{ color: '#7A7369' }}>Pares: <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>{prestsLocal.length}</strong></span>
                    <span style={{ color: ACCENT, fontWeight: 600 }}>Valor: <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>${valorComprometido}</span></span>
                  </div>
                </div>
                <table className="data-table" style={{ marginBottom: 4 }}>
                  <thead>
                    <tr><th>Par</th><th>Talla</th><th>Color</th><th>Código</th><th>Desde</th><th>Días</th><th>Precio</th></tr>
                  </thead>
                  <tbody>
                    {prestsLocal.map(p => {
                      const z = state.zapatos.find(z => z.id === p.zapatoId);
                      const d = daysSince(p.fechaPrestamo);
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 500, fontSize: '13px' }}>{z?.marca} {z?.nombre}</div>
                            <div style={{ fontSize: '11px', color: '#7A7369' }}>{z?.modelo}</div>
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{z?.talla}</td>
                          <td style={{ fontSize: '12px' }}>{z?.color}</td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#7A7369' }}>{z?.codigo}</td>
                          <td style={{ fontSize: '12px', color: '#7A7369' }}>{new Date(p.fechaPrestamo).toLocaleDateString('es-VE')}</td>
                          <td>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: d > 20 ? '#C23B22' : d > 10 ? '#C49A3A' : '#5B7B5A' }}>
                              {d}d
                            </span>
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>${z?.precioVentaSugerido}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </Tabs.Content>

        {/* REPORTES */}
        <Tabs.Content value="reportes" style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>Exportar Reportes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {[
              { title: 'Inventario Completo', desc: 'Todos los pares con estado, ubicación y precios', format: 'XLSX' },
              { title: 'Préstamos Activos', desc: 'Lista completa de pares en locales externos', format: 'PDF' },
              { title: 'Historial de Ventas', desc: 'Ventas por período con ganancia por par', format: 'XLSX' },
              { title: 'Rendimiento por Local', desc: 'Tasas de conversión y valor por local externo', format: 'PDF' },
              { title: 'Auditoría de Préstamos', desc: 'Pares vencidos, en riesgo y discrepancias', format: 'PDF' },
              { title: 'Estado del Inventario', desc: 'Snapshot del inventario actual con valorización', format: 'XLSX' },
            ].map(r => (
              <div key={r.title} style={{ background: '#FAFAF8', border: '1px solid #D8D3CD', borderRadius: 4, padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h4 style={{ margin: 0 }}>{r.title}</h4>
                  <span style={{
                    padding: '2px 7px', borderRadius: 3, fontSize: '10px', fontWeight: 700,
                    fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em',
                    background: r.format === 'PDF' ? '#F0F5EE' : '#EEF3F0',
                    color: r.format === 'PDF' ? '#3D6B38' : '#3D6B38',
                    border: '1px solid #8FA886',
                  }}>
                    {r.format}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#7A7369', marginBottom: 14, lineHeight: 1.5 }}>{r.desc}</div>
                <button
                  onClick={() => alert('Exportación simulada — en producción generaría el archivo')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                    background: '#F7F6F4', border: '1px solid #D8D3CD', borderRadius: 4,
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer', color: '#1A1917',
                  }}
                >
                  <Download size={12} /> Descargar {r.format}
                </button>
              </div>
            ))}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

export function ManagementPanel({ state }: Props) {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return <Dashboard state={state} />;
}

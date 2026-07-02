import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Package, ArrowRightLeft, ShoppingBag, DollarSign, Plus, Edit2,
  RotateCcw, X, AlertTriangle, MapPin, Phone, Mail, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import type { AppState, LocalExterno, SaleSource, Zapato } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  state: AppState;
  onPrestar: (zapatoId: string, localId: string) => void;
  onDevolver: (zapatoId: string) => void;
  onVender: (zapatoId: string, precio: number, por: SaleSource, localId?: string) => void;
  onAddLocal: (l: Omit<LocalExterno, 'id' | 'fechaRegistro'>) => void;
  onUpdateLocal: (id: string, ch: Partial<LocalExterno>) => void;
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
  background: '#C4652B', color: '#fff', border: 'none', borderRadius: 4,
  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
};
const btnSecondary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
  background: '#fff', color: '#1A1917', border: '1px solid #D8D3CD', borderRadius: 4,
  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid #D8D3CD',
  borderRadius: 4, background: '#fff', fontSize: '13px', boxSizing: 'border-box',
  fontFamily: 'inherit', color: '#1A1917', outline: 'none',
};
const labelSt: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7A7369', marginBottom: 4,
};

function daysSince(dateStr: string): number {
  return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function KPICard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      padding: '16px 20px', background: '#FAFAF8', border: '1px solid #D8D3CD',
      borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 8,
      borderLeft: accent ? '3px solid #C4652B' : '1px solid #D8D3CD',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7A7369' }}>{label}</span>
        <span style={{ color: accent ? '#C4652B' : '#9E9690', opacity: 0.7 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', color: '#1A1917' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#7A7369' }}>{sub}</div>}
    </div>
  );
}

type LocalForm = Omit<LocalExterno, 'id' | 'fechaRegistro'>;

function LocalFormModal({ local, onSave, onClose }: {
  local?: LocalExterno;
  onSave: (data: LocalForm) => void;
  onClose: () => void;
}) {
  const { register, handleSubmit } = useForm<LocalForm>({ defaultValues: local });
  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelSt}>Nombre del Local *</label>
          <input style={inputStyle} {...register('nombre', { required: true })} placeholder="Zapatos Caribe" />
        </div>
        <div>
          <label style={labelSt}>Persona de Contacto</label>
          <input style={inputStyle} {...register('contacto')} />
        </div>
        <div>
          <label style={labelSt}>Teléfono</label>
          <input style={inputStyle} {...register('telefono')} placeholder="+58 414-000-0000" />
        </div>
        <div>
          <label style={labelSt}>Email</label>
          <input style={inputStyle} type="email" {...register('email')} />
        </div>
        <div>
          <label style={labelSt}>Estado</label>
          <select style={inputStyle} {...register('activo', { setValueAs: v => v === 'true' || v === true })}>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelSt}>Dirección</label>
          <input style={inputStyle} {...register('direccion')} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelSt}>Condiciones de Préstamo</label>
          <textarea style={{ ...inputStyle, height: 64, resize: 'vertical' }} {...register('condicionesPrestamo')} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #EAE7E3' }}>
        <button type="button" onClick={onClose} style={btnSecondary}>Cancelar</button>
        <button type="submit" style={btnPrimary}><Plus size={14} /> Guardar Local</button>
      </div>
    </form>
  );
}

function VenderModal({ zapato, locales, onConfirm, onClose }: {
  zapato: Zapato; locales: LocalExterno[];
  onConfirm: (precio: number, por: SaleSource, localId?: string) => void;
  onClose: () => void;
}) {
  const [precio, setPrecio] = useState(zapato.precioVentaSugerido);
  const [por, setPor] = useState<SaleSource>(zapato.estado === 'prestado' ? 'local_externo' : 'local_original');
  const [localId, setLocalId] = useState(zapato.localPrestamoId ?? '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '10px 12px', background: '#F7F6F4', borderRadius: 4, fontSize: '13px' }}>
        <strong>{zapato.marca} {zapato.nombre}</strong> · Talla {zapato.talla}
      </div>
      <div>
        <label style={labelSt}>Precio Final ($)</label>
        <input style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }} type="number" value={precio} onChange={e => setPrecio(Number(e.target.value))} />
        {precio > zapato.precioCosto && <div style={{ fontSize: '12px', color: '#5B7B5A', marginTop: 3 }}>Ganancia: ${(precio - zapato.precioCosto).toFixed(2)}</div>}
      </div>
      <div>
        <label style={labelSt}>Vendido Por</label>
        <select style={inputStyle} value={por} onChange={e => setPor(e.target.value as SaleSource)}>
          <option value="local_original">Bodega Central</option>
          <option value="local_externo">Local Externo</option>
        </select>
      </div>
      {por === 'local_externo' && (
        <div>
          <label style={labelSt}>Local Externo</label>
          <select style={inputStyle} value={localId} onChange={e => setLocalId(e.target.value)}>
            <option value="">— Seleccionar —</option>
            {locales.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={btnSecondary}>Cancelar</button>
        <button onClick={() => onConfirm(precio, por, por === 'local_externo' ? localId : undefined)} style={btnPrimary}>
          <ShoppingBag size={14} /> Confirmar Venta
        </button>
      </div>
    </div>
  );
}

function OverlayDialog({ open, onClose, title, maxWidth = 520, children }: { open: boolean; onClose: () => void; title: string; maxWidth?: number; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(26,25,23,0.45)', zIndex: 50 }} />
        <Dialog.Content style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          background: '#FAFAF8', borderRadius: 6, border: '1px solid #D8D3CD',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 51, maxHeight: '90vh',
          overflowY: 'auto', width: '90vw', maxWidth,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #D8D3CD' }}>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A7369' }}><X size={16} /></button>
          </div>
          <div style={{ padding: 20 }}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function OperationalPanel({ state, onPrestar: _onPrestar, onDevolver, onVender, onAddLocal, onUpdateLocal }: Props) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [localModal, setLocalModal] = useState<'add' | LocalExterno | null>(null);
  const [ventaZapato, setVentaZapato] = useState<Zapato | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0];

  const enBodega = state.zapatos.filter(z => z.estado === 'en_bodega');
  const prestados = state.zapatos.filter(z => z.estado === 'prestado');
  const ventasHoy = state.ventas.filter(v => v.fecha === today);
  const ventasSemana = state.ventas.filter(v => v.fecha >= weekAgo);
  const valorInventario = enBodega.reduce((sum, z) => sum + z.precioCosto, 0);
  const gananciaTotal = state.ventas.reduce((sum, v) => sum + (v.precioVenta - v.precioCosto), 0);

  const activePrestamos = state.prestamos.filter(p => p.estado === 'activo');

  const handleSaveLocal = (data: LocalForm) => {
    if (localModal && typeof localModal === 'object') {
      onUpdateLocal(localModal.id, data);
      toast.success('Local actualizado');
    } else {
      onAddLocal(data);
      toast.success('Local registrado');
    }
    setLocalModal(null);
  };

  const handleVender = (precio: number, por: SaleSource, localId?: string) => {
    if (!ventaZapato) return;
    onVender(ventaZapato.id, precio, por, localId);
    toast.success(`Venta registrada · $${precio}`);
    setVentaZapato(null);
  };

  const tabTrigger = (value: string, label: string): React.CSSProperties => ({
    padding: '9px 18px', border: 'none', background: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500, color: activeTab === value ? '#1A1917' : '#7A7369',
    borderBottom: activeTab === value ? '2px solid #C4652B' : '2px solid transparent',
    fontFamily: 'inherit', transition: 'color 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #D8D3CD', background: '#FAFAF8' }}>
        <h1 style={{ margin: 0 }}>Panel Operativo</h1>
        <div style={{ fontSize: '12px', color: '#7A7369', marginTop: 2 }}>Bodega Central · Vista empleados</div>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Tabs bar */}
        <Tabs.List style={{ borderBottom: '1px solid #D8D3CD', background: '#FAFAF8', padding: '0 8px', display: 'flex', outline: 'none', overflowX: 'auto', overflowY: 'hidden', flexShrink: 0 }}>
          {[['resumen','Resumen'],['prestamos','Préstamos'],['ventas','Ventas'],['locales','Locales']].map(([v, l]) => (
            <Tabs.Trigger key={v} value={v} style={tabTrigger(v, l)}>{l}</Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* RESUMEN */}
        <Tabs.Content value="resumen" style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            <KPICard icon={<Package size={16} />} label="En Bodega" value={enBodega.length} sub={`Valor: $${valorInventario}`} />
            <KPICard icon={<ArrowRightLeft size={16} />} label="Prestados" value={prestados.length} sub={`${activePrestamos.length} préstamos activos`} accent />
            <KPICard icon={<ShoppingBag size={16} />} label="Vendidos esta semana" value={ventasSemana.length} sub={`Hoy: ${ventasHoy.length}`} />
            <KPICard icon={<DollarSign size={16} />} label="Ganancia Acumulada" value={`$${gananciaTotal.toFixed(0)}`} sub={`${state.ventas.length} ventas totales`} accent />
          </div>

          {/* Alertas */}
          {activePrestamos.filter(p => daysSince(p.fechaPrestamo) > 20).length > 0 && (
            <div style={{ background: '#FEF9EC', border: '1px solid #D4A847', borderRadius: 4, padding: '12px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={14} style={{ color: '#B8860B' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8B6914' }}>
                  Préstamos con más de 20 días
                </span>
              </div>
              {activePrestamos.filter(p => daysSince(p.fechaPrestamo) > 20).map(p => {
                const z = state.zapatos.find(z => z.id === p.zapatoId);
                const l = state.localesExternos.find(l => l.id === p.localExternoId);
                return (
                  <div key={p.id} style={{ fontSize: '12px', color: '#7A5C0F', padding: '4px 0', borderTop: '1px solid #E8D48A30', marginTop: 4 }}>
                    <strong>{z?.marca} {z?.nombre}</strong> · {l?.nombre} · <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{daysSince(p.fechaPrestamo)} días</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent loans */}
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Préstamos Recientes</h3>
          <table className="data-table">
            <thead>
              <tr><th>Par</th><th>Talla</th><th>Local</th><th>Desde</th><th>Días</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {activePrestamos.slice(0, 6).map(p => {
                const z = state.zapatos.find(z => z.id === p.zapatoId);
                const l = state.localesExternos.find(l => l.id === p.localExternoId);
                const d = daysSince(p.fechaPrestamo);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '13px' }}>{z?.marca} {z?.nombre}</div>
                      <div style={{ fontSize: '11px', color: '#7A7369', fontFamily: 'JetBrains Mono, monospace' }}>{z?.codigo}</div>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{z?.talla}</td>
                    <td style={{ fontSize: '12px' }}>{l?.nombre}</td>
                    <td style={{ fontSize: '12px', color: '#7A7369' }}>{new Date(p.fechaPrestamo).toLocaleDateString('es-VE')}</td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: d > 20 ? '#C23B22' : d > 10 ? '#C49A3A' : '#5B7B5A', fontWeight: 600 }}>
                        {d}d
                      </span>
                    </td>
                    <td><StatusBadge status="prestado" size="sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Tabs.Content>

        {/* PRÉSTAMOS ACTIVOS */}
        <Tabs.Content value="prestamos" style={{ flex: 1, overflow: 'auto' }} className="data-table-wrap">
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #D8D3CD', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0 }}>Préstamos Activos</h2>
              <div style={{ fontSize: '12px', color: '#7A7369', marginTop: 2 }}>{activePrestamos.length} pares en locales externos</div>
            </div>
          </div>
          {activePrestamos.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, color: '#9E9690' }}>
              <ArrowRightLeft size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: '14px' }}>Sin préstamos activos</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Par</th><th>Talla</th><th>Local Externo</th><th>Fecha Préstamo</th><th>Días</th><th>Precio Sugerido</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {activePrestamos.map(p => {
                  const z = state.zapatos.find(z => z.id === p.zapatoId);
                  const l = state.localesExternos.find(l => l.id === p.localExternoId);
                  const d = daysSince(p.fechaPrestamo);
                  if (!z) return null;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{z.marca} {z.nombre}</div>
                        <div style={{ fontSize: '11px', color: '#7A7369', fontFamily: 'JetBrains Mono, monospace' }}>{z.codigo}</div>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>{z.talla}</td>
                      <td>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{l?.nombre}</div>
                        <div style={{ fontSize: '11px', color: '#7A7369' }}>{l?.contacto}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#7A7369' }}>{new Date(p.fechaPrestamo).toLocaleDateString('es-VE')}</td>
                      <td>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600,
                          color: d > 20 ? '#C23B22' : d > 10 ? '#C49A3A' : '#5B7B5A',
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                        }}>
                          {d > 20 && <AlertTriangle size={11} />}{d}d
                        </span>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>${z.precioVentaSugerido}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { onDevolver(z.id); toast.success('Devolución registrada'); }}
                            style={{ ...btnSecondary, padding: '5px 10px', fontSize: '12px' }}>
                            <RotateCcw size={12} /> Devolver
                          </button>
                          <button onClick={() => setVentaZapato(z)}
                            style={{ ...btnPrimary, padding: '5px 10px', fontSize: '12px' }}>
                            <ShoppingBag size={12} /> Vender
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Tabs.Content>

        {/* VENTAS */}
        <Tabs.Content value="ventas" style={{ flex: 1, overflow: 'auto' }} className="data-table-wrap">
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #D8D3CD' }}>
            <h2 style={{ margin: 0 }}>Registro de Ventas</h2>
            <div style={{ fontSize: '12px', color: '#7A7369', marginTop: 2 }}>
              {state.ventas.length} ventas · Ganancia total: <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>${gananciaTotal.toFixed(2)}</strong>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Fecha</th><th>Par</th><th>Precio Venta</th><th>Costo</th><th>Ganancia</th><th>Vendido Por</th></tr>
            </thead>
            <tbody>
              {[...state.ventas].sort((a, b) => b.fecha.localeCompare(a.fecha)).map(v => {
                const z = state.zapatos.find(z => z.id === v.zapatoId);
                const l = v.localExternoId ? state.localesExternos.find(l => l.id === v.localExternoId) : null;
                const ganancia = v.precioVenta - v.precioCosto;
                return (
                  <tr key={v.id}>
                    <td style={{ fontSize: '12px', color: '#7A7369' }}>{new Date(v.fecha).toLocaleDateString('es-VE')}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '13px' }}>{z?.marca} {z?.nombre}</div>
                      <div style={{ fontSize: '11px', color: '#7A7369' }}>T.{z?.talla} · {z?.color}</div>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600 }}>${v.precioVenta}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#7A7369' }}>${v.precioCosto}</td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600, color: ganancia > 0 ? '#5B7B5A' : '#C23B22' }}>
                        +${ganancia.toFixed(2)}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {v.vendidoPor === 'local_original'
                        ? <span style={{ color: '#7A7369' }}>Bodega Central</span>
                        : <span style={{ color: '#C4652B', fontWeight: 500 }}>{l?.nombre ?? 'Local externo'}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Tabs.Content>

        {/* LOCALES EXTERNOS */}
        <Tabs.Content value="locales" style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #D8D3CD', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0 }}>Locales Externos</h2>
              <div style={{ fontSize: '12px', color: '#7A7369', marginTop: 2 }}>
                {state.localesExternos.filter(l => l.activo).length} activos
              </div>
            </div>
            <button onClick={() => setLocalModal('add')} style={btnPrimary}><Plus size={14} /> Nuevo Local</button>
          </div>
          <div className="locals-grid" style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {state.localesExternos.map(l => {
              const pares = state.prestamos.filter(p => p.localExternoId === l.id && p.estado === 'activo').length;
              const ventas = state.ventas.filter(v => v.localExternoId === l.id).length;
              return (
                <div key={l.id} style={{
                  background: '#FAFAF8', border: '1px solid #D8D3CD', borderRadius: 4, padding: '16px',
                  opacity: l.activo ? 1 : 0.65,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{l.nombre}</h3>
                      <div style={{ fontSize: '12px', color: '#7A7369', marginTop: 2 }}>{l.contacto}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                        borderRadius: 100, fontSize: '11px', fontWeight: 500,
                        background: l.activo ? '#F0F5EE' : '#F2F0EE',
                        border: `1px solid ${l.activo ? '#8FA886' : '#9E9690'}`,
                        color: l.activo ? '#3D6B38' : '#5A554F',
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: l.activo ? '#5B8A54' : '#9E9690' }} />
                        {l.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <button onClick={() => setLocalModal(l)} style={{ ...btnSecondary, padding: '4px 8px', fontSize: '12px' }}>
                        <Edit2 size={11} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
                    {[
                      [<Phone size={11} />, l.telefono],
                      [<Mail size={11} />, l.email],
                      [<MapPin size={11} />, l.direccion],
                      [<Clock size={11} />, l.condicionesPrestamo],
                    ].map(([icon, val], i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '12px', color: '#7A7369' }}>
                        <span style={{ marginTop: 1, flexShrink: 0 }}>{icon}</span>
                        <span style={{ lineHeight: 1.4 }}>{String(val)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12, paddingTop: 10, borderTop: '1px solid #EAE7E3' }}>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#7A7369' }}>Pares activos: </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{pares}</span>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#7A7369' }}>Ventas: </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{ventas}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Local form modal */}
      <OverlayDialog
        open={!!localModal}
        onClose={() => setLocalModal(null)}
        title={localModal === 'add' ? 'Nuevo Local Externo' : 'Editar Local'}
        maxWidth={540}
      >
        <LocalFormModal
          local={localModal !== 'add' && localModal ? localModal : undefined}
          onSave={handleSaveLocal}
          onClose={() => setLocalModal(null)}
        />
      </OverlayDialog>

      {/* Vender modal */}
      <OverlayDialog open={!!ventaZapato} onClose={() => setVentaZapato(null)} title="Registrar Venta">
        {ventaZapato && (
          <VenderModal
            zapato={ventaZapato}
            locales={state.localesExternos}
            onConfirm={handleVender}
            onClose={() => setVentaZapato(null)}
          />
        )}
      </OverlayDialog>
    </div>
  );
}

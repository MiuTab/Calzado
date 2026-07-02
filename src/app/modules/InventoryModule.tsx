import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, Plus, X, Printer, Send, RotateCcw, ShoppingBag, Edit2, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { AppState, Zapato, ShoeStatus, Categoria, SaleSource } from '../types';
import { Barcode } from '../components/Barcode';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  state: AppState;
  onAddZapato: (z: Omit<Zapato, 'id' | 'codigo'>) => Zapato;
  onUpdateZapato: (id: string, ch: Partial<Zapato>) => void;
  onPrestar: (zapatoId: string, localId: string) => void;
  onDevolver: (zapatoId: string) => void;
  onVender: (zapatoId: string, precio: number, por: SaleSource, localId?: string) => void;
}

type FormData = {
  nombre: string; marca: string; modelo: string; talla: string;
  color: string; precioCosto: number; precioVentaSugerido: number; categoria: Categoria;
};

const TALLAS = ['35','36','37','38','39','40','41','42','43','44','45','46'];
const CATEGORIAS: Categoria[] = ['deportivo','casual','formal','bota','sandalia'];
const MARCAS = ['Nike','Adidas','Skechers','Clarks','Dr. Martens','Steve Madden','Timberland','New Balance','Puma','ECCO'];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid #D8D3CD',
  borderRadius: 4, background: '#fff', fontSize: '13px', outline: 'none',
  fontFamily: 'inherit', color: '#1A1917',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7A7369', marginBottom: 4,
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
  background: '#C4652B', color: '#fff', border: 'none', borderRadius: 4,
  fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
};
const btnSecondary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
  background: '#fff', color: '#1A1917', border: '1px solid #D8D3CD', borderRadius: 4,
  fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
};
const btnDanger: React.CSSProperties = {
  ...btnSecondary, color: '#C23B22', borderColor: '#F0C0B8',
};

function OverlayDialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(26,25,23,0.45)', zIndex: 50 }} />
        <Dialog.Content style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          background: '#FAFAF8', borderRadius: 6, border: '1px solid #D8D3CD',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 51, maxHeight: '90vh',
          overflowY: 'auto', width: '90vw', maxWidth: 560,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #D8D3CD' }}>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A7369', padding: 4 }}><X size={16} /></button>
          </div>
          <div style={{ padding: '20px' }}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ShoeForm({ defaultValues, onSave, onClose }: {
  defaultValues?: Partial<FormData>;
  onSave: (data: FormData) => void;
  onClose: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ defaultValues });
  const row2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 };

  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={row2}>
        <div>
          <label style={labelStyle}>Nombre / Descripción *</label>
          <input style={inputStyle} {...register('nombre', { required: true })} placeholder="Air Force 1 Low" />
          {errors.nombre && <span style={{ color: '#C23B22', fontSize: 11 }}>Requerido</span>}
        </div>
        <div>
          <label style={labelStyle}>Marca *</label>
          <input style={inputStyle} list="marcas-list" {...register('marca', { required: true })} placeholder="Nike" />
          <datalist id="marcas-list">{MARCAS.map(m => <option key={m} value={m} />)}</datalist>
        </div>
      </div>
      <div style={row2}>
        <div>
          <label style={labelStyle}>Modelo</label>
          <input style={inputStyle} {...register('modelo')} placeholder="AF1 '07 Low" />
        </div>
        <div>
          <label style={labelStyle}>Color</label>
          <input style={inputStyle} {...register('color')} placeholder="Blanco/Blanco" />
        </div>
      </div>
      <div style={row2}>
        <div>
          <label style={labelStyle}>Talla *</label>
          <select style={inputStyle} {...register('talla', { required: true })}>
            <option value="">— Seleccionar —</option>
            {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Categoría *</label>
          <select style={inputStyle} {...register('categoria', { required: true })}>
            <option value="">— Seleccionar —</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div style={row2}>
        <div>
          <label style={labelStyle}>Precio Costo ($) *</label>
          <input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} type="number" step="0.01" {...register('precioCosto', { required: true, valueAsNumber: true })} />
        </div>
        <div>
          <label style={labelStyle}>Precio Sugerido ($) *</label>
          <input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} type="number" step="0.01" {...register('precioVentaSugerido', { required: true, valueAsNumber: true })} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #EAE7E3' }}>
        <button type="button" onClick={onClose} style={btnSecondary}>Cancelar</button>
        <button type="submit" style={btnPrimary}><Plus size={14} /> Guardar Par</button>
      </div>
    </form>
  );
}

function PrestarModal({ zapato, locales, onConfirm, onClose }: {
  zapato: Zapato;
  locales: AppState['localesExternos'];
  onConfirm: (localId: string) => void;
  onClose: () => void;
}) {
  const [sel, setSel] = useState('');
  const activos = locales.filter(l => l.activo);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '10px 12px', background: '#F7F6F4', borderRadius: 4, border: '1px solid #EAE7E3' }}>
        <div style={{ fontSize: '13px', fontWeight: 600 }}>{zapato.marca} {zapato.nombre}</div>
        <div style={{ fontSize: '12px', color: '#7A7369' }}>Talla {zapato.talla} · {zapato.color} · <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{zapato.codigo}</span></div>
      </div>
      <div>
        <label style={labelStyle}>Local Externo Destino *</label>
        <select style={inputStyle} value={sel} onChange={e => setSel(e.target.value)}>
          <option value="">— Seleccionar local —</option>
          {activos.map(l => <option key={l.id} value={l.id}>{l.nombre} — {l.contacto}</option>)}
        </select>
        {sel && <div style={{ marginTop: 6, fontSize: '12px', color: '#7A7369' }}>
          {activos.find(l => l.id === sel)?.condicionesPrestamo}
        </div>}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={btnSecondary}>Cancelar</button>
        <button onClick={() => sel && onConfirm(sel)} disabled={!sel}
          style={{ ...btnPrimary, opacity: sel ? 1 : 0.5 }}>
          <Send size={14} /> Confirmar Préstamo
        </button>
      </div>
    </div>
  );
}

function VenderModal({ zapato, locales, onConfirm, onClose }: {
  zapato: Zapato;
  locales: AppState['localesExternos'];
  onConfirm: (precio: number, por: SaleSource, localId?: string) => void;
  onClose: () => void;
}) {
  const [precio, setPrecio] = useState(zapato.precioVentaFinal ?? zapato.precioVentaSugerido);
  const [por, setPor] = useState<SaleSource>(zapato.estado === 'prestado' ? 'local_externo' : 'local_original');
  const [localId, setLocalId] = useState(zapato.localPrestamoId ?? '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '10px 12px', background: '#F7F6F4', borderRadius: 4, border: '1px solid #EAE7E3' }}>
        <div style={{ fontSize: '13px', fontWeight: 600 }}>{zapato.marca} {zapato.nombre}</div>
        <div style={{ fontSize: '12px', color: '#7A7369' }}>Talla {zapato.talla} · Costo: <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>${zapato.precioCosto}</span></div>
      </div>
      <div>
        <label style={labelStyle}>Precio de Venta Final ($)</label>
        <input style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }} type="number" step="0.01"
          value={precio} onChange={e => setPrecio(Number(e.target.value))} />
        {precio > zapato.precioCosto && (
          <div style={{ marginTop: 4, fontSize: '12px', color: '#5B7B5A' }}>
            Ganancia: <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>${(precio - zapato.precioCosto).toFixed(2)}</span>
          </div>
        )}
      </div>
      <div>
        <label style={labelStyle}>Vendido Por</label>
        <select style={inputStyle} value={por} onChange={e => setPor(e.target.value as SaleSource)}>
          <option value="local_original">Local Original (Bodega Central)</option>
          <option value="local_externo">Local Externo</option>
        </select>
      </div>
      {por === 'local_externo' && (
        <div>
          <label style={labelStyle}>Local Externo</label>
          <select style={inputStyle} value={localId} onChange={e => setLocalId(e.target.value)}>
            <option value="">— Seleccionar —</option>
            {locales.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={btnSecondary}>Cancelar</button>
        <button onClick={() => onConfirm(precio, por, por === 'local_externo' ? localId : undefined)}
          style={btnPrimary}>
          <ShoppingBag size={14} /> Confirmar Venta
        </button>
      </div>
    </div>
  );
}

function ShoeDetail({ zapato, state, onClose, onPrestar, onDevolver, onVender, onEdit }: {
  zapato: Zapato;
  state: AppState;
  onClose: () => void;
  onPrestar: () => void;
  onDevolver: () => void;
  onVender: () => void;
  onEdit: () => void;
}) {
  const local = zapato.localPrestamoId ? state.localesExternos.find(l => l.id === zapato.localPrestamoId) : null;
  const localVenta = zapato.localVentaId ? state.localesExternos.find(l => l.id === zapato.localVentaId) : null;

  const handlePrint = () => {
    const el = document.getElementById('print-label-area');
    if (!el) return;
    el.style.display = 'flex';
    window.print();
    el.style.display = 'none';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24 }}>
      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7A7369', marginBottom: 2 }}>{zapato.marca}</div>
            <h2 style={{ margin: 0 }}>{zapato.nombre}</h2>
            <div style={{ fontSize: '12px', color: '#7A7369', marginTop: 2 }}>{zapato.modelo}</div>
          </div>
          <StatusBadge status={zapato.estado} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            ['Talla', zapato.talla],
            ['Color', zapato.color],
            ['Categoría', zapato.categoria],
            ['Origen', zapato.localOrigen],
            ['Precio Costo', `$${zapato.precioCosto}`],
            ['Precio Sugerido', `$${zapato.precioVentaSugerido}`],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '8px 10px', background: '#F7F6F4', borderRadius: 4 }}>
              <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7A7369', marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: '13px', fontFamily: (k === 'Precio Costo' || k === 'Precio Sugerido') ? 'JetBrains Mono, monospace' : 'inherit' }}>{v}</div>
            </div>
          ))}
        </div>
        {zapato.estado === 'prestado' && local && (
          <div style={{ padding: '10px 12px', background: '#FDF4E7', borderRadius: 4, border: '1px solid #C49A3A40' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7A5C0F', marginBottom: 4 }}>Préstamo Activo</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{local.nombre}</div>
            <div style={{ fontSize: '12px', color: '#7A5C0F' }}>{local.contacto} · {local.telefono}</div>
            <div style={{ fontSize: '12px', color: '#7A5C0F', marginTop: 2 }}>
              Desde: {new Date(zapato.fechaPrestamo!).toLocaleDateString('es-VE')}
            </div>
          </div>
        )}
        {zapato.estado === 'vendido' && (
          <div style={{ padding: '10px 12px', background: '#F2F0EE', borderRadius: 4, border: '1px solid #D8D3CD' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5A554F', marginBottom: 4 }}>Venta Registrada</div>
            <div style={{ fontSize: '13px' }}>
              Precio: <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>${zapato.precioVentaFinal}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#7A7369' }}>
              {zapato.vendidoPor === 'local_original' ? 'Bodega Central' : `Local externo: ${localVenta?.nombre ?? '—'}`}
              {' · '}{zapato.fechaVenta && new Date(zapato.fechaVenta).toLocaleDateString('es-VE')}
            </div>
          </div>
        )}
        {/* Actions */}
        {zapato.estado !== 'vendido' && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {zapato.estado === 'en_bodega' && (
              <button onClick={onPrestar} style={btnPrimary}><Send size={13} /> Prestar a Local</button>
            )}
            {zapato.estado === 'prestado' && (
              <button onClick={onDevolver} style={btnSecondary}><RotateCcw size={13} /> Registrar Devolución</button>
            )}
            <button onClick={onVender} style={zapato.estado === 'en_bodega' ? btnSecondary : btnPrimary}>
              <ShoppingBag size={13} /> Marcar como Vendido
            </button>
            <button onClick={onEdit} style={btnSecondary}><Edit2 size={13} /> Editar</button>
          </div>
        )}
      </div>
      {/* Barcode */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ padding: '16px', background: '#fff', border: '1px solid #D8D3CD', borderRadius: 4 }}>
          <Barcode code={zapato.codigo} height={64} showText />
        </div>
        <button onClick={handlePrint} style={btnSecondary}><Printer size={13} /> Imprimir Etiqueta</button>
        {/* Print area - hidden unless printing */}
        <div id="print-label-area" className="print-label" style={{ display: 'none' }}>
          <div style={{ fontSize: '12px', fontWeight: 700 }}>{zapato.marca}</div>
          <div style={{ fontSize: '11px' }}>{zapato.nombre} · T.{zapato.talla}</div>
          <div style={{ fontSize: '10px', color: '#666' }}>{zapato.color}</div>
          <Barcode code={zapato.codigo} height={48} showText color="#000" />
          <div style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>${zapato.precioVentaSugerido}</div>
        </div>
      </div>
    </div>
  );
}

export function InventoryModule({ state, onAddZapato, onUpdateZapato, onPrestar, onDevolver, onVender }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ShoeStatus | ''>('');
  const [filterMarca, setFilterMarca] = useState('');
  const [filterTalla, setFilterTalla] = useState('');
  const [selectedZapato, setSelectedZapato] = useState<Zapato | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingZapato, setEditingZapato] = useState<Zapato | null>(null);
  const [actionModal, setActionModal] = useState<'prestar' | 'vender' | null>(null);

  const marcas = [...new Set(state.zapatos.map(z => z.marca))].sort();

  const filtered = state.zapatos.filter(z => {
    const matchSearch = !search ||
      z.codigo.toLowerCase().includes(search.toLowerCase()) ||
      z.nombre.toLowerCase().includes(search.toLowerCase()) ||
      z.marca.toLowerCase().includes(search.toLowerCase()) ||
      z.modelo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || z.estado === filterStatus;
    const matchMarca = !filterMarca || z.marca === filterMarca;
    const matchTalla = !filterTalla || z.talla === filterTalla;
    return matchSearch && matchStatus && matchMarca && matchTalla;
  });

  const counts = {
    en_bodega: state.zapatos.filter(z => z.estado === 'en_bodega').length,
    prestado: state.zapatos.filter(z => z.estado === 'prestado').length,
    vendido: state.zapatos.filter(z => z.estado === 'vendido').length,
  };

  const handleSaveForm = (data: FormData) => {
    if (editingZapato) {
      onUpdateZapato(editingZapato.id, data);
      toast.success('Par actualizado');
    } else {
      const created = onAddZapato({ ...data, estado: 'en_bodega', localOrigen: 'Bodega Central' });
      toast.success(`Par registrado · ${created.codigo}`);
    }
    setShowForm(false);
    setEditingZapato(null);
  };

  const handlePrestar = (localId: string) => {
    if (!selectedZapato) return;
    onPrestar(selectedZapato.id, localId);
    const local = state.localesExternos.find(l => l.id === localId);
    toast.success(`Prestado a ${local?.nombre}`);
    setActionModal(null);
    setSelectedZapato(null);
  };

  const handleVender = (precio: number, por: SaleSource, localId?: string) => {
    if (!selectedZapato) return;
    onVender(selectedZapato.id, precio, por, localId);
    toast.success(`Venta registrada · $${precio}`);
    setActionModal(null);
    setSelectedZapato(null);
  };

  const handleDevolver = () => {
    if (!selectedZapato) return;
    onDevolver(selectedZapato.id);
    toast.success('Devolución registrada');
    setSelectedZapato(null);
  };

  const filterSelect: React.CSSProperties = {
    padding: '6px 10px', border: '1px solid #D8D3CD', borderRadius: 4,
    background: '#fff', fontSize: '13px', color: '#1A1917', cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="module-header" style={{ padding: '12px 16px', borderBottom: '1px solid #D8D3CD', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAF8' }}>
        <div>
          <h1 style={{ margin: 0 }}>Inventario</h1>
          <div style={{ fontSize: '12px', color: '#7A7369', marginTop: 2 }}>
            <span style={{ marginRight: 16 }}>Bodega: <strong>{counts.en_bodega}</strong></span>
            <span style={{ marginRight: 16 }}>Prestados: <strong>{counts.prestado}</strong></span>
            <span>Vendidos: <strong>{counts.vendido}</strong></span>
          </div>
        </div>
        <button onClick={() => { setEditingZapato(null); setShowForm(true); }} style={btnPrimary}>
          <Plus size={14} /> Nuevo Par
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ padding: '10px 16px', borderBottom: '1px solid #D8D3CD', display: 'flex', gap: 8, background: '#F7F6F4', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9E9690' }} />
          <input
            style={{ ...filterSelect, paddingLeft: 30, width: '100%', boxSizing: 'border-box' }}
            placeholder="Buscar por nombre, código, marca..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value as ShoeStatus | '')}>
          <option value="">Todos los estados</option>
          <option value="en_bodega">En Bodega</option>
          <option value="prestado">Prestado</option>
          <option value="vendido">Vendido</option>
        </select>
        <select style={filterSelect} value={filterMarca} onChange={e => setFilterMarca(e.target.value)}>
          <option value="">Todas las marcas</option>
          {marcas.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select style={filterSelect} value={filterTalla} onChange={e => setFilterTalla(e.target.value)}>
          <option value="">Todas las tallas</option>
          {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(search || filterStatus || filterMarca || filterTalla) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterMarca(''); setFilterTalla(''); }} style={btnSecondary}>
            <X size={13} /> Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="data-table-wrap" style={{ flex: 1, overflow: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, color: '#7A7369' }}>
            <Package size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: '14px', fontWeight: 500 }}>Sin resultados</div>
            <div style={{ fontSize: '12px', marginTop: 4 }}>Ajusta los filtros o agrega nuevos pares al inventario</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre / Marca</th>
                <th>Talla</th>
                <th>Color</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Costo</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
                <th>Estado</th>
                <th>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(z => {
                const localNombre = z.localPrestamoId
                  ? state.localesExternos.find(l => l.id === z.localPrestamoId)?.nombre ?? '—'
                  : '—';
                return (
                  <tr key={z.id} onClick={() => setSelectedZapato(z)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#7A7369' }}>{z.codigo}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '13px' }}>{z.nombre}</div>
                      <div style={{ fontSize: '11px', color: '#7A7369' }}>{z.marca} · {z.modelo}</div>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>{z.talla}</td>
                    <td style={{ fontSize: '12px' }}>{z.color}</td>
                    <td style={{ fontSize: '12px', textTransform: 'capitalize' }}>{z.categoria}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#7A7369' }}>${z.precioCosto}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 500 }}>${z.precioVentaSugerido}</td>
                    <td><StatusBadge status={z.estado} size="sm" /></td>
                    <td style={{ fontSize: '12px', color: '#7A7369' }}>{z.estado === 'prestado' ? localNombre : z.estado === 'vendido' ? 'Vendido' : 'Bodega Central'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Shoe detail modal */}
      <OverlayDialog open={!!selectedZapato && !actionModal} onClose={() => setSelectedZapato(null)} title="Detalle del Par">
        {selectedZapato && (
          <ShoeDetail
            zapato={selectedZapato}
            state={state}
            onClose={() => setSelectedZapato(null)}
            onPrestar={() => setActionModal('prestar')}
            onDevolver={handleDevolver}
            onVender={() => setActionModal('vender')}
            onEdit={() => { setEditingZapato(selectedZapato); setSelectedZapato(null); setShowForm(true); }}
          />
        )}
      </OverlayDialog>

      {/* Prestar modal */}
      <OverlayDialog open={actionModal === 'prestar'} onClose={() => setActionModal(null)} title="Préstamo a Local Externo">
        {selectedZapato && (
          <PrestarModal
            zapato={selectedZapato}
            locales={state.localesExternos}
            onConfirm={handlePrestar}
            onClose={() => setActionModal(null)}
          />
        )}
      </OverlayDialog>

      {/* Vender modal */}
      <OverlayDialog open={actionModal === 'vender'} onClose={() => setActionModal(null)} title="Registrar Venta">
        {selectedZapato && (
          <VenderModal
            zapato={selectedZapato}
            locales={state.localesExternos}
            onConfirm={handleVender}
            onClose={() => setActionModal(null)}
          />
        )}
      </OverlayDialog>

      {/* Form modal */}
      <OverlayDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditingZapato(null); }}
        title={editingZapato ? 'Editar Par' : 'Registrar Nuevo Par'}
      >
        <ShoeForm
          defaultValues={editingZapato ?? undefined}
          onSave={handleSaveForm}
          onClose={() => { setShowForm(false); setEditingZapato(null); }}
        />
      </OverlayDialog>
    </div>
  );
}

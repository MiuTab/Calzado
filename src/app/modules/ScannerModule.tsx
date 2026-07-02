import React, { useState, useRef, useEffect } from 'react';
import { ScanLine, Clock, Send, RotateCcw, ShoppingBag, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { AppState, Zapato, SaleSource } from '../types';
import { Barcode } from '../components/Barcode';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  state: AppState;
  isMobile?: boolean;
  onPrestar: (zapatoId: string, localId: string) => void;
  onDevolver: (zapatoId: string) => void;
  onVender: (zapatoId: string, precio: number, por: SaleSource, localId?: string) => void;
}

interface ScanRecord {
  code: string;
  timestamp: Date;
  found: boolean;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

const btnStyle = (variant: 'primary' | 'secondary' | 'danger'): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px',
  border: 'none', borderRadius: 4, fontSize: '13px', fontWeight: 500, cursor: 'pointer',
  ...(variant === 'primary' ? { background: '#C4652B', color: '#fff' } :
      variant === 'danger' ? { background: '#C23B22', color: '#fff' } :
      { background: 'rgba(255,255,255,0.1)', color: '#EAE7E3', border: '1px solid rgba(255,255,255,0.15)' }),
});

export function ScannerModule({ state, isMobile = false, onPrestar, onDevolver, onVender }: Props) {
  const [inputVal, setInputVal] = useState('');
  const [scannedZapato, setScannedZapato] = useState<Zapato | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [actionMode, setActionMode] = useState<'idle' | 'prestar' | 'vender' | 'confirm_devolver'>('idle');
  const [selectedLocal, setSelectedLocal] = useState('');
  const [ventaPrecio, setVentaPrecio] = useState(0);
  const [ventaPor, setVentaPor] = useState<SaleSource>('local_original');
  const [ventaLocal, setVentaLocal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionMode === 'idle') inputRef.current?.focus();
  }, [actionMode, scannedZapato]);

  const handleScan = () => {
    const code = inputVal.trim().toUpperCase();
    if (!code) return;

    const found = state.zapatos.find(z => z.codigo.toUpperCase() === code || z.id === code) ?? null;
    setScanHistory(prev => [{ code, timestamp: new Date(), found: !!found }, ...prev.slice(0, 9)]);
    setScannedZapato(found);
    setActionMode('idle');
    setInputVal('');

    if (!found) {
      toast.error(`Código no encontrado: ${code}`);
    }
  };

  const handlePrestar = () => {
    if (!scannedZapato || !selectedLocal) return;
    onPrestar(scannedZapato.id, selectedLocal);
    const local = state.localesExternos.find(l => l.id === selectedLocal);
    toast.success(`Prestado a ${local?.nombre}`);
    setActionMode('idle');
    setScannedZapato(null);
  };

  const handleDevolver = () => {
    if (!scannedZapato) return;
    onDevolver(scannedZapato.id);
    toast.success('Devolución registrada correctamente');
    setActionMode('idle');
    setScannedZapato(null);
  };

  const handleVender = () => {
    if (!scannedZapato) return;
    onVender(scannedZapato.id, ventaPrecio, ventaPor, ventaPor === 'local_externo' ? ventaLocal : undefined);
    toast.success(`Venta registrada · $${ventaPrecio}`);
    setActionMode('idle');
    setScannedZapato(null);
  };

  const openVender = () => {
    if (!scannedZapato) return;
    setVentaPrecio(scannedZapato.precioVentaSugerido);
    setVentaPor(scannedZapato.estado === 'prestado' ? 'local_externo' : 'local_original');
    setVentaLocal(scannedZapato.localPrestamoId ?? '');
    setActionMode('vender');
  };

  const localDelPrestamo = scannedZapato?.localPrestamoId
    ? state.localesExternos.find(l => l.id === scannedZapato.localPrestamoId)
    : null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: '100%',
      background: '#1A1917',
      color: '#EAE7E3',
      fontFamily: 'inherit',
      overflow: 'hidden',
    }}>
      {/* Left / Top: Scanner terminal */}
      <div style={{
        flex: isMobile ? '0 0 auto' : 1,
        display: 'flex', flexDirection: 'column',
        borderRight: isMobile ? 'none' : '1px solid #2E2B28',
        borderBottom: isMobile ? '1px solid #2E2B28' : 'none',
      }}>
        {/* Header */}
        <div style={{ padding: isMobile ? '14px 16px' : '20px 28px', borderBottom: '1px solid #2E2B28' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ScanLine size={isMobile ? 16 : 20} style={{ color: '#C4652B' }} />
            <h1 style={{ margin: 0, color: '#EAE7E3', fontSize: isMobile ? '15px' : undefined }}>Modo Scanner</h1>
          </div>
          {!isMobile && (
            <div style={{ fontSize: '12px', color: '#7A7369', marginTop: 4 }}>
              Escribe o escanea un código y presiona Enter
            </div>
          )}
        </div>

        {/* Input terminal */}
        <div style={{ padding: isMobile ? '14px 16px' : '28px', borderBottom: '1px solid #2E2B28' }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '16px', color: '#C4652B', userSelect: 'none',
            }}>›_</span>
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => setInputVal(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="CAL001001"
              autoFocus
              style={{
                width: '100%',
                padding: isMobile ? '11px 11px 11px 40px' : '14px 14px 14px 44px',
                boxSizing: 'border-box',
                background: '#0E0D0C', border: '1px solid #3A3530',
                borderRadius: 4, color: '#C4652B', caretColor: '#C4652B',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: isMobile ? '15px' : '18px',
                letterSpacing: '0.10em', outline: 'none',
              }}
            />
          </div>
          <button onClick={handleScan} style={{ marginTop: 12, ...btnStyle('primary'), width: '100%', justifyContent: 'center', padding: '11px' }}>
            <ScanLine size={15} /> Escanear / Enter
          </button>
        </div>

        {/* Scan history — hidden on mobile to save space */}
        {!isMobile && <div style={{ flex: 1, overflow: 'auto', padding: '16px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Clock size={12} style={{ color: '#7A7369' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7A7369' }}>
              Historial de escaneos
            </span>
          </div>
          {scanHistory.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#3A3530', textAlign: 'center', padding: '20px 0' }}>
              Sin escaneos en esta sesión
            </div>
          ) : scanHistory.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
              borderBottom: '1px solid #2A2724',
            }}>
              {s.found
                ? <CheckCircle2 size={14} style={{ color: '#5B7B5A', flexShrink: 0 }} />
                : <XCircle size={14} style={{ color: '#C23B22', flexShrink: 0 }} />}
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', flex: 1 }}>{s.code}</span>
              <span style={{ fontSize: '11px', color: '#7A7369' }}>{formatTime(s.timestamp)}</span>
            </div>
          ))}
        </div>}
      </div>

      {/* Right / Bottom: Result panel */}
      <div style={{
        width: isMobile ? '100%' : 420,
        flex: isMobile ? 1 : undefined,
        display: 'flex', flexDirection: 'column',
        background: '#1E1C1A',
        overflow: 'hidden',
      }}>
        {!scannedZapato ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#3A3530', padding: 32, textAlign: 'center' }}>
            <ScanLine size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <div style={{ fontSize: '14px', color: '#5A554F', fontWeight: 500 }}>Esperando escaneo</div>
            <div style={{ fontSize: '12px', color: '#3A3530', marginTop: 6, lineHeight: 1.6 }}>
              Introduce o escanea un código de barras en el panel izquierdo para ver los detalles del par
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto' }}>
            {/* Shoe card */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #2E2B28' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7A7369', marginBottom: 2 }}>{scannedZapato.marca}</div>
                  <h2 style={{ margin: 0, color: '#EAE7E3' }}>{scannedZapato.nombre}</h2>
                  <div style={{ fontSize: '12px', color: '#7A7369', marginTop: 2 }}>{scannedZapato.modelo}</div>
                </div>
                <StatusBadge status={scannedZapato.estado} />
              </div>

              <div style={{ padding: '14px', background: '#141311', borderRadius: 4, display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <Barcode code={scannedZapato.codigo} height={52} showText color="#D8D3CD" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Talla', scannedZapato.talla, false],
                  ['Color', scannedZapato.color, false],
                  ['Categoría', scannedZapato.categoria, false],
                  ['Precio', `$${scannedZapato.precioVentaSugerido}`, true],
                ].map(([k, v, mono]) => (
                  <div key={String(k)} style={{ padding: '8px 10px', background: '#141311', borderRadius: 4 }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5A554F', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: '13px', color: '#C8C3BC', fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{v}</div>
                  </div>
                ))}
              </div>

              {scannedZapato.estado === 'prestado' && localDelPrestamo && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: '#2A2009', borderRadius: 4, border: '1px solid #4A3A1A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <AlertTriangle size={12} style={{ color: '#C49A3A' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#C49A3A' }}>Prestado</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#C8A95A', fontWeight: 600 }}>{localDelPrestamo.nombre}</div>
                  <div style={{ fontSize: '12px', color: '#9A8040' }}>
                    {daysSince(scannedZapato.fechaPrestamo!)} días en préstamo · desde {new Date(scannedZapato.fechaPrestamo!).toLocaleDateString('es-VE')}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ padding: '20px 24px' }}>
              {actionMode === 'idle' && scannedZapato.estado !== 'vendido' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5A554F', marginBottom: 4 }}>
                    Acciones disponibles
                  </div>
                  {scannedZapato.estado === 'en_bodega' && (
                    <button onClick={() => { setSelectedLocal(''); setActionMode('prestar'); }} style={btnStyle('primary')}>
                      <Send size={14} /> Prestar a Local Externo
                    </button>
                  )}
                  {scannedZapato.estado === 'prestado' && (
                    <button onClick={() => setActionMode('confirm_devolver')} style={btnStyle('secondary')}>
                      <RotateCcw size={14} /> Registrar Devolución
                    </button>
                  )}
                  <button onClick={openVender} style={scannedZapato.estado === 'en_bodega' ? btnStyle('secondary') : btnStyle('primary')}>
                    <ShoppingBag size={14} /> Marcar como Vendido
                  </button>
                  <button onClick={() => setScannedZapato(null)} style={{ ...btnStyle('secondary'), marginTop: 8, color: '#7A7369', borderColor: '#2E2B28' }}>
                    <XCircle size={14} /> Limpiar y escanear otro
                  </button>
                </div>
              )}

              {actionMode === 'idle' && scannedZapato.estado === 'vendido' && (
                <div>
                  <div style={{ padding: '12px', background: '#141311', borderRadius: 4, marginBottom: 12 }}>
                    <div style={{ fontSize: '11px', color: '#5A554F', marginBottom: 4 }}>Este par ya fue vendido</div>
                    <div style={{ fontSize: '13px', color: '#C8C3BC', fontFamily: 'JetBrains Mono, monospace' }}>
                      ${scannedZapato.precioVentaFinal} · {scannedZapato.fechaVenta && new Date(scannedZapato.fechaVenta).toLocaleDateString('es-VE')}
                    </div>
                  </div>
                  <button onClick={() => setScannedZapato(null)} style={btnStyle('secondary')}>
                    <XCircle size={14} /> Limpiar
                  </button>
                </div>
              )}

              {actionMode === 'prestar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#C8C3BC', marginBottom: 4 }}>Seleccionar Local de Destino</div>
                  <select
                    value={selectedLocal}
                    onChange={e => setSelectedLocal(e.target.value)}
                    style={{ padding: '9px 10px', background: '#141311', border: '1px solid #3A3530', borderRadius: 4, color: '#C8C3BC', fontSize: '13px' }}
                  >
                    <option value="">— Seleccionar —</option>
                    {state.localesExternos.filter(l => l.activo).map(l => (
                      <option key={l.id} value={l.id}>{l.nombre}</option>
                    ))}
                  </select>
                  {selectedLocal && (
                    <div style={{ fontSize: '11px', color: '#7A7369', padding: '6px 8px', background: '#141311', borderRadius: 3 }}>
                      {state.localesExternos.find(l => l.id === selectedLocal)?.condicionesPrestamo}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setActionMode('idle')} style={btnStyle('secondary')}>Cancelar</button>
                    <button onClick={handlePrestar} disabled={!selectedLocal}
                      style={{ ...btnStyle('primary'), opacity: selectedLocal ? 1 : 0.5, flex: 1, justifyContent: 'center' }}>
                      <Send size={14} /> Confirmar Préstamo
                    </button>
                  </div>
                </div>
              )}

              {actionMode === 'confirm_devolver' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ padding: '12px', background: '#1A180E', borderRadius: 4, border: '1px solid #4A3A1A' }}>
                    <div style={{ fontSize: '12px', color: '#C8A95A', fontWeight: 600, marginBottom: 4 }}>Confirmar Devolución</div>
                    <div style={{ fontSize: '12px', color: '#9A8040' }}>
                      El par regresará al estado "En Bodega" y el préstamo será cerrado.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setActionMode('idle')} style={btnStyle('secondary')}>Cancelar</button>
                    <button onClick={handleDevolver} style={{ ...btnStyle('primary'), flex: 1, justifyContent: 'center' }}>
                      <RotateCcw size={14} /> Confirmar Devolución
                    </button>
                  </div>
                </div>
              )}

              {actionMode === 'vender' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#C8C3BC', marginBottom: 4 }}>Registrar Venta</div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#5A554F', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Precio Final ($)</div>
                    <input
                      type="number" value={ventaPrecio} onChange={e => setVentaPrecio(Number(e.target.value))}
                      style={{ width: '100%', padding: '9px 10px', background: '#141311', border: '1px solid #3A3530', borderRadius: 4, color: '#C4652B', fontSize: '16px', fontFamily: 'JetBrains Mono, monospace', boxSizing: 'border-box' }}
                    />
                    {ventaPrecio > scannedZapato.precioCosto && (
                      <div style={{ fontSize: '12px', color: '#5B7B5A', marginTop: 4 }}>
                        Ganancia: <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>${(ventaPrecio - scannedZapato.precioCosto).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#5A554F', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vendido Por</div>
                    <select value={ventaPor} onChange={e => setVentaPor(e.target.value as SaleSource)}
                      style={{ width: '100%', padding: '9px 10px', background: '#141311', border: '1px solid #3A3530', borderRadius: 4, color: '#C8C3BC', fontSize: '13px', boxSizing: 'border-box' }}>
                      <option value="local_original">Bodega Central</option>
                      <option value="local_externo">Local Externo</option>
                    </select>
                  </div>
                  {ventaPor === 'local_externo' && (
                    <div>
                      <div style={{ fontSize: '11px', color: '#5A554F', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Local Externo</div>
                      <select value={ventaLocal} onChange={e => setVentaLocal(e.target.value)}
                        style={{ width: '100%', padding: '9px 10px', background: '#141311', border: '1px solid #3A3530', borderRadius: 4, color: '#C8C3BC', fontSize: '13px', boxSizing: 'border-box' }}>
                        <option value="">— Seleccionar —</option>
                        {state.localesExternos.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setActionMode('idle')} style={btnStyle('secondary')}>Cancelar</button>
                    <button onClick={handleVender} style={{ ...btnStyle('primary'), flex: 1, justifyContent: 'center' }}>
                      <ShoppingBag size={14} /> Confirmar Venta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

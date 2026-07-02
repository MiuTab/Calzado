import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { Package, ScanLine, LayoutDashboard, BarChart2, Lock, Menu, X as XIcon } from 'lucide-react';

import type { AppState, AppView, Zapato, LocalExterno, SaleSource } from './types';
import { initialState, generateCodigo } from './data/mockData';
import { InventoryModule } from './modules/InventoryModule';
import { ScannerModule } from './modules/ScannerModule';
import { OperationalPanel } from './modules/OperationalPanel';
import { ManagementPanel } from './modules/ManagementPanel';

// ─── Breakpoint hook ──────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);

  return isMobile;
}

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem { id: AppView; label: string; icon: React.ReactNode; locked?: boolean }

const NAV_ITEMS: NavItem[] = [
  { id: 'operativo',  label: 'Panel Operativo', icon: <LayoutDashboard size={16} /> },
  { id: 'inventario', label: 'Inventario',       icon: <Package size={16} /> },
  { id: 'escaner',    label: 'Escáner',          icon: <ScanLine size={16} /> },
  { id: 'gerencial',  label: 'Panel Gerencial',  icon: <BarChart2 size={16} />, locked: true },
];

const VIEW_LABELS: Record<AppView, string> = {
  operativo: 'Panel Operativo',
  inventario: 'Inventario',
  escaner: 'Escáner',
  gerencial: 'Panel Gerencial',
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  active, onNavigate, onClose,
}: {
  active: AppView;
  onNavigate: (v: AppView) => void;
  onClose?: () => void;
}) {
  const handleNavigate = (id: AppView) => {
    onNavigate(id);
    onClose?.();
  };

  return (
    <div style={{
      width: 220, background: '#1E1C1A', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid #2E2B28', flexShrink: 0, height: '100%',
    }}>
      {/* Brand + close button on mobile */}
      <div style={{
        padding: '18px 16px 16px', borderBottom: '1px solid #2E2B28',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 28, height: 28, background: '#C4652B', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-5 10-5 10 5 10 5" />
              <path d="M2 12s3 5 10 5 10-5 10-5" />
              <circle cx="12" cy="12" r="2" fill="#fff" stroke="none" />
            </svg>
          </div>
          <div>
            <div style={{ color: '#EAE7E3', fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Calzado Sys
            </div>
            <div style={{ color: '#5A554F', fontSize: '10px', letterSpacing: '0.02em' }}>
              BODEGA CENTRAL
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#5A554F', padding: 6, borderRadius: 4,
              display: 'flex', alignItems: 'center',
            }}
            aria-label="Cerrar menú"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px' }}>
        <div style={{
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#3A3530', padding: '8px 10px 6px',
        }}>
          Módulos
        </div>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '10px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                background: isActive ? '#C4652B' : 'transparent',
                color: isActive ? '#fff' : '#9A9590',
                fontSize: '13px', fontWeight: 500, textAlign: 'left',
                marginBottom: 2, fontFamily: 'inherit',
                transition: 'background 0.12s, color 0.12s',
              }}
            >
              <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.locked && !isActive && <Lock size={11} style={{ opacity: 0.35 }} />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid #2E2B28' }}>
        <div style={{ fontSize: '11px', color: '#3A3530', marginBottom: 2 }}>
          {new Date().toLocaleDateString('es-VE', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
          })}
        </div>
        <div style={{ fontSize: '10px', color: '#2E2B28', fontFamily: 'JetBrains Mono, monospace' }}>
          v1.0.0 · Sistema Inventario
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Top Bar ───────────────────────────────────────────────────────────

function MobileTopBar({
  activeView, onOpenMenu,
}: {
  activeView: AppView;
  onOpenMenu: () => void;
}) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 52,
      background: '#1E1C1A', borderBottom: '1px solid #2E2B28',
      display: 'flex', alignItems: 'center', padding: '0 16px',
      zIndex: 40, gap: 12,
    }}>
      {/* Burger */}
      <button
        onClick={onOpenMenu}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#9A9590', padding: 6, borderRadius: 4,
          display: 'flex', alignItems: 'center',
        }}
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 24, height: 24, background: '#C4652B', borderRadius: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-5 10-5 10 5 10 5" />
            <path d="M2 12s3 5 10 5 10-5 10-5" />
          </svg>
        </div>
        <span style={{ color: '#EAE7E3', fontSize: '13px', fontWeight: 600 }}>
          Calzado Sys
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: '#2E2B28' }} />

      {/* Current view */}
      <span style={{ color: '#7A7369', fontSize: '12px', flex: 1 }}>
        {VIEW_LABELS[activeView]}
      </span>
    </div>
  );
}

// ─── App State & Actions ──────────────────────────────────────────────────────

function getNextCodigo(zapatos: Zapato[]): string {
  const max = zapatos.reduce((m, z) => {
    const n = parseInt(z.codigo.replace(/\D/g, ''));
    return isNaN(n) ? m : Math.max(m, n);
  }, 1000);
  return generateCodigo(max + 1);
}

let idCounter = 1000;
const newId = () => `gen_${++idCounter}`;

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [activeView, setActiveView] = useState<AppView>('operativo');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close mobile menu on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Actions ──

  const addZapato = useCallback((data: Omit<Zapato, 'id' | 'codigo'>): Zapato => {
    const codigo = getNextCodigo(state.zapatos);
    const zapato: Zapato = { ...data, id: newId(), codigo };
    setState(s => ({ ...s, zapatos: [...s.zapatos, zapato] }));
    return zapato;
  }, [state.zapatos]);

  const updateZapato = useCallback((id: string, changes: Partial<Zapato>) => {
    setState(s => ({ ...s, zapatos: s.zapatos.map(z => z.id === id ? { ...z, ...changes } : z) }));
  }, []);

  const prestarZapato = useCallback((zapatoId: string, localExternoId: string) => {
    const fechaPrestamo = new Date().toISOString().split('T')[0];
    const prestamo = { id: newId(), zapatoId, localExternoId, fechaPrestamo, estado: 'activo' as const };
    setState(s => ({
      ...s,
      zapatos: s.zapatos.map(z => z.id === zapatoId
        ? { ...z, estado: 'prestado', localPrestamoId: localExternoId, fechaPrestamo } : z),
      prestamos: [...s.prestamos, prestamo],
    }));
  }, []);

  const devolverZapato = useCallback((zapatoId: string) => {
    const fecha = new Date().toISOString().split('T')[0];
    setState(s => ({
      ...s,
      zapatos: s.zapatos.map(z => z.id === zapatoId
        ? { ...z, estado: 'en_bodega', localPrestamoId: undefined, fechaPrestamo: undefined } : z),
      prestamos: s.prestamos.map(p => p.zapatoId === zapatoId && p.estado === 'activo'
        ? { ...p, estado: 'devuelto' as const, fechaDevolucion: fecha } : p),
    }));
  }, []);

  const venderZapato = useCallback((zapatoId: string, precioVenta: number, vendidoPor: SaleSource, localExternoId?: string) => {
    const fecha = new Date().toISOString().split('T')[0];
    setState(s => {
      const z = s.zapatos.find(z => z.id === zapatoId);
      if (!z) return s;
      const prestamoActivo = s.prestamos.find(p => p.zapatoId === zapatoId && p.estado === 'activo');
      return {
        ...s,
        zapatos: s.zapatos.map(zap => zap.id === zapatoId
          ? { ...zap, estado: 'vendido', fechaVenta: fecha, vendidoPor, precioVentaFinal: precioVenta, localVentaId: localExternoId, localPrestamoId: undefined }
          : zap),
        prestamos: s.prestamos.map(p => p.zapatoId === zapatoId && p.estado === 'activo'
          ? { ...p, estado: 'vendido' as const, fechaDevolucion: fecha } : p),
        ventas: [...s.ventas, {
          id: newId(), zapatoId, fecha, precioVenta, precioCosto: z.precioCosto,
          vendidoPor, localExternoId, prestamoId: prestamoActivo?.id,
        }],
      };
    });
  }, []);

  const addLocalExterno = useCallback((data: Omit<LocalExterno, 'id' | 'fechaRegistro'>) => {
    const local: LocalExterno = { ...data, id: newId(), fechaRegistro: new Date().toISOString().split('T')[0] };
    setState(s => ({ ...s, localesExternos: [...s.localesExternos, local] }));
  }, []);

  const updateLocalExterno = useCallback((id: string, changes: Partial<LocalExterno>) => {
    setState(s => ({
      ...s,
      localesExternos: s.localesExternos.map(l => l.id === id ? { ...l, ...changes } : l),
    }));
  }, []);

  // ── Module content ──
  const moduleContent = (
    <>
      {activeView === 'inventario' && (
        <InventoryModule
          state={state} onAddZapato={addZapato} onUpdateZapato={updateZapato}
          onPrestar={prestarZapato} onDevolver={devolverZapato} onVender={venderZapato}
        />
      )}
      {activeView === 'escaner' && (
        <ScannerModule
          state={state} isMobile={isMobile}
          onPrestar={prestarZapato} onDevolver={devolverZapato} onVender={venderZapato}
        />
      )}
      {activeView === 'operativo' && (
        <OperationalPanel
          state={state} onPrestar={prestarZapato} onDevolver={devolverZapato}
          onVender={venderZapato} onAddLocal={addLocalExterno} onUpdateLocal={updateLocalExterno}
        />
      )}
      {activeView === 'gerencial' && <ManagementPanel state={state} />}
    </>
  );

  // ── Desktop layout ──
  if (!isMobile) {
    return (
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
        <Sidebar active={activeView} onNavigate={setActiveView} />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#F7F6F4' }}>
          {moduleContent}
        </main>
        <Toaster position="bottom-right" toastOptions={toasterOptions} />
      </div>
    );
  }

  // ── Mobile layout ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
      {/* Fixed top bar */}
      <MobileTopBar activeView={activeView} onOpenMenu={() => setMobileMenuOpen(true)} />

      {/* Overlay (backdrop) */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(26,25,23,0.65)',
            zIndex: 45, backdropFilter: 'blur(1px)',
          }}
        />
      )}

      {/* Slide-over sidebar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 240, zIndex: 46,
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: mobileMenuOpen ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
      }}>
        <Sidebar
          active={activeView}
          onNavigate={setActiveView}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Content area (below top bar) */}
      <main style={{
        flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        background: '#F7F6F4', marginTop: 52,
      }}>
        {moduleContent}
      </main>

      <Toaster position="bottom-center" toastOptions={toasterOptions} />
    </div>
  );
}

const toasterOptions = {
  style: {
    background: '#1A1917',
    color: '#EAE7E3',
    border: '1px solid #2E2B28',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: "'Inter Tight', sans-serif",
  },
};

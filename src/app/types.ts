export type ShoeStatus = 'en_bodega' | 'prestado' | 'vendido';
export type SaleSource = 'local_original' | 'local_externo';
export type LoanStatus = 'activo' | 'devuelto' | 'vendido';
export type Categoria = 'deportivo' | 'casual' | 'formal' | 'bota' | 'sandalia';

export interface LocalExterno {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  condicionesPrestamo: string;
  activo: boolean;
  fechaRegistro: string;
}

export interface Zapato {
  id: string;
  codigo: string;
  nombre: string;
  marca: string;
  modelo: string;
  talla: string;
  color: string;
  precioCosto: number;
  precioVentaSugerido: number;
  categoria: Categoria;
  imagenUrl?: string;
  localOrigen: string;
  estado: ShoeStatus;
  localPrestamoId?: string;
  fechaPrestamo?: string;
  fechaVenta?: string;
  vendidoPor?: SaleSource;
  precioVentaFinal?: number;
  localVentaId?: string;
}

export interface Prestamo {
  id: string;
  zapatoId: string;
  localExternoId: string;
  fechaPrestamo: string;
  fechaDevolucion?: string;
  estado: LoanStatus;
  notas?: string;
}

export interface Venta {
  id: string;
  zapatoId: string;
  fecha: string;
  precioVenta: number;
  precioCosto: number;
  vendidoPor: SaleSource;
  localExternoId?: string;
  prestamoId?: string;
}

export interface AppState {
  zapatos: Zapato[];
  localesExternos: LocalExterno[];
  prestamos: Prestamo[];
  ventas: Venta[];
}

export type AppView = 'inventario' | 'escaner' | 'operativo' | 'gerencial';

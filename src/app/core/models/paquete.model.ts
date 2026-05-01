import { PrendaResponse } from './prenda.model';

export type EstadoPaquete = 'ACTIVO' | 'CERRADO';

export interface PaqueteDetalle {
  cantidadPrendas: number;
  total: number;
  pagado: number;
  pendiente: number;
  prendas: PrendaResponse[];
}

export interface PaqueteResumen {
  paqueteId: number;
  estado: EstadoPaquete;
  cantidadPrendas: number;
  total: number;
  pagado: number;
  pendiente: number;
}

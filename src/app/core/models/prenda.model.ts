export type EstadoPrenda = 'BUEN_ESTADO' | 'LAVANDERIA' | 'REPARACION';

export interface PrendaResponse {
  id?: number;
  descripcion: string;
  precioPagado: number;
  precioTotal: number;
  estado: EstadoPrenda;
}

export interface PrendaItemRequest {
  descripcion: string;
  precioTotal: number;
  precioPagado: number;
  estado: EstadoPrenda;
}

export interface ActualizarPrendaRequest {
  descripcion?: string;
  precioTotal?: number;
  precioPagado?: number;
  estado?: EstadoPrenda;
}

export interface RegistrarPrendasRequest {
  clienteId: number;
  usuarioTikTok: string;
  telefono: string;
  prendas: PrendaItemRequest[];
}

export interface RegistrarPrendasResponse {
  clienteId: number;
  usuarioTikTok: string;
  cantidadPrendas: number;
  total: number;
  pagado: number;
  pendiente: number;
  paqueteId: number;
}

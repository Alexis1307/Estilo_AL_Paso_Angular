import { PaqueteDetalle } from './paquete.model';

export type EstadoCliente = 'PAGADO' | 'PENDIENTE' | 'SIN_PRENDAS';

export interface AgenciaResponse {
  id: number;
  nombre: string;
}

export interface ClienteListaResponse {
  id: number;
  usuarioTikTok: string;
  telefono: string;
  ciudad: string | null;
  direccion: string | null;
  agencia: AgenciaResponse | null;
  estado: EstadoCliente;
}

export interface ClienteDetalleResponse {
  id: number;
  nombreReal: string;
  usuarioTikTok: string;
  dni: string;
  telefono: string;
  ciudad: string | null;
  direccion: string | null;
  agencia: string | null;
  paquete: PaqueteDetalle | null;
}

export interface ClienteCreateRequest {
  usuarioTikTok: string;
  nombreReal: string;
  dni: string;
  telefono: string;
  direccion: string;
  agenciaId: number | null;
  ciudad: string;
}

export interface ClienteUpdateRequest {
  usuarioTikTok?: string;
  nombreReal?: string;
  dni?: string;
  telefono?: string;
  direccion?: string | null;
  agenciaId?: number | null;
  ciudad?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

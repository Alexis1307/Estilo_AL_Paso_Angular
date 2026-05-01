import { EstadoCliente, AgenciaResponse } from './cliente.model';

export type TipoEnvio = 'DELIVERY' | 'ENCOMIENDA';
export type EstadoEnvio = 'PENDIENTE' | 'ENVIADO' | 'CANCELADO';

export interface EnvioResponse {
  envioId: number;
  usuarioTikTok: string;
  nombreReal: string;
  telefono: string;
  direccion: string | null;
  ciudad: string | null;
  agencia: AgenciaResponse | null;
  cantidadPrendas: number;
  total: number;
  pagado: number;
  estadoCliente: EstadoCliente;
  tipoEnvio: TipoEnvio;
  estadoEnvio: EstadoEnvio;
  clave: string | null;
  fechaCreacion: string;
  fechaEnvio: string | null;
}

export interface EnvioListadoResponse {
  delivery: EnvioResponse[];
  encomienda: EnvioResponse[];
}

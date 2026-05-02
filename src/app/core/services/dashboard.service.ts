import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface DashboardCardsDTO {
  paquetesActivos: number;
  enviosPendientes: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
}

export interface PaqueteActivoDTO {
  usuarioTiktok: string;
  cantidadPrendas: number;
  estadoPago: 'PAGADO' | 'PENDIENTE';
}

export interface ClienteDeudaDTO {
  usuarioTiktok: string;
  deudaTotal: number;
}

export interface ClienteMantenimientoDTO {
  usuarioTiktok: string;
  prendasMantenimiento: number;
}

export interface DashboardResponse {
  cards: DashboardCardsDTO;
  paquetesActivos: PaqueteActivoDTO[];
  clientesDeuda: ClienteDeudaDTO[];
  mantenimiento: ClienteMantenimientoDTO[];
}


@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private readonly baseUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}


  obtenerDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.baseUrl);
  }
}

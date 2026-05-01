import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaqueteDetalle, PaqueteResumen } from '../models/paquete.model';

@Injectable({ providedIn: 'root' })
export class PaqueteService {
  constructor(private http: HttpClient) {}

  listarPorCliente(clienteId: number): Observable<PaqueteResumen[]> {
    return this.http.get<PaqueteResumen[]>(`http://localhost:8080/${clienteId}/paquetes`);
  }

  obtenerDetalle(paqueteId: number): Observable<PaqueteDetalle> {
    return this.http.get<PaqueteDetalle>(`http://localhost:8080/paquetes/${paqueteId}`);
  }
}

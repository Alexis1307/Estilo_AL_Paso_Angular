import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvioListadoResponse, EnvioResponse, EstadoEnvio } from '../models/envio.model';

@Injectable({ providedIn: 'root' })
export class EnvioService {
  private readonly url = 'http://localhost:8080/envios';

  constructor(private http: HttpClient) {}

  listar(): Observable<EnvioListadoResponse> {
    return this.http.get<EnvioListadoResponse>(this.url);
  }

  listarPorCliente(clienteId: number, estadoEnvio?: EstadoEnvio): Observable<EnvioResponse[]> {
    let params = new HttpParams();

    if (estadoEnvio) {
      params = params.set('estado', estadoEnvio);
    }

    return this.http.get<EnvioResponse[]>(`${this.url}/cliente/${clienteId}`, { params });
  }

  crear(clienteId: number): Observable<string> {
    return this.http.post(`${this.url}/cliente/${clienteId}`, {}, { responseType: 'text' });
  }

  cancelar(envioId: number): Observable<string> {
    return this.http.patch(`${this.url}/${envioId}/cancelar`, {}, { responseType: 'text' });
  }

  enviar(envioId: number): Observable<string> {
    return this.http.patch(`${this.url}/${envioId}/enviar`, {}, { responseType: 'text' });
  }

  generarClaveLote(): Observable<{ clave: string }> {
    return this.http.post<{ clave: string }>(`${this.url}/clave-lote`, {});
  }

  exportarExcel(origen: number): Observable<Blob> {
    return this.http.get(`${this.url}/exportar-excel`, {
      params: { origen },
      responseType: 'blob',
    });
  }
}

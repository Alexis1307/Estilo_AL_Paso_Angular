import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ClienteCreateRequest,
  ClienteDetalleResponse,
  ClienteListaResponse,
  ClienteUpdateRequest,
  PageResponse,
} from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly url = 'http://localhost:8080/clientes';

  constructor(private http: HttpClient) {}

  listar(
    usuarioTikTok = '',
    telefono = '',
    page = 0,
    size = 10,
  ): Observable<PageResponse<ClienteListaResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (usuarioTikTok) {
      params = params.set('usuarioTikTok', usuarioTikTok);
    }

    if (telefono) {
      params = params.set('telefono', telefono);
    }

    return this.http.get<PageResponse<ClienteListaResponse>>(this.url, { params });
  }

  buscar(usuarioTikTok = '', telefono = ''): Observable<PageResponse<ClienteListaResponse>> {
    let params = new HttpParams().set('page', 0).set('size', 20);

    if (usuarioTikTok) {
      params = params.set('usuarioTikTok', usuarioTikTok);
    }

    if (telefono) {
      params = params.set('telefono', telefono);
    }

    return this.http.get<PageResponse<ClienteListaResponse>>(this.url, { params });
  }

  obtener(id: number): Observable<ClienteDetalleResponse> {
    return this.http.get<ClienteDetalleResponse>(`${this.url}/${id}`);
  }

  crear(request: ClienteCreateRequest): Observable<ClienteListaResponse> {
    return this.http.post<ClienteListaResponse>(this.url, request);
  }

  actualizar(id: number, request: ClienteUpdateRequest): Observable<ClienteDetalleResponse> {
    return this.http.patch<ClienteDetalleResponse>(`${this.url}/${id}`, request);
  }
}

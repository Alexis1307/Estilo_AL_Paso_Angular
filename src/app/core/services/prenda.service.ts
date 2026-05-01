import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ActualizarPrendaRequest,
  PrendaResponse,
  RegistrarPrendasRequest,
  RegistrarPrendasResponse,
} from '../models/prenda.model';

@Injectable({ providedIn: 'root' })
export class PrendaService {
  private readonly url = 'http://localhost:8080/prendas';

  constructor(private http: HttpClient) {}

  registrar(request: RegistrarPrendasRequest): Observable<RegistrarPrendasResponse> {
    return this.http.post<RegistrarPrendasResponse>(`${this.url}/registrar`, request);
  }

  obtener(id: number): Observable<PrendaResponse> {
    return this.http.get<PrendaResponse>(`${this.url}/${id}`);
  }

  actualizar(id: number, request: ActualizarPrendaRequest): Observable<RegistrarPrendasResponse> {
    return this.http.patch<RegistrarPrendasResponse>(`${this.url}/${id}`, request);
  }

  eliminar(id: number): Observable<RegistrarPrendasResponse> {
    return this.http.delete<RegistrarPrendasResponse>(`${this.url}/${id}`);
  }
}

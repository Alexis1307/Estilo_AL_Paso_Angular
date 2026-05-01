import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgenciaResponse } from '../models/agencia.model';

@Injectable({ providedIn: 'root' })
export class AgenciaService {
  private readonly url = 'http://localhost:8080/agencias';

  constructor(private http: HttpClient) {}

  autocomplete(query: string): Observable<AgenciaResponse[]> {
    return this.http.get<AgenciaResponse[]>(`${this.url}/buscar`, {
      params: { query },
    });
  }
}

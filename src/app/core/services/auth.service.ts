import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly url = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, request).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('nombreUser', res.nombreUser);
        localStorage.setItem('rol', res.rol);
      }),
    );
  }

  logout(): void {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUsuario(): string {
    return localStorage.getItem('nombreUser') || '';
  }

  getRol(): string {
    return localStorage.getItem('rol') || '';
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  datos: LoginRequest = { nombreUser: '', passwordUser: '' };
  cargando = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app/dashboard']);
    }
  }

  onLogin(): void {
    if (!this.datos.nombreUser || !this.datos.passwordUser) {
      this.error = 'Completa todos los campos';
      return;
    }
    this.cargando = true;
    this.error = '';
    this.authService.login(this.datos).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: () => {
        this.error = 'Usuario o contraseña incorrectos';
        this.cargando = false;
      },
    });
  }
}

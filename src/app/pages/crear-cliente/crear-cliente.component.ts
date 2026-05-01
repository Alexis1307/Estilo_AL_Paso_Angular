import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ClienteService } from '../../core/services/cliente.service';
import { AgenciaService } from '../../core/services/agencia.service';
import { ClienteCreateRequest } from '../../core/models/cliente.model';
import { AgenciaResponse } from '../../core/models/agencia.model';

@Component({
  selector: 'app-crear-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-cliente.component.html',
  styleUrl: './crear-cliente.component.css',
})
export class CrearClienteComponent {
  datos: ClienteCreateRequest = {
    usuarioTikTok: '',
    nombreReal: '',
    dni: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    agenciaId: null,
  };

  agencias: AgenciaResponse[] = [];
  busquedaAgencia = '';
  guardando = false;
  error = '';
  exito = '';

  private agenciaSubject = new Subject<string>();

  constructor(
    private clienteService: ClienteService,
    private agenciaService: AgenciaService,
    private router: Router,
  ) {
    this.agenciaSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((q) => {
      if (q.length >= 1) this.buscarAgencias(q);
    });
  }

  get esTrujillo(): boolean {
    return this.datos.ciudad?.trim().toLowerCase() === 'trujillo';
  }

  onCiudadChange(): void {
    this.datos.agenciaId = null;
    this.datos.direccion = '';
    this.agencias = [];
    this.busquedaAgencia = '';
  }

  onAgenciaBusquedaChange(): void {
    this.agenciaSubject.next(this.busquedaAgencia);
  }

  buscarAgencias(q: string): void {
    this.agenciaService.autocomplete(q).subscribe({
      next: (res) => (this.agencias = res),
      error: () => {},
    });
  }

  seleccionarAgencia(a: AgenciaResponse): void {
    this.datos.agenciaId = a.id;
    this.busquedaAgencia = a.nombre;
    this.agencias = [];
  }

  guardar(): void {
    if (!this.datos.usuarioTikTok || !this.datos.telefono) {
      this.error = 'Usuario TikTok y teléfono son obligatorios';
      return;
    }
    if (this.datos.telefono.length !== 9) {
      this.error = 'El teléfono debe tener 9 dígitos';
      return;
    }
    if (this.datos.dni && this.datos.dni.length !== 8) {
      this.error = 'El DNI debe tener 8 dígitos';
      return;
    }

    this.guardando = true;
    this.error = '';

    const payload = { ...this.datos };
    if (this.esTrujillo) {
      payload.agenciaId = null;
    } else {
      payload.direccion = '';
    }

    this.clienteService.crear(payload).subscribe({
      next: (res) => {
        this.exito = `Cliente creado correctamente (ID: ${res.id})`;
        this.guardando = false;
        setTimeout(() => this.router.navigate(['/app/clientes']), 1500);
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al crear cliente';
        this.guardando = false;
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/app/clientes']);
  }
}

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

  modo: 'TRUJILLO' | 'OTRO' | null = null;

  agencias: AgenciaResponse[] = [];
  busquedaAgencia = '';

  guardando = false;
  error = '';
  exito = '';

  private agenciaSubject = new Subject<string>();

  constructor(
    private clienteService: ClienteService,
    private agenciaService: AgenciaService,
    private router: Router
  ) {
    this.agenciaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(q => this.buscarAgencias(q));
  }

  seleccionarModo(modo: 'TRUJILLO' | 'OTRO') {
    this.modo = modo;

    if (modo === 'TRUJILLO') {
      this.datos.ciudad = 'Trujillo';
      this.datos.agenciaId = null;
      this.busquedaAgencia = '';
      this.agencias = [];
    } else {
      this.datos.ciudad = '';
      this.datos.direccion = '';
    }
  }

  get esTrujillo(): boolean {
    return this.modo === 'TRUJILLO';
  }

  onCiudadChange(): void {
    if (this.modo !== 'TRUJILLO') {
      this.datos.agenciaId = null;
    }
  }

  onAgenciaBusquedaChange(): void {
    this.agenciaSubject.next(this.busquedaAgencia);
  }

  buscarAgencias(q: string): void {
    if (!q) {
      this.agencias = [];
      return;
    }

    this.agenciaService.autocomplete(q).subscribe({
      next: res => this.agencias = res,
      error: () => this.agencias = []
    });
  }

  seleccionarAgencia(a: AgenciaResponse): void {
    this.datos.agenciaId = a.id;
    this.busquedaAgencia = a.nombre;
    this.agencias = [];
  }

  guardar(): void {

    if (!this.datos.usuarioTikTok || !this.datos.telefono) {
      this.error = 'Completa los campos obligatorios';
      return;
    }

    const payload: ClienteCreateRequest = {
      usuarioTikTok: this.datos.usuarioTikTok,
      nombreReal: this.datos.nombreReal,
      dni: this.datos.dni,
      telefono: this.datos.telefono,
      ciudad: this.datos.ciudad,
      direccion: this.esTrujillo ? this.datos.direccion : '',
      agenciaId: this.esTrujillo ? null : this.datos.agenciaId,
    };

    this.guardando = true;

    this.clienteService.crear(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.exito = 'Cliente creado correctamente';

        setTimeout(() => {
          this.router.navigate(['/app/clientes']);
        }, 800);
      },
      error: err => {
        this.guardando = false;
        this.error = err.error?.error || 'Error al crear cliente';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/app/clientes']);
  }
}

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ClienteService } from '../../core/services/cliente.service';
import { PrendaService } from '../../core/services/prenda.service';

import { ClienteListaResponse } from '../../core/models/cliente.model';
import { PrendaItemRequest } from '../../core/models/prenda.model';

@Component({
  selector: 'app-registrar-prenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-prenda.component.html',
  styleUrl: './registrar-prenda.component.css',
})
export class RegistrarPrendaComponent implements OnDestroy {

  // =========================
  // CLIENTE
  // =========================
  busqueda = '';
  busquedaTelefono = '';
  resultadosBusqueda: ClienteListaResponse[] = [];
  buscando = false;
  clienteSeleccionado: ClienteListaResponse | null = null;

  modalClienteAbierto = false;

  // =========================
  // PRENDAS
  // =========================
  prendasEnMemoria: PrendaItemRequest[] = [];
  nuevaPrenda: PrendaItemRequest = this.prendaVacia();

  // =========================
  // ESTADOS
  // =========================
  guardando = false;
  exito = '';
  errorGuardar = '';

  private destroy$ = new Subject<void>();

  constructor(
    private clienteService: ClienteService,
    private prendaService: PrendaService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =========================
  // CLIENTES
  // =========================
  buscarClientes(): void {
    const usuario = this.busqueda.trim();
    const telefono = this.busquedaTelefono.trim();

    if (!usuario && !telefono) {
      this.resultadosBusqueda = [];
      return;
    }

    this.buscando = true;

    this.clienteService.buscar(usuario, telefono)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.resultadosBusqueda = res.content || [];
          this.buscando = false;
        },
        error: () => {
          this.resultadosBusqueda = [];
          this.buscando = false;
        }
      });
  }

  abrirModalCliente(): void {
    this.modalClienteAbierto = true;
  }

  cerrarModalCliente(): void {
    this.modalClienteAbierto = false;
  }

  seleccionarCliente(cliente: ClienteListaResponse): void {
    this.clienteSeleccionado = cliente;
    this.cerrarModalCliente();
    this.prendasEnMemoria = [];
  }

  limpiarCliente(): void {
    this.clienteSeleccionado = null;
    this.prendasEnMemoria = [];
  }

  irCrearCliente(): void {
    this.router.navigate(['/app/crear-cliente']);
  }

  // =========================
  // PRENDAS
  // =========================
  agregarPrenda(): void {
    if (!this.nuevaPrenda.descripcion?.trim()) return;
    if (this.nuevaPrenda.precioTotal <= 0) return;

    this.prendasEnMemoria.push({
      descripcion: this.nuevaPrenda.descripcion,
      precioTotal: this.nuevaPrenda.precioTotal,
      precioPagado: this.nuevaPrenda.precioPagado,
      estado: this.nuevaPrenda.estado,
    });

    this.nuevaPrenda = this.prendaVacia();
  }

  quitarPrenda(index: number): void {
    this.prendasEnMemoria.splice(index, 1);
  }

  autocompletarPago(): void {
    this.nuevaPrenda.precioPagado = this.nuevaPrenda.precioTotal;
  }

  // =========================
  // CALCULOS (COMPATIBLE CON HTML)
  // =========================
  get totalPaquete(): number {
    return this.prendasEnMemoria.reduce((a, b) => a + b.precioTotal, 0);
  }

  get pagadoPaquete(): number {
    return this.prendasEnMemoria.reduce((a, b) => a + b.precioPagado, 0);
  }

  get pendientePaquete(): number {
    return this.totalPaquete - this.pagadoPaquete;
  }

  // =========================
  // GUARDAR (SIN SPINNER, CON REFRESH)
  // =========================
  guardarPaquete(): void {
    if (!this.clienteSeleccionado || this.prendasEnMemoria.length === 0) {
      return;
    }

    if (this.guardando) return;

    this.guardando = true;
    this.exito = '';
    this.errorGuardar = '';

    this.prendaService.registrar({
      clienteId: this.clienteSeleccionado.id,
      usuarioTikTok: this.clienteSeleccionado.usuarioTikTok,
      telefono: this.clienteSeleccionado.telefono,
      prendas: this.prendasEnMemoria,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {

        this.exito = `Paquete registrado (${res.cantidadPrendas})`;

        this.prendasEnMemoria = [];
        this.clienteSeleccionado = null;

        this.guardando = false;

        // 🔥 REFRESH CONTROLADO (no inmediato)
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      },

      error: () => {
        this.errorGuardar = 'Error al registrar el paquete';
        this.guardando = false;
      }
    });
  }

  // =========================
  // UTIL
  // =========================
  private prendaVacia(): PrendaItemRequest {
    return {
      descripcion: '',
      precioTotal: 0,
      precioPagado: 0,
      estado: 'BUEN_ESTADO',
    };
  }
}

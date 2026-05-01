import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ClienteService } from '../../core/services/cliente.service';
import { PrendaService } from '../../core/services/prenda.service';
import { ClienteListaResponse } from '../../core/models/cliente.model';
import { PrendaItemRequest, EstadoPrenda } from '../../core/models/prenda.model';

@Component({
  selector: 'app-registrar-prenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-prenda.component.html',
  styleUrl: './registrar-prenda.component.css',
})
export class RegistrarPrendaComponent {
  busqueda = '';
  busquedaTelefono = '';
  resultadosBusqueda: ClienteListaResponse[] = [];
  buscando = false;
  clienteSeleccionado: ClienteListaResponse | null = null;

  prendasEnMemoria: PrendaItemRequest[] = [];

  nuevaPrenda: PrendaItemRequest = this.prendaVacia();
  guardando = false;
  exito = '';
  errorGuardar = '';

  private busquedaSubject = new Subject<string>();

  constructor(
    private clienteService: ClienteService,
    private prendaService: PrendaService,
    private router: Router,
  ) {
    this.busquedaSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((query) => {
      if (query.length >= 2) this.buscarClientes();
    });
  }

  onBusquedaChange(): void {
    this.busquedaSubject.next(this.busqueda);
  }

  buscarClientes(): void {
    this.buscando = true;
    this.clienteService.buscar(this.busqueda, this.busquedaTelefono).subscribe({
      next: (res) => {
        this.resultadosBusqueda = res.content;
        this.buscando = false;
      },
      error: () => (this.buscando = false),
    });
  }

  seleccionarCliente(c: ClienteListaResponse): void {
    this.clienteSeleccionado = c;
    this.resultadosBusqueda = [];
    this.busqueda = c.usuarioTikTok;
  }

  limpiarCliente(): void {
    this.clienteSeleccionado = null;
    this.busqueda = '';
    this.busquedaTelefono = '';
    this.prendasEnMemoria = [];
  }

  autocompletarPago(): void {
    this.nuevaPrenda.precioPagado = this.nuevaPrenda.precioTotal;
  }

  agregarPrenda(): void {
    if (!this.nuevaPrenda.descripcion || !this.nuevaPrenda.precioTotal) {
      alert('Completa descripción y precio total');
      return;
    }
    if (this.nuevaPrenda.precioPagado > this.nuevaPrenda.precioTotal) {
      alert('El precio pagado no puede ser mayor al total');
      return;
    }
    this.prendasEnMemoria.push({ ...this.nuevaPrenda });
    this.nuevaPrenda = this.prendaVacia();
  }

  quitarPrenda(index: number): void {
    this.prendasEnMemoria.splice(index, 1);
  }

  get totalPaquete(): number {
    return this.prendasEnMemoria.reduce((s, p) => s + p.precioTotal, 0);
  }

  get pagadoPaquete(): number {
    return this.prendasEnMemoria.reduce((s, p) => s + p.precioPagado, 0);
  }

  get pendientePaquete(): number {
    return this.totalPaquete - this.pagadoPaquete;
  }

  guardarPaquete(): void {
    if (!this.clienteSeleccionado) {
      alert('Selecciona un cliente');
      return;
    }
    if (this.prendasEnMemoria.length === 0) {
      alert('Agrega al menos una prenda');
      return;
    }

    this.guardando = true;
    this.errorGuardar = '';

    this.prendaService
      .registrar({
        clienteId: this.clienteSeleccionado.id,
        usuarioTikTok: this.clienteSeleccionado.usuarioTikTok,
        telefono: this.clienteSeleccionado.telefono,
        prendas: this.prendasEnMemoria,
      })
      .subscribe({
        next: (res) => {
          this.exito = `Paquete registrado: ${res.cantidadPrendas} prendas — Total S/ ${res.total}`;
          this.prendasEnMemoria = [];
          this.clienteSeleccionado = null;
          this.busqueda = '';
          this.guardando = false;
        },
        error: (err) => {
          this.errorGuardar = err.error?.error || 'Error al registrar';
          this.guardando = false;
        },
      });
  }

  irCrearCliente(): void {
    this.router.navigate(['/app/crear-cliente']);
  }

  private prendaVacia(): PrendaItemRequest {
    return { descripcion: '', precioTotal: 0, precioPagado: 0, estado: 'BUEN_ESTADO' };
  }
}

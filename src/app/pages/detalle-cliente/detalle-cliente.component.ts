import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ClienteService } from '../../core/services/cliente.service';
import { PaqueteService } from '../../core/services/paquete.service';
import { PrendaService } from '../../core/services/prenda.service';
import { EnvioService } from '../../core/services/envio.service';
import { ClienteUpdateRequest } from '../../core/models/cliente.model';

type FiltroEnvio = 'TODOS' | 'PENDIENTE' | 'ENVIADO' | 'CANCELADO';

@Component({
  selector: 'app-detalle-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-cliente.component.html',
  styleUrls: ['./detalle-cliente.component.css']
})
export class DetalleClienteComponent implements OnInit {

  cliente: any;

  clienteEdit: ClienteUpdateRequest = {
    usuarioTikTok: '',
    nombreReal: '',
    dni: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    agenciaId: null
  };

  paqueteActivo: any;
  prendas: any[] = [];
  envios: any[] = [];

  filtroEnvio: FiltroEnvio = 'TODOS';
  clienteId!: number;

  mostrarModalEditarCliente = false;

  mostrarModalPrenda = false;
  prendaSeleccionada: any = null;
  prendaIdSeleccionada: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private paqueteService: PaqueteService,
    private prendaService: PrendaService,
    private envioService: EnvioService
  ) {}

  ngOnInit(): void {
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarCliente();
  }

  cargarCliente(): void {
    this.clienteService.obtener(this.clienteId).subscribe({
      next: (res) => {
        this.cliente = res;
        this.paqueteActivo = res.paquete;
        this.prendas = res.paquete?.prendas || [];
        this.cargarEnvios();
      },
      error: (err) => {
        console.error('[ERROR] cargar cliente:', err);
      }
    });
  }

  esTrujillo(): boolean {
    return (this.cliente?.ciudad ?? '').toLowerCase() === 'trujillo';
  }

  abrirModalEditar(): void {
    this.clienteEdit = {
      usuarioTikTok: this.cliente?.usuarioTikTok ?? '',
      nombreReal: this.cliente?.nombreReal ?? '',
      dni: this.cliente?.dni ?? '',
      telefono: this.cliente?.telefono ?? '',
      direccion: this.cliente?.direccion ?? '',
      ciudad: this.cliente?.ciudad ?? '',
      agenciaId: null
    };

    this.mostrarModalEditarCliente = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditarCliente = false;
  }

  guardarCliente(): void {
    if (!this.clienteEdit.nombreReal || !this.clienteEdit.usuarioTikTok || !this.clienteEdit.telefono) {
      console.warn('Faltan campos obligatorios');
      return;
    }

    this.clienteService.actualizar(this.clienteId, this.clienteEdit)
      .subscribe({
        next: () => {
          this.mostrarModalEditarCliente = false;
          this.cargarCliente();
        },
        error: (err) => {
          console.error('[ERROR update cliente]', err);
        }
      });
  }

  volver(): void {
    this.router.navigate(['/app/clientes']);
  }

  verHistorialPaquetes(): void {
    this.router.navigate([`/app/clientes/${this.clienteId}/paquetes`]);
  }

  verHistorialEnvios(): void {
    this.router.navigate([`/app/clientes/${this.clienteId}/envios`]);
  }

  cambiarFiltroEnvio(estado: FiltroEnvio): void {
    this.filtroEnvio = estado;
    this.cargarEnvios();
  }

  cargarEnvios(): void {
    const estadoApi = this.filtroEnvio === 'TODOS' ? undefined : this.filtroEnvio;

    this.envioService.listarPorCliente(this.clienteId, estadoApi as any)
      .subscribe({
        next: (res) => this.envios = res,
        error: (err) => console.error('[ERROR] cargar envios:', err)
      });
  }

  crearEnvio(): void {
    this.envioService.crear(this.clienteId)
      .subscribe({
        next: () => this.cargarEnvios(),
        error: (err) => console.error('[ERROR] crear envio:', err)
      });
  }

  abrirModalPrenda(prenda: any): void {
    const id = prenda?.prendaId ?? prenda?.id;

    if (!id) {
      console.error('[ERROR] prenda sin id:', prenda);
      return;
    }

    this.prendaIdSeleccionada = id;

    this.prendaService.obtener(id).subscribe({
      next: (res) => {
        this.prendaSeleccionada = res;
        this.mostrarModalPrenda = true;
      },
      error: (err) => {
        console.error('[ERROR] prenda endpoint:', err);
      }
    });
  }

  cerrarModalPrenda(): void {
    this.mostrarModalPrenda = false;
    this.prendaSeleccionada = null;
    this.prendaIdSeleccionada = null;
  }

  actualizarPrenda(): void {
    if (!this.prendaIdSeleccionada || !this.prendaSeleccionada) return;

    const request = {
      descripcion: this.prendaSeleccionada.descripcion,
      precioPagado: this.prendaSeleccionada.precioPagado,
      precioTotal: this.prendaSeleccionada.precioTotal,
      estado: this.prendaSeleccionada.estado
    };

    this.prendaService.actualizar(this.prendaIdSeleccionada, request)
      .subscribe({
        next: () => {
          this.cerrarModalPrenda();
          this.cargarCliente();
        },
        error: (err) => {
          console.error('[ERROR] update prenda:', err);
        }
      });
  }

  eliminarPrenda(): void {
    if (!this.prendaIdSeleccionada) return;

    if (!confirm('¿Eliminar prenda?')) return;

    this.prendaService.eliminar(this.prendaIdSeleccionada)
      .subscribe({
        next: () => {
          this.cerrarModalPrenda();
          this.cargarCliente();
        },
        error: (err) => {
          console.error('[ERROR] eliminar prenda:', err);
        }
      });
  }
}

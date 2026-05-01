import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../core/services/cliente.service';
import { PaqueteService } from '../../core/services/paquete.service';
import { PrendaService } from '../../core/services/prenda.service';
import { EnvioService } from '../../core/services/envio.service';
import { AgenciaService } from '../../core/services/agencia.service';
import { ClienteDetalleResponse, ClienteUpdateRequest } from '../../core/models/cliente.model';
import { PaqueteResumen, PaqueteDetalle } from '../../core/models/paquete.model';
import { PrendaResponse, ActualizarPrendaRequest } from '../../core/models/prenda.model';
import { EnvioResponse } from '../../core/models/envio.model';
import { AgenciaResponse } from '../../core/models/agencia.model';

@Component({
  selector: 'app-detalle-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-cliente.component.html',
  styleUrl: './detalle-cliente.component.css',
})
export class DetalleClienteComponent implements OnInit {
  clienteId = 0;
  cliente: ClienteDetalleResponse | null = null;
  cargando = true;
  error = '';

  paquetes: PaqueteResumen[] = [];
  cargandoPaquetes = false;

  envios: EnvioResponse[] = [];
  filtroEstadoEnvio: 'PENDIENTE' | 'ENVIADO' | 'CANCELADO' | '' = '';
  cargandoEnvios = false;

  agencias: AgenciaResponse[] = [];

  mostrarModalEditar = false;
  editData: ClienteUpdateRequest = {};
  guardandoEdit = false;
  errorEdit = '';

  mostrarModalPrenda = false;
  prendaSeleccionada: PrendaResponse | null = null;
  prendaIdSeleccionada = 0;
  cargandoPrenda = false;
  editPrenda: ActualizarPrendaRequest = {};
  guardandoPrenda = false;

  mostrarModalPaquete = false;
  paqueteDetalle: PaqueteDetalle | null = null;
  cargandoPaqueteDetalle = false;

  creandoEnvio = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private paqueteService: PaqueteService,
    private prendaService: PrendaService,
    private envioService: EnvioService,
    private agenciaService: AgenciaService,
  ) {}

  ngOnInit(): void {
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.clienteService.obtener(this.clienteId).subscribe({
      next: (res) => {
        this.cliente = res;
        this.cargando = false;
        this.cargarPaquetes();
        this.cargarEnvios();
      },
      error: () => {
        this.error = 'No se pudo cargar el cliente';
        this.cargando = false;
      },
    });
  }

  cargarPaquetes(): void {
    this.cargandoPaquetes = true;
    this.paqueteService.listarPorCliente(this.clienteId).subscribe({
      next: (res) => {
        this.paquetes = res;
        this.cargandoPaquetes = false;
      },
      error: () => {
        this.cargandoPaquetes = false;
      },
    });
  }

  cargarEnvios(): void {
    this.cargandoEnvios = true;
    const estado = this.filtroEstadoEnvio || undefined;
    this.envioService.listarPorCliente(this.clienteId, estado).subscribe({
      next: (res) => {
        this.envios = res;
        this.cargandoEnvios = false;
      },
      error: () => {
        this.envios = [];
        this.cargandoEnvios = false;
      },
    });
  }

  cambiarFiltroEnvio(estado: 'PENDIENTE' | 'ENVIADO' | 'CANCELADO' | ''): void {
    this.filtroEstadoEnvio = estado;
    this.cargarEnvios();
  }

  volver(): void {
    this.router.navigate(['/app/clientes']);
  }

  get ubicacion(): string {
    if (!this.cliente) return '—';
    const esTrujillo = this.cliente.ciudad?.toLowerCase() === 'trujillo';
    return esTrujillo ? (this.cliente.direccion || '—') : (this.cliente.agencia || '—');
  }

  abrirModalEditar(): void {
    if (!this.cliente) return;
    this.editData = {
      usuarioTikTok: this.cliente.usuarioTikTok,
      nombreReal: this.cliente.nombreReal,
      dni: this.cliente.dni,
      telefono: this.cliente.telefono,
      ciudad: this.cliente.ciudad,
      direccion: this.cliente.direccion ?? undefined,
    };
    this.errorEdit = '';
    this.mostrarModalEditar = true;

    this.agenciaService.autocomplete(this.cliente.agencia || '').subscribe({
      next: (res) => (this.agencias = res),
      error: () => {},
    });
  }

  get esTrujilloEdit(): boolean {
    return this.editData.ciudad?.toLowerCase() === 'trujillo';
  }

  buscarAgencias(query: string): void {
    if (!query) return;
    this.agenciaService.autocomplete(query).subscribe({
      next: (res) => (this.agencias = res),
    });
  }

  guardarEdicion(): void {
    this.guardandoEdit = true;
    this.errorEdit = '';
    this.clienteService.actualizar(this.clienteId, this.editData).subscribe({
      next: (res) => {
        this.cliente = res;
        this.mostrarModalEditar = false;
        this.guardandoEdit = false;
      },
      error: (err) => {
        this.errorEdit = err.error?.error || 'Error al actualizar';
        this.guardandoEdit = false;
      },
    });
  }

  abrirModalPrenda(prenda: PrendaResponse): void {
    if (!prenda.id) return;
    this.prendaIdSeleccionada = prenda.id;
    this.cargandoPrenda = true;
    this.mostrarModalPrenda = true;

    this.prendaService.obtener(prenda.id).subscribe({
      next: (res) => {
        this.prendaSeleccionada = res;
        this.editPrenda = {
          descripcion: res.descripcion,
          precioTotal: res.precioTotal,
          precioPagado: res.precioPagado,
          estado: res.estado,
        };
        this.cargandoPrenda = false;
      },
      error: () => {
        this.mostrarModalPrenda = false;
        this.cargandoPrenda = false;
      },
    });
  }

  guardarPrenda(): void {
    this.guardandoPrenda = true;
    this.prendaService.actualizar(this.prendaIdSeleccionada, this.editPrenda).subscribe({
      next: () => {
        this.mostrarModalPrenda = false;
        this.guardandoPrenda = false;
        this.cargarDatos();
      },
      error: (err) => {
        alert(err.error?.error || 'Error al actualizar prenda');
        this.guardandoPrenda = false;
      },
    });
  }

  eliminarPrenda(): void {
    if (!confirm('¿Eliminar esta prenda?')) return;
    this.prendaService.eliminar(this.prendaIdSeleccionada).subscribe({
      next: () => {
        this.mostrarModalPrenda = false;
        this.cargarDatos();
      },
      error: (err) => alert(err.error?.error || 'Error al eliminar'),
    });
  }

  abrirModalPaquete(paqueteId: number): void {
    this.cargandoPaqueteDetalle = true;
    this.mostrarModalPaquete = true;
    this.paqueteService.obtenerDetalle(paqueteId).subscribe({
      next: (res) => {
        this.paqueteDetalle = res;
        this.cargandoPaqueteDetalle = false;
      },
      error: () => {
        this.mostrarModalPaquete = false;
        this.cargandoPaqueteDetalle = false;
      },
    });
  }

  crearEnvio(): void {
    if (!confirm('¿Crear envío para este cliente?')) return;
    this.creandoEnvio = true;
    this.envioService.crear(this.clienteId).subscribe({
      next: () => {
        this.creandoEnvio = false;
        this.cargarEnvios();
        alert('Envío creado correctamente');
      },
      error: (err) => {
        alert(err.error?.error || 'No se pudo crear el envío');
        this.creandoEnvio = false;
      },
    });
  }
}

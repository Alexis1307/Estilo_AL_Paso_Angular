import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EnvioService } from '../../core/services/envio.service';
import { ClienteService } from '../../core/services/cliente.service';
import { EnvioListadoResponse } from '../../core/models/envio.model';
import { ClienteListaResponse } from '../../core/models/cliente.model';

interface DashboardCard {
  icono: string;
  nombre: string;
  cantidad: number | string;
  color: string;
}

interface ClienteResumen {
  usuarioTikTok: string;
  valor: number | string;
  estadoPago?: 'PENDIENTE' | 'PAGADO';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  cargando = true;
  cards: DashboardCard[] = [];

  paquetesActivos: ClienteResumen[] = [];
  pendientesPago: ClienteResumen[] = [];
  prendasMantenimiento: ClienteResumen[] = [];

  private envioData: EnvioListadoResponse | null = null;
  private clientesData: ClienteListaResponse[] = [];

  constructor(
    private envioService: EnvioService,
    private clienteService: ClienteService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    forkJoin({
      envios: this.envioService.listar(),
      clientes: this.clienteService.listar('', '', 0, 100),
    }).subscribe({
      next: ({ envios, clientes }) => {
        this.envioData = envios;
        this.clientesData = clientes.content;
        this.calcularDashboard();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  private calcularDashboard(): void {
    const todosEnvios = [
      ...(this.envioData?.delivery || []),
      ...(this.envioData?.encomienda || []),
    ];

    const pendientes = todosEnvios.filter((e) => e.estadoEnvio === 'PENDIENTE');

    const paquetesActivosCount = this.clientesData.filter((c) => c.estado !== 'SIN_PRENDAS').length;

    const montoTotal = todosEnvios.reduce((sum, e) => sum + (e.total || 0), 0);
    const montoPagado = todosEnvios.reduce((sum, e) => sum + (e.pagado || 0), 0);
    const montoPendiente = montoTotal - montoPagado;

    this.cards = [
      { icono: '📦', nombre: 'Paquetes Activos', cantidad: paquetesActivosCount, color: '#3b82f6' },
      { icono: '🚚', nombre: 'Envíos Pendientes', cantidad: pendientes.length, color: '#f59e0b' },
      {
        icono: '💰',
        nombre: 'Monto Total',
        cantidad: `S/ ${montoTotal.toFixed(2)}`,
        color: '#10b981',
      },
      {
        icono: '⏳',
        nombre: 'Monto Pendiente',
        cantidad: `S/ ${montoPendiente.toFixed(2)}`,
        color: '#ef4444',
      },
    ];

    const conPrendas = this.clientesData.filter((c) => c.estado !== 'SIN_PRENDAS');

    this.paquetesActivos = conPrendas.slice(0, 5).map((c) => ({
      usuarioTikTok: c.usuarioTikTok,
      valor: '',
      estadoPago: c.estado === 'PAGADO' ? 'PAGADO' : 'PENDIENTE',
    }));

    this.pendientesPago = this.clientesData
      .filter((c) => c.estado === 'PENDIENTE')
      .slice(0, 5)
      .map((c) => {
        const envio = pendientes.find((e) => e.usuarioTikTok === c.usuarioTikTok);
        const deuda = envio ? (envio.total - envio.pagado).toFixed(2) : '—';
        return { usuarioTikTok: c.usuarioTikTok, valor: `S/ ${deuda}` };
      });
  }

  verMasClientes(): void {
    this.router.navigate(['/app/clientes']);
  }
}

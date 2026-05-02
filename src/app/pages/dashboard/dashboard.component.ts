import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  DashboardService,
  DashboardResponse,
  PaqueteActivoDTO,
  ClienteDeudaDTO,
  ClienteMantenimientoDTO
} from '../../core/services/dashboard.service';

// Interfaz interna para las tarjetas superiores
interface DashboardCard {
  icono: string;
  nombre: string;
  cantidad: number | string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {

  // Estados de la vista
  cargando: boolean = true;

  // Datos para las tarjetas (Cards)
  cards: DashboardCard[] = [];

  // Listas de datos mapeadas de los DTOs
  paquetesActivos: PaqueteActivoDTO[] = [];
  pendientesPago: ClienteDeudaDTO[] = [];
  prendasMantenimiento: ClienteMantenimientoDTO[] = [];

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  /**
   * Obtiene los datos del servicio y los distribuye en las variables de la clase
   */
  private cargarDashboard(): void {
    this.cargando = true;

    this.dashboardService.obtenerDashboard().subscribe({
      next: (data: DashboardResponse) => {

        // 1. Mapeo de las tarjetas superiores (DashboardCardsDTO)
        // Usamos toLocaleString() para asegurar que los montos se vean profesionales
        this.cards = [
          {
            icono: '📦',
            nombre: 'Paquetes Activos',
            cantidad: data.cards.paquetesActivos,
            color: '#c5a059', // Dorado
          },
          {
            icono: '🚚',
            nombre: 'Envíos Pendientes',
            cantidad: data.cards.enviosPendientes,
            color: '#f59e0b', // Ámbar
          },
          {
            icono: '💰',
            nombre: 'Monto Pagado',
            cantidad: `S/ ${data.cards.montoPagado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
            color: '#10b981', // Verde
          },
          {
            icono: '⏳',
            nombre: 'Monto Pendiente',
            cantidad: `S/ ${data.cards.montoPendiente.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
            color: '#ef4444', // Rojo
          },
        ];

        // 2. Mapeo de las listas para las secciones inferiores
        this.paquetesActivos = data.paquetesActivos;
        this.pendientesPago = data.clientesDeuda;
        this.prendasMantenimiento = data.mantenimiento;

        this.cargando = false;
      },
      error: (error) => {
        console.error("Error al obtener datos del dashboard:", error);
        this.cargando = false;
        // Aquí podrías añadir una notificación de error si tuvieras un servicio de alerts
      },
    });
  }

  /**
   * Navegación a la vista de clientes
   */
  verMasClientes(): void {
    this.router.navigate(['/app/clientes']);
  }
}

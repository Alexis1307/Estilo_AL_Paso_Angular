import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../core/services/cliente.service';
import { ClienteListaResponse, EstadoCliente } from '../../core/models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
})
export class ClientesComponent implements OnInit {

  lista = signal<ClienteListaResponse[]>([]);
  cargando = signal(true);

  filtroBusqueda = signal('');
  filtroTelefono = signal('');

  paginaActual = signal(0);
  totalPaginas = signal(0);
  totalElementos = signal(0);

  readonly pageSize = 10;

  constructor(
    private clienteService: ClienteService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.cargando.set(true);

    this.clienteService
      .listar(
        this.filtroBusqueda(),
        this.filtroTelefono(),
        this.paginaActual(),
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.lista.set(res.content);
          this.totalPaginas.set(res.totalPages);
          this.totalElementos.set(res.totalElements);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  buscar(): void {
    this.paginaActual.set(0);
    this.cargarClientes();
  }

  limpiar(): void {
    this.filtroBusqueda.set('');
    this.filtroTelefono.set('');
    this.buscar();
  }

  anterior(): void {
    if (this.paginaActual() > 0) {
      this.paginaActual.update(v => v - 1);
      this.cargarClientes();
    }
  }

  siguiente(): void {
    if (this.paginaActual() < this.totalPaginas() - 1) {
      this.paginaActual.update(v => v + 1);
      this.cargarClientes();
    }
  }

  verDetalle(id: number): void {
    this.router.navigate(['/app/clientes', id]);
  }

  ubicacion(c: ClienteListaResponse): string {
    const esTrujillo = c.ciudad?.toLowerCase() === 'trujillo';
    return esTrujillo ? (c.direccion || '—') : (c.agencia?.nombre || '—');
  }

  badgeClass(estado: EstadoCliente): string {
    const map: Record<EstadoCliente, string> = {
      PAGADO: 'badge-success',
      PENDIENTE: 'badge-warning',
      SIN_PRENDAS: 'badge-neutral',
    };
    return map[estado];
  }
}

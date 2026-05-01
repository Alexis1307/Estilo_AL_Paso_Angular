import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnvioService } from '../../core/services/envio.service';
import { EnvioResponse } from '../../core/models/envio.model';

@Component({
  selector: 'app-envios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './envios.component.html',
  styleUrl: './envios.component.css',
})
export class EnviosComponent implements OnInit {
  delivery: EnvioResponse[] = [];
  encomienda: EnvioResponse[] = [];
  tabActiva: 'delivery' | 'encomienda' = 'delivery';
  cargando = true;

  claveGenerada = '';
  mostrarModalClave = false;
  generandoClave = false;

  origenExcel: number | null = null;
  exportando = false;

  readonly ORIGENES = [
    { id: 196, nombre: 'Agencia 196' },
    { id: 381, nombre: 'Agencia 381' },
  ];

  constructor(private envioService: EnvioService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.envioService.listar().subscribe({
      next: (res) => {
        this.delivery = res.delivery || [];
        this.encomienda = res.encomienda || [];
        this.cargando = false;
      },
      error: () => (this.cargando = false),
    });
  }

  get listaActiva(): EnvioResponse[] {
    return this.tabActiva === 'delivery' ? this.delivery : this.encomienda;
  }

  cancelar(envioId: number): void {
    if (!confirm('¿Cancelar este envío?')) return;
    this.envioService.cancelar(envioId).subscribe({
      next: () => this.cargar(),
      error: (err) => alert(err.error?.error || 'No se pudo cancelar'),
    });
  }

  enviar(envioId: number): void {
    if (!confirm('¿Confirmar el envío?')) return;
    this.envioService.enviar(envioId).subscribe({
      next: () => this.cargar(),
      error: (err) => alert(err.error?.error || 'No se pudo marcar como enviado'),
    });
  }

  generarClave(): void {
    this.generandoClave = true;
    this.envioService.generarClaveLote().subscribe({
      next: (res) => {
        this.claveGenerada = res.clave;
        this.mostrarModalClave = true;
        this.generandoClave = false;
        this.cargar();
      },
      error: (err) => {
        alert(err.error?.error || 'No se pudo generar clave');
        this.generandoClave = false;
      },
    });
  }

  exportarExcel(): void {
    if (!this.origenExcel) {
      alert('Selecciona una agencia de origen');
      return;
    }
    this.exportando = true;
    this.envioService.exportarExcel(this.origenExcel).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `envios_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.exportando = false;
      },
      error: () => {
        alert('Error al exportar el Excel');
        this.exportando = false;
      },
    });
  }

  ubicacionEnvio(e: EnvioResponse): string {
    const esTrujillo = e.ciudad?.toLowerCase() === 'trujillo';
    if (esTrujillo) return e.direccion || '—';
    return e.agencia?.nombre || '—';
  }

  puedeEnviar(e: EnvioResponse): boolean {
    if (this.tabActiva === 'encomienda') {
      return e.estadoCliente === 'PAGADO' && e.estadoEnvio === 'PENDIENTE';
    }
    return e.estadoEnvio === 'PENDIENTE';
  }
}

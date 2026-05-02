interface PaqueteActivoView {
  usuarioTiktok: string;
  cantidadPrendas: number;
  estadoPago: 'PAGADO' | 'PENDIENTE';
}

interface ClienteDeudaView {
  usuarioTiktok: string;
  montoDeuda: number;
}

interface MantenimientoView {
  usuarioTiktok: string;
  prendasEnMantenimiento: number;
}


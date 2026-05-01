export interface UsuarioRequest {
  username: string;
  password: string;
  rol: string;
}

export interface Usuario {
  id: number;
  nombreUser: string;
  fechaCreacion: string;
  rol: { id: number; nombreRol: string };
}

export interface LoginRequest {
  nombreUser: string;
  passwordUser: string;
}

export interface LoginResponse {
  nombreUser: string;
  rol: string;
  token: string;
}

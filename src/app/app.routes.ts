import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { LoginComponent } from './pages/login/login.component';
import { ShellComponent } from './layout/shell/shell.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RegistrarPrendaComponent } from './pages/registrar-prenda/registrar-prenda.component';
import { CrearClienteComponent } from './pages/crear-cliente/crear-cliente.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { DetalleClienteComponent } from './pages/detalle-cliente/detalle-cliente.component';
import { EnviosComponent } from './pages/envios/envios.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'app',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'registrar-prenda', component: RegistrarPrendaComponent },
      { path: 'crear-cliente', component: CrearClienteComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'clientes/:id', component: DetalleClienteComponent },
      { path: 'envios', component: EnviosComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

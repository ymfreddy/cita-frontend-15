import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { AuthGuard } from './shared/security/auth.guard';
import { ListaUsuariosComponent } from './pages/private/usuarios/lista-usuarios/lista-usuarios.component';
import { ListaEmpresasComponent } from './pages/private/empresas/lista-empresas/lista-empresas.component';
import { MenuPrincipalComponent } from './pages/private/menu/menu-principal/menu-principal.component';
import { NotfoundComponent } from './pages/public/notfound/notfound.component';
import { PreguntasComponent } from './pages/private/preguntas/preguntas.component';
import { CalendarioComponent } from './pages/private/calendario/calendario.component';
import { ListaClientesComponent } from './pages/private/clientes/lista-clientes/lista-clientes.component';
import { ListaCategoriasComponent } from './pages/private/categorias/lista-categorias/lista-categorias.component';
import { ListaServiciosComponent } from './pages/private/servicios/lista-servicio/lista-servicios.component';
import { ReservasComponent } from './pages/private/citas/reservas/reservas.component';
import { ListaCitasComponent } from './pages/private/citas/lista-citas/lista-citas.component';
import { ListaConsultasComponent } from './pages/private/consultas/lista-consultas/lista-consultas.component';
import { AtencionConsultaComponent } from './pages/private/consultas/atencion-consulta/atencion-consulta.component';
import { ListaPuntosComponent } from './pages/private/puntos/lista-puntos/lista-puntos.component';
import { ListaTurnosComponent } from './pages/private/turnos/lista-turnos/lista-turnos.component';
import { ListaCuentasComponent } from './pages/private/cuentas/lista-cuentas/lista-cuentas.component';
import { ListaSucursalesComponent } from './pages/private/sucursales/lista-sucursales/lista-sucursales.component';
import { ListaProductosComponent } from './pages/private/productos/lista-productos/lista-productos.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            // private adm
            {
                path: 'adm', component: AppLayoutComponent, canActivate: [AuthGuard],
                children: [
                    { path: '', loadChildren: () => import('./pages/private/dashboard/dashboard.module').then(m => m.DashboardModule) },
                    { path: 'usuarios', component: ListaUsuariosComponent },
                    { path: 'empresas', component: ListaEmpresasComponent },
                    { path: 'preguntas', component: PreguntasComponent },
                    { path: 'calendario', component: CalendarioComponent },
                    { path: 'menu-principal', component: MenuPrincipalComponent },
                    { path: 'clientes', component: ListaClientesComponent },
                    { path: 'categorias', component: ListaCategoriasComponent },
                    { path: 'servicios', component: ListaServiciosComponent },
                    { path: 'citas', component: ListaCitasComponent },
                    { path: 'reservas', component: ReservasComponent },
                    { path: 'consultas', component: ListaConsultasComponent },
                    { path: 'atencion', component: AtencionConsultaComponent },
                    { path: 'productos', component: ListaProductosComponent },
                    { path: 'sucursales', component: ListaSucursalesComponent },
                    { path: 'puntos', component: ListaPuntosComponent },
                    { path: 'turnos', component: ListaTurnosComponent },
                    { path: 'cuentas', component: ListaCuentasComponent },
                ]
            },
           // public
           { path: '', loadChildren: () => import('./pages/public/landing/landing.module').then(m => m.LandingModule)},
           { path: 'auth', loadChildren: () => import('./pages/public/auth/auth.module').then(m => m.AuthModule) },
           { path: 'pages/notfound', component: NotfoundComponent },
           { path: '**', redirectTo: 'pages/notfound' },

        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

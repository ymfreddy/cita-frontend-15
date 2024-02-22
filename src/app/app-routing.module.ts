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

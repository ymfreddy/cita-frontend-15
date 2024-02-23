import { NgModule, isDevMode } from '@angular/core';
import { DatePipe, DecimalPipe, HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';

import { ServiceWorkerModule } from '@angular/service-worker';
import { FormularioEmpresaComponent } from './pages/private/empresas/formulario-empresa/formulario-empresa.component';
import { ListaEmpresasComponent } from './pages/private/empresas/lista-empresas/lista-empresas.component';
import { FormularioUsuarioComponent } from './pages/private/usuarios/formulario-usuario/formulario-usuario.component';
import { ListaUsuariosComponent } from './pages/private/usuarios/lista-usuarios/lista-usuarios.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { PrimeNgModule } from './shared/prime-ng.module';
import { AuthInterceptor } from './shared/security/auth.interceptor';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FormatoDecimalPipe } from './shared/pipes/formato-decimal.pipe';
import { FormatoDecimalIcePipe } from './shared/pipes/formato-decimal-ice.pipe';
import { FormatoFechaHoraPipe } from './shared/pipes/formato-fecha-hora.pipe';
import { NotfoundComponent } from './pages/public/notfound/notfound.component';
import { BloqueoComponent } from './components/bloqueo/bloqueo.component';
import { CambioPasswordComponent } from './components/cambio-password/cambio-password.component';
import { MenuPrincipalComponent } from './pages/private/menu/menu-principal/menu-principal.component';
import { PreguntasComponent } from './pages/private/preguntas/preguntas.component';
import { ProductService } from './shared/services/product.service';
import { RecursosComponent } from './pages/private/recursos/recursos.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CalendarioComponent } from './pages/private/calendario/calendario.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ListaClientesComponent } from './pages/private/clientes/lista-clientes/lista-clientes.component';
import { FormularioClienteComponent } from './pages/private/clientes/formulario-cliente/formulario-cliente.component';
import { ListaCitasComponent } from './pages/private/citas/lista-citas/lista-citas.component';
import { FormularioCitaComponent } from './pages/private/citas/formulario-cita/formulario-cita.component';

@NgModule({
    declarations: [AppComponent, NotfoundComponent, ListaEmpresasComponent, BloqueoComponent, FormatoFechaHoraPipe,
        FormularioEmpresaComponent, ListaUsuariosComponent, FormularioUsuarioComponent, CambioPasswordComponent, MenuPrincipalComponent, PreguntasComponent, RecursosComponent, CalendarioComponent, ListaClientesComponent, FormularioClienteComponent, ListaCitasComponent, FormularioCitaComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AppLayoutModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        PrimeNgModule,
        InfiniteScrollModule,
        FullCalendarModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: !isDevMode(),
          // Register the ServiceWorker as soon as the application is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: 'registerWhenStable:30000'
        })
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        //{ provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        ConfirmationService,
        DatePipe,
        DialogService,
        DecimalPipe,
        FormatoDecimalPipe,
        FormatoDecimalIcePipe,
        FormatoFechaHoraPipe,
        ProductService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

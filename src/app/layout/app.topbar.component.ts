import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '../shared/security/auth.service';
import { SessionService } from '../shared/security/session.service';
import { LayoutService } from './service/app.layout.service';
import { DialogService } from 'primeng/dynamicdialog';
import { SessionUsuario } from '../shared/models/session-usuario.model';
import { MensajeService } from '../shared/helpers/information.service';
import { Subscription, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { adm } from 'src/app/shared/constants/adm';
import { CambioPasswordComponent } from '../components/cambio-password/cambio-password.component';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    providers: [DialogService],
})
export class AppTopBarComponent {
    usuario!: SessionUsuario;
    timerSubscription!: Subscription;

    listaNotificacionesCliente: any[]=[];
    //notificacionSeleccionada?: Notificacion;

    constructor(
        public layoutService: LayoutService,
        private confirmationService: ConfirmationService,
        private authService: AuthService,
        private sessionService: SessionService,
        public dialogService: DialogService,
        private MensajeService: MensajeService
    ) {}

    ngOnInit(): void {
        if (this.sessionService.getSessionUserData()) {
            this.usuario = this.sessionService.getSessionUserData();
        }

        if (this.usuario.cambiarClave) {
            this.cambiarPasword();
        }

        // this.pushService.listen();

        // this.notificacionesClienteService.getAll().subscribe((data)=>{
        //     if (data && data.length>0)
        //         this.MensajeService.showInfo("Tiene "+data.length+" notificación(es)");
        //     this.listaNotificacionesCliente = data;
        // });
    }

    obtenerNumeroNotificaciones(){
        return this.listaNotificacionesCliente.length.toString();
    }

    // verNotificaciones(){
    //     if(this.listaNotificacionesCliente.length==0){
    //         this.MensajeService.showInfo("No existe Notificaciones");
    //         return;
    //     }

    //     const ref = this.dialogService.open(VerNotificacionesComponent, {
    //         header: 'Notificaciones',
    //         width: '90%',
    //         data: this.listaNotificacionesCliente,
    //     });
    //     ref.onClose.subscribe((res) => { });
    // }

    cambiarPasword(): void {
        const ref = this.dialogService.open(CambioPasswordComponent, {
            header: 'Cambiar Password',
            width: '350px',
            data: {},
            closable: true,
        });
    }

    confirmarCierreSession(): void {
        this.confirmationService.confirm({
            message: 'Esta seguro de salir de la aplicación ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.authService.logout();
            },
        });
    }

    onRowSelect(event: any) {
        this.MensajeService.showInfo(event.data.nombre);
    }

    verOpcionTurno():Boolean{
        return this.usuario.codigoTipoUsuario!=adm.TIPO_USUARIO_EXTERNO;
    }

    ngOnDestroy(): void {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }

        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }
}


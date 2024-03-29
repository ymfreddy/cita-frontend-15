import { Component, OnDestroy, OnInit } from '@angular/core';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { FormularioUsuarioComponent } from '../formulario-usuario/formulario-usuario.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { BusquedaUsuario } from '../../../../shared/models/busquedas.model';
import { Router } from '@angular/router';
import { AsignarAsistenciaComponent } from 'src/app/components/asignar-asistencia/asignar-asistencia.component';
import { adm } from 'src/app/shared/constants/adm';

@Component({
    selector: 'app-lista-usuarios',
    templateUrl: './lista-usuarios.component.html',
    styleUrls: ['./lista-usuarios.component.scss'],
    providers: [DialogService],
})
export class ListaUsuariosComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    itemSelected!: Usuario;
    items!: Usuario[];
    itemDialog!: boolean;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;
    blockedPanel: boolean = false;
    constructor(
        private usuariosService: UsuariosService,
        private sessionService: SessionService,
        private mensajeService: MensajeService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private empresasService: EmpresasService,
        private router: Router
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.isSuperAdmin() || !this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        this.empresasService
        .get()
        .subscribe({
            next: (res) => {
                this.listaEmpresas = res.content;
                this.idEmpresa=this.sessionService.getSessionEmpresaId();
                this.loadData();
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    cambioEmpresa(event: any) {
        if (!event.value) {
            this.items = [];
            return;
        }
        this.loadData();
    }

    loadData(): void {
        const busqueda: BusquedaUsuario ={
            idEmpresa: this.idEmpresa,
        };
        this.usuariosService.get(busqueda).subscribe({
            next: (res) => {
                this.items = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    newItem() {
        const ref = this.dialogService.open(FormularioUsuarioComponent, {
            header: 'Nuevo',
            width: '80%',
            data: {},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    editItem(item: Usuario) {
        this.itemSelected = item;
        const ref = this.dialogService.open(FormularioUsuarioComponent, {
            header: 'Actualizar',
            width: '80%',
            data: item,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.items.findIndex((obj => obj.id == res.id));
                this.items[objIndex]=res;
            }
        });
    }

    resetPasswordItem(item: Usuario) {
    }

    gestionarAsistencia(item: Usuario) {
        /*if (item.codigoTipoUsuario !==adm.TIPO_USUARIO_ASISTENTE){
            this.mensajeService.showWarning('Tipo de usuario incorrecto');
            return;
        }*/


        const ref = this.dialogService.open(AsignarAsistenciaComponent, {
            header: 'Asistencia',
            width: '50%',
            data: { idEmpresa: this.idEmpresa, item: item },
        });
        ref.onClose.subscribe((res) => {});
    }

    deleteItem(item: Usuario) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar el usuario ' + item.username + ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.usuariosService.delete(item).subscribe({
                    next: (res) => {
                        this.items = this.items.filter((x) => x.id !== item.id);
                        this.mensajeService.showSuccess(res.message);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                    },
                });
            },
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }
}

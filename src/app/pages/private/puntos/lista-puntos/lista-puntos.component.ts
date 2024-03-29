import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { PuntosService } from 'src/app/shared/services/puntos.service';
import { FormularioPuntoComponent } from '../formulario-punto/formulario-punto.component';
import { PuntoVenta } from 'src/app/shared/models/punto.model';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { Router } from '@angular/router';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';

@Component({
    selector: 'app-lista-puntos',
    templateUrl: './lista-puntos.component.html',
    styleUrls: ['./lista-puntos.component.scss'],
    providers: [DialogService],
})
export class ListaPuntosComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    items!: PuntoVenta[];
    itemDialog!: boolean;
    blockedPanel: boolean = false;
    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;
    constructor(
        private puntosService: PuntosService,
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
                this.idEmpresa=this.sessionService.getSessionUserData().idEmpresa;
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
        this.puntosService.getByIdEmpresa(this.idEmpresa).subscribe({
            next: (res) => {
                this.items = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }


    newItem() {
        const ref = this.dialogService.open(FormularioPuntoComponent, {
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

    editItem(item: PuntoVenta) {
        const ref = this.dialogService.open(FormularioPuntoComponent, {
            header: 'Actualizar',
            width: '80%',
            data: item,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    deleteItem(item: PuntoVenta) {
        this.confirmationService.confirm({
            message:
                'Esta seguro de eliminar el punto de venta ' +
                item.nombre +
                ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.puntosService.delete(item).subscribe({
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { Table } from 'primeng/table';
import { ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Servicio } from 'src/app/shared/models/servicio.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { BusquedaServicio } from 'src/app/shared/models/busquedas.model';
import { ServiciosService } from 'src/app/shared/services/servicios.service';
import { FormularioServicioComponent } from '../formulario-servicio/formulario-servicio.component';
import { cl } from '@fullcalendar/core/internal-common';

@Component({
    selector: 'app-lista-servicios',
    templateUrl: './lista-servicios.component.html',
    styleUrls: ['./lista-servicios.component.scss'],
    providers: [DialogService],
})
export class ListaServiciosComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    items!: Servicio[];
    itemDialog!: boolean;
    loading!: boolean;
    listaEmpresas: Empresa[] = [];
    idEmpresa!: number;
    nitEmpresa!: number;
    blockedPanel: boolean = false;
    constructor(
        private serviciosService: ServiciosService,
        private sessionService: SessionService,
        private mensajeService: MensajeService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private empresasService: EmpresasService
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.sessionService.getSessionEmpresaId();
        this.nitEmpresa = this.sessionService.getSessionEmpresaSfeNit();
        if (this.esSuperAdm()) {
            this.empresasService.get().subscribe({
                next: (res) => {
                    this.listaEmpresas = res.content;
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                },
            });
        }
        this.loadData();
    }

    cambioEmpresa(event: any) {
        if (!event.value) {
            this.items = [];
            return;
        }
        const empresaAux = this.listaEmpresas.find(
            (x) => x.id === event.value
        )!;
        this.idEmpresa = empresaAux.id;
        this.nitEmpresa = empresaAux.sfeNit;

        this.loadData();
    }

    loadData(): void {
        const busqueda: BusquedaServicio = {
            idEmpresa: this.idEmpresa,
        };

        this.loading = true;
        this.serviciosService.get(busqueda).subscribe({
            next: (res) => {
                this.items = res.content;
                 this.loading = false;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
                this.loading = false;
            },
        });
    }

    newItem() {
        const ref = this.dialogService.open(FormularioServicioComponent, {
            header: 'Nuevo',
            width: '80%',
            data: { idEmpresa: this.idEmpresa, nitEmpresa: this.nitEmpresa },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    editItem(item: Servicio) {
        const ref = this.dialogService.open(FormularioServicioComponent, {
            header: 'Actualizar',
            width: '80%',
            data: {
                idEmpresa: this.idEmpresa,
                nitEmpresa: this.nitEmpresa,
                item: item,
            },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.items.findIndex((obj) => obj.id == res.id);
                this.items[objIndex] = res;
            }
        });
    }

    deleteItem(item: Servicio) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar a ' + item.nombre + ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.serviciosService.delete(item).subscribe({
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

    esSuperAdm() {
        return this.sessionService.isSuperAdmin();
    }
}

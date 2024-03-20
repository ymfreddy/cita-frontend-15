import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Producto, SolicitudProductoMasivo } from 'src/app/shared/models/producto.model';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { FormularioProductoComponent } from '../formulario-producto/formulario-producto.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { BusquedaPaginadaProducto } from 'src/app/shared/models/busquedas.model';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';

@Component({
    selector: 'app-lista-productos',
    templateUrl: './lista-productos.component.html',
    styleUrls: ['./lista-productos.component.scss'],
    providers: [DialogService],
})
export class ListaProductosComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    items!: Producto[];
    itemDialog!: boolean;

    totalRecords: number = 0;
    loading!: boolean;

    listaEmpresas: Empresa[] = [];
    idEmpresa!:number;
    nitEmpresa!:number;

    busqueda: BusquedaPaginadaProducto ;

    acceptedFiles: string = ".xls, .xlsx";
    blockedPanel: boolean = false;
    constructor(
        private productosService: ProductosService,
        private sessionService: SessionService,
        private mensajeService: MensajeService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private fileService: FilesService,
        private empresasService: EmpresasService,
    ) {
        this.busqueda = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            pagina:1,
            cantidadItems:10,
            tipoOrden: 1,
            campoOrden: '',
            filtro:'',
            idsCategorias: this.sessionService.getSessionUserData().categorias
        };

    }

    ngOnInit(): void {
        this.idEmpresa = this.busqueda.idEmpresa!;
        this.nitEmpresa = this.sessionService.getSessionEmpresaSfeNit();

        if (this.esSuperAdm()){
            this.empresasService
            .get()
            .subscribe({
                next: (res) => {
                    this.listaEmpresas = res.content;
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                },
            });
        }
    }

    cambioEmpresa(event: any) {
        if (!event.value) {
            this.items = [];
            return;
        }
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.idEmpresa = empresaAux.id;
        this.nitEmpresa = empresaAux.sfeNit;
        this.busqueda = {
            ... this.busqueda,
            idEmpresa: this.idEmpresa,
            pagina: 1,
            campoOrden: '',
            tipoOrden: 1,
            filtro: event.globalFilter!,
            idsCategorias: ''
        }
        this.loadData();
    }

    loadPaged(event: LazyLoadEvent) {
        this.busqueda = {
            ... this.busqueda,
            pagina:event.first!/event.rows! + 1,
            cantidadItems:event.rows ?? 10,
            campoOrden: event.sortField,
            tipoOrden: event.sortOrder!,
            filtro: event.globalFilter!,
        }

        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.productosService.getPaged(this.busqueda).subscribe({
            next: (res) => {
                this.items = res.content.items;
                this.totalRecords = res.content.totalItems;
                this.loading = false;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
                this.loading = false;
            },
        });
    }

    newItem() {
        const ref = this.dialogService.open(FormularioProductoComponent, {
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

    editItem(item: Producto) {
        const ref = this.dialogService.open(FormularioProductoComponent, {
            header: 'Actualizar',
            width: '80%',
            data: { idEmpresa: this.idEmpresa, nitEmpresa: this.nitEmpresa, item: item },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                let objIndex = this.items.findIndex((obj => obj.id == res.id));
                this.items[objIndex]=res;
            }
        });
    }

    deleteItem(item: Producto) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar a '+item.nombre+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.productosService.delete(item).subscribe({
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

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
    }

    cargarXls(event: any, fileUpload: any){
    }

    onGlobalFilterClick(table: Table, text: string) {
        if (text.trim()===''){
            this.mensajeService.showInfo('Debe introducir un filtro');
            return;
        }
        table.filterGlobal(text, 'contains');
    }

    onGlobalFilterClear(table: Table) {
        table.filterGlobal('', 'contains');
    }

    exportExcel() {
    }
}

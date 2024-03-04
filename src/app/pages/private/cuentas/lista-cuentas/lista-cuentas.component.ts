import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Cuenta } from 'src/app/shared/models/cuenta.model';
import { CuentasService } from 'src/app/shared/services/cuentas.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { delay, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { adm } from 'src/app/shared/constants/adm';
import { HelperService } from '../../../../shared/helpers/helper.service';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { BusquedaCuenta, BusquedaUsuario } from 'src/app/shared/models/busquedas.model';
import { FormularioCuentaComponent } from '../formulario-cuenta/formulario-cuenta.component';


@Component({
    selector: 'app-lista-cuentas',
    templateUrl: './lista-cuentas.component.html',
    styleUrls: ['./lista-cuentas.component.scss'],
    providers: [DialogService],
})
export class ListaCuentasComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;
    busquedaMemoria?: BusquedaCuenta;

    items!: Cuenta[];
    listaEstadosCuenta: any[] = [];
    listaTiposCuenta: any[] = [];
    listaSucursales: Sucursal[] = [];
    listaUsuarios: Usuario[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    cuentaSeleccionada!: Cuenta;
    itemsMenuFactura!: MenuItem[];
    itemsMenuCuenta!: MenuItem[];

    opciones!: MenuItem[];

    listaEmpresas: Empresa[] = [];
    nitEmpresa!:number;
    idEmpresa!:number;

    constructor(
        private fb: FormBuilder,
        private cuentasService: CuentasService,
        private sessionService: SessionService,
        private mensajeService: MensajeService,
        public dialogService: DialogService,
        private parametricasService: ParametricasService,
        private sucursalesService: SucursalesService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private datepipe: DatePipe,
        private helperService: HelperService,
        private fileService:FilesService,
        private usuarioService: UsuariosService,
        private empresasService: EmpresasService,
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        if (this.sessionService.getBusquedaCuenta() != null) {
            this.busquedaMemoria = this.sessionService.getBusquedaCuenta();
        }

        this.idEmpresa = this.busquedaMemoria?.idEmpresa ?? this.sessionService.getSessionEmpresaId();
        this.nitEmpresa = this.busquedaMemoria?.nitEmpresa ?? this.sessionService.getSessionEmpresaSfeNit();

        this.cargarOpcionesCuentas();
        // cargar parametricas
        this.cargarEmpresas();
        this.cargarSucursales();
        this.cargarUsuarios();
        this.cargarParametricas();


        // fn cargar usuarios
        let fechaInicio = this.helperService.getDate(this.busquedaMemoria?.fechaInicio);
        let fechaFin = this.helperService.getDate(this.busquedaMemoria?.fechaFin);

        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa,
            nitEmpresa: this.nitEmpresa,
            idSucursal: [{ value: this.busquedaMemoria?.idSucursal??this.sessionService.getSessionUserData().idSucursal, disabled: false}],
            codigosEstadosCuenta: [this.busquedaMemoria?.codigosEstadosCuenta ? this.busquedaMemoria?.codigosEstadosCuenta.split(",") : null],
            codigosTiposCuenta: [this.busquedaMemoria?.codigosTiposCuenta ? this.busquedaMemoria?.codigosTiposCuenta.split(",") : null],
            usuario: [this.busquedaMemoria?.usuario],
            fechaInicio: [fechaInicio, Validators.required],
            fechaFin: [fechaFin, Validators.required],
        });

        const esAdministrador = this.sessionService.getSessionUserData().codigoTipoUsuario == adm.TIPO_USUARIO_ADMIN || this.sessionService.getSessionUserData().codigoTipoUsuario == adm.TIPO_USUARIO_SUPERADMIN;
        if (!esAdministrador) {this.criteriosBusquedaForm.controls['usuario'].disable();
            this.criteriosBusquedaForm.patchValue({ usuario: this.sessionService.getSessionUserData().username });
        }

        if (this.busquedaMemoria) {
            this.loadData(0);
        }
    }

    cargarOpcionesCuentas(){
        this.opciones = [
            {
                label: 'Reporte',
                icon: 'pi pi-file-pdf',
                command: () => {
                    this.reporteCuentas();
                },
            }
        ];

        const itemsCuenta : any[]=[];

        itemsCuenta.push({
            label: 'Descargar Recibo',
            icon: 'pi pi-cloud-download',
            command: () => {
                this.opcionCuentaDescargar(false);
            },
        });
        itemsCuenta.push({
            label: 'Imprimir Recibo',
            icon: 'pi pi-print',
            command: () => {
                this.opcionCuentaDescargar(true);
            },
        });
        itemsCuenta.push({
            label: 'Devolución Cuenta',
            icon: 'pi pi-directions-alt',
            command: () => {
                this.opcionCuentaDevolucion();
            },
        });
        itemsCuenta.push({
            label: 'Detalle Cuenta',
            icon: 'pi pi-list',
            command: () => {
                this.opcionCuentaDetalle();
            },
        });

        this.itemsMenuCuenta = [
            {
                label: 'Opciones Cuenta',
                items: itemsCuenta,
            },
        ];
    }

    cargarEmpresas(){
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

    cargarSucursales(){
        this.sucursalesService
        .getByIdEmpresa(this.idEmpresa)
        .subscribe({
            next: (res) => {
                this.listaSucursales = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    cargarUsuarios(){
        const busqueda: BusquedaUsuario = {
            idEmpresa: this.idEmpresa,
            resumen: true,
        };
        this.usuarioService.get(busqueda).subscribe({
            next: (res) => {
                this.listaUsuarios = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    cargarParametricas(){
        this.parametricasService
        .getParametricasByTipo(TipoParametrica.ESTADO_CUENTA)
        .subscribe((data) => {
            const parametricas = data.map((x: any) => {return { id: x.id.toString(), nombre: x.nombre }});
            this.listaEstadosCuenta = parametricas;
        });

        this.parametricasService
        .getParametricasByTipo(TipoParametrica.TIPO_CUENTA)
        .subscribe((data) => {
            const parametricas = data.map((x: any) => {return { id: x.id.toString(), nombre: x.nombre }});
            this.listaTiposCuenta = parametricas;
        });
    }

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
    }

    loadData(reporte:number): void {
        if (!this.criteriosBusquedaForm.valid) {
            this.mensajeService.showWarning('Verifique los datos');
            return;
        }

        // validar rango fecha
        if (
            this.criteriosBusquedaForm.controls['fechaFin'].value.getTime() -
                this.criteriosBusquedaForm.controls[
                    'fechaInicio'
                ].value.getTime() <
            0
        ) {
            this.mensajeService.showWarning(
                'La fecha inicio no debe ser menor a la fecha fin'
            );
            return;
        }

        const dias = Math.round(
            Math.abs(
                (this.criteriosBusquedaForm.controls[
                    'fechaInicio'
                ].value.getTime() -
                    this.criteriosBusquedaForm.controls[
                        'fechaFin'
                    ].value.getTime()) /
                    adm.UN_DIA
            )
        );
        if (dias > 31) {
            this.mensajeService.showWarning(
                'El rango de fechas debe ser menor o igual a 31 días'
            );
            return;
        }

        this.blockedPanel = true;
        const criterios = this.getBusquedaCriterios();

        if (reporte>0) {
            /*if (reporte==1){
                const fileName = `cuentas-${this.nitEmpresa}.pdf`;
                this.utilidadesService.getReporteCuentas(criterios).pipe(delay(1000)).subscribe((blob: Blob): void => {
                        this.fileService.printFile(blob, fileName, false);
                        this.blockedPanel = false;
                    });
            }*/
        }
        else {
            this.cuentasService.get(criterios)
            .subscribe({
                next: (res) => {
                    this.sessionService.setBusquedaCuenta(criterios);
                    this.items = res.content;
                    console.log(this.items);
                    this.blockedPanel = false;
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                    this.blockedPanel = false;
                },
            });
        }
    }

    reporteCuentas() {
        this.loadData(1);
    }

    getBusquedaCriterios() {
        const fechaInicio = this.criteriosBusquedaForm.controls['fechaInicio']
            .value as Date;
        const fechaFin = this.criteriosBusquedaForm.controls['fechaFin']
            .value as Date;

        const estados = this.criteriosBusquedaForm.controls['codigosEstadosCuenta'].value;
        const tipos = this.criteriosBusquedaForm.controls['codigosTiposCuenta'].value;

        const criterios: BusquedaCuenta = {
            idEmpresa: this.criteriosBusquedaForm.controls['idEmpresa'].value,
            idSucursal: this.criteriosBusquedaForm.controls['idSucursal'].value,
            fechaInicio: this.datepipe.transform(fechaInicio, 'dd/MM/yyyy') ?? '',
            fechaFin: this.datepipe.transform(fechaFin, 'dd/MM/yyyy') ?? '',
            codigosTiposCuenta:(!tipos || tipos.length==0) ?'':tipos.join(','),
            codigosEstadosCuenta: (!estados || estados.length==0) ?'':estados.join(','),
            usuario: this.criteriosBusquedaForm.controls['usuario'].value,
        };
        return criterios;
    }

    newItem() {
        const ref = this.dialogService.open(FormularioCuentaComponent, {
            header: 'Nuevo',
            width: '90%',
            draggable: true,
            resizable: false,
            maximizable: true,
            data: { cuenta: null},
        });

        ref.onClose.subscribe((res) => {
            if (res) {
                this.items.unshift(res);
                this.items=this.items.slice();
            }
        });
    }

    editItem(item: Cuenta) {
        this.cuentasService.getDetail(item.id).subscribe({
            next: (res) => {
                item.detalle = res.content;
                const ref = this.dialogService.open(FormularioCuentaComponent, {
                    header: 'Actualizar',
                    width: '90%',
                    draggable: true,
                    resizable: false,
                    maximizable: true,
                    data: { cuenta: item},
                });

                ref.onClose.subscribe((res) => {
                    if (res) {
                        console.log(res);
                        let objIndex = this.items.findIndex((obj => obj.id == res!.id));
                        this.items[objIndex]=res;
                    }
                });
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }


    esEditable(codigoEstado: String) {
        return codigoEstado === adm.ESTADO_CUENTA_ACTIVO || codigoEstado===adm.ESTADO_CUENTA_REVERTIDA;
    }

    opcionCuentaDescargar(imprimir:boolean) {
        if (this.esEditable(this.cuentaSeleccionada?.codigoEstadoCuenta)) {
            this.mensajeService.showWarning('Cuenta no finalizada');
            return;
        }

        this.blockedPanel = true;
        const fileName = `recibo-${this.cuentaSeleccionada?.correlativo}.pdf`;
        /*this.utilidadesService
            .getReciboCuenta(this.cuentaSeleccionada?.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, imprimir);
                this.blockedPanel = false;
            });*/
    }

    deleteItem(item: Cuenta) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar la cuenta ' + item.correlativo + ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.cuentasService.delete(item).subscribe({
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

    opcionCuentaDevolucion() {
        if (this.cuentaSeleccionada?.codigoEstadoCuenta!=adm.ESTADO_CUENTA_COBRADA){
            this.mensajeService.showWarning('Solo puede realizar la devolución de cuentas COBRADAS');
            return;
        }

        /*if (this.cuentaSeleccionada?.factura  && this.cuentaSeleccionada?.factura.codigoEstado!=sfe.ESTADO_FACTURA_ANULADO){
            this.mensajeService.showWarning('Para realizar la devolución debe anular la factura');
            return;
        }*/


        this.confirmationService.confirm({
            message: 'Esta seguro de realizar la devolución de la cuenta '+this.cuentaSeleccionada?.correlativo+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.cuentasService.devolucion(this.cuentaSeleccionada).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.loadData(0);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                    },
                });
            },
        });
    }

    opcionCuentaDetalle() {
                /*const ref = this.dialogService.open(CuentaDetalleComponent, {
                    header: 'Detalle Cuenta '+ this.cuentaSeleccionada.correlativo,
                    width: '80%',
                    data: { item: this.cuentaSeleccionada},
                });
                ref.onClose.subscribe((res) => {
                });*/
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    public onSubmit(): void {
        this.loadData(0);
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    opcionesCuenta(menu: any, event: any, item: Cuenta) {
        this.cuentaSeleccionada = item;
        menu.toggle(event);
    }





    opcionCuentaImprimirCuenta() {
        if (this.cuentaSeleccionada?.codigoEstadoCuenta!=adm.ESTADO_CUENTA_ACTIVO){
            this.mensajeService.showWarning('Solo puede imprimir cuentas con estado activos');
            return;
        }

        /*this.utilidadesService.getImpresionCuenta(this.cuentaSeleccionada.id).subscribe({
            next: (res) => {
                this.mensajeService.showSuccess(res.message);
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });*/
    }

    cambioEmpresa(event: any) {
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.nitEmpresa = empresaAux.sfeNit;
        this.idEmpresa = empresaAux.id;
        this.listaSucursales = [];
        this.criteriosBusquedaForm.controls['nitEmpresa'].setValue(empresaAux.sfeNit);
        this.criteriosBusquedaForm.controls['idEmpresa'].setValue(empresaAux.id);
        this.criteriosBusquedaForm.controls['idSucursal'].setValue(null);
        this.criteriosBusquedaForm.controls['usuario'].setValue(null);
        this.cargarSucursales();
        this.cargarUsuarios();
    }
}

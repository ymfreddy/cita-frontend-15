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
import { BusquedaCuenta, BusquedaPago, BusquedaUsuario } from 'src/app/shared/models/busquedas.model';
import { FormularioCuentaComponent } from '../formulario-cuenta/formulario-cuenta.component';
import { CuentaDetalleComponent } from 'src/app/components/cuenta-detalle/cuenta-detalle.component';
import { FormularioPagoComponent } from '../formulario-pago/formulario-pago.component';
import { PagosService } from 'src/app/shared/services/pagos.service';
import { Pago } from 'src/app/shared/models/pago.model';
import { PagosDetalleComponent } from 'src/app/components/pagos-detalle/pagos-detalle.component';
import { GenerarFacturaComponent } from 'src/app/components/generar-factura/generar-factura.component';
import { AnularFacturaComponent } from 'src/app/components/anular-factura/anular-factura.component';
import { WhatsappFacturaComponent } from 'src/app/components/whatsapp-factura/whatsapp-factura.component';
import { SfeService } from '../../../../shared/services/sfe.service';
import { FormularioPagoCuentaComponent } from '../formulario-pago-cuenta/formulario-pago-cuenta.component';


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
        private usuarioService: UsuariosService,
        private empresasService: EmpresasService,
        private pagosService:PagosService,
        private fileService:FilesService,
        private sfeService :SfeService
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
            this.loadData();
        }
    }

    cargarOpcionesCuentas(){
        this.opciones = [
            {
                label: 'Reporte',
                icon: 'pi pi-file-pdf',
                command: () => {
                    //this.reporteCuentas();
                },
            }
        ];

        const itemsCuenta : any[]=[];
        itemsCuenta.push({
            label: 'Pagar Saldo',
            icon: 'pi pi-directions-alt',
            command: () => {
                this.opcionPagarSaldo();
            },
        });
        itemsCuenta.push({
            label: 'Ver Pagos Realizados',
            icon: 'pi pi-directions-alt',
            command: () => {
                this.opcionVerPagosRealizados();
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

        // facturacion
        this.itemsMenuFactura = [
            {
                label: 'Opciones Factura',
                items: [
                    /*{
                        label: 'Ver En Impuestos',
                        icon: 'pi pi-link',
                        command: () => {
                            this.opcionFacturaUrl();
                        },
                    },*/
                    {
                        label: 'Descargar',
                        icon: 'pi pi-cloud-download',
                        command: () => {
                            this.opcionFacturaDescargar(false);
                        },
                    },
                    {
                        label: 'Imprimir',
                        icon: 'pi pi-print',
                        command: () => {
                            this.opcionFacturaDescargar(true);
                        },
                    },
                    {
                        label: 'Emitir',
                        icon: 'pi pi-cloud-upload',
                        command: () => {
                            this.opcionFacturaEmitir();
                        },
                    },
                    {
                        label: 'Anular',
                        icon: 'pi pi-times',
                        command: () => {
                            this.opcionFacturaAnular();
                        },
                    },
                    {
                        label: 'Enviar WhatsApp',
                        icon: 'pi pi-whatsapp',
                        command: () => {
                            this.opcionFacturaWhatsapp();
                        },
                    },
                ],
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

    loadData(): void {
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
        const ref = this.dialogService.open(FormularioPagoCuentaComponent, {
            header: 'Venta',
            width: '95%',
            draggable: true,
            maximizable: true,
            data: { idEmpresa: this.idEmpresa },
        });
        ref.onClose.subscribe((res) => {
            this.loadData();
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
                        //let objIndex = this.items.findIndex((obj => obj.id == res!.id));
                        //this.items[objIndex]=res;
                        this.loadData();
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

        this.confirmationService.confirm({
            message: 'Esta seguro de realizar la devolución de la cuenta '+this.cuentaSeleccionada?.correlativo+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.cuentasService.devolucion(this.cuentaSeleccionada).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.loadData();
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                    },
                });
            },
        });
    }

    opcionCuentaDetalle() {
                const ref = this.dialogService.open(CuentaDetalleComponent, {
                    header: 'Detalle Cuenta N° '+ this.cuentaSeleccionada.correlativo,
                    width: '80%',
                    data: { item: this.cuentaSeleccionada},
                });
                ref.onClose.subscribe((res) => {
                });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    public onSubmit(): void {
        this.loadData();
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

    opcionPagarSaldo() {
        if (this.cuentaSeleccionada?.codigoEstadoCuenta!=adm.ESTADO_CUENTA_CREDITO_POR_PAGAR){
            this.mensajeService.showWarning('Solo puede realizar el pago de cuentas por pagar');
            return;
        }

        const cuentas:Cuenta[]=[this.cuentaSeleccionada];
        const ref = this.dialogService.open(FormularioPagoComponent, {
            header: 'Cobrar',
            width: '80%',
            data: cuentas,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    opcionVerPagosRealizados() {
        if (this.cuentaSeleccionada?.codigoEstadoCuenta!=adm.ESTADO_CUENTA_CREDITO_POR_PAGAR
            && this.cuentaSeleccionada?.codigoEstadoCuenta!=adm.ESTADO_CUENTA_CREDITO_PAGADO
            ){
            this.mensajeService.showWarning('Solo ver pagos de cuentas a credito');
            return;
        }

        const ref = this.dialogService.open(PagosDetalleComponent, {
            header: 'Pagos Realizados',
            width: '80%',
            data: this.cuentaSeleccionada,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    opcionFacturaEmitir() {
        if (
            this.cuentaSeleccionada?.codigoEstadoFactura &&
            this.cuentaSeleccionada?.codigoEstadoFactura != adm.ESTADO_FACTURA_ANULADO &&
            this.cuentaSeleccionada?.codigoEstadoFactura != adm.ESTADO_FACTURA_OBSERVADO &&
            this.cuentaSeleccionada?.codigoEstadoFactura != adm.ESTADO_FACTURA_RECHAZADA
        ) {
            this.mensajeService.showWarning('Ya existe una factura');
            return;
        }

        if (
            this.cuentaSeleccionada?.codigoEstadoCuenta == adm.ESTADO_CUENTA_ACTIVO ||
            this.cuentaSeleccionada?.codigoEstadoCuenta == adm.ESTADO_CUENTA_REVERTIDA
        ) {
            this.mensajeService.showWarning('La cuenta no esta finalizada');
            return;
        }

        console.log(this.cuentaSeleccionada);
        const ref = this.dialogService.open(GenerarFacturaComponent, {
            header: 'Emitir Factura',
            width: '400px',
            data: {cuenta : this.cuentaSeleccionada},
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    opcionFacturaAnular() {
        if (!this.cuentaSeleccionada?.cufFactura || this.cuentaSeleccionada?.codigoEstadoFactura == adm.ESTADO_FACTURA_RECHAZADA) {
            this.mensajeService.showWarning('No existe factura');
            return;
        }
        if (this.cuentaSeleccionada?.codigoEstadoFactura == adm.ESTADO_FACTURA_ANULADO) {
            this.mensajeService.showWarning('La factura ya está anulada');
            return;
        }
        const ref = this.dialogService.open(AnularFacturaComponent, {
            header: 'Anular Factura',
            width: '400px',
            data: this.cuentaSeleccionada,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
            }
        });
    }

    opcionFacturaWhatsapp() {
        if (!this.cuentaSeleccionada?.codigoEstadoFactura || this.cuentaSeleccionada?.codigoEstadoFactura == adm.ESTADO_FACTURA_RECHAZADA) {
            this.mensajeService.showWarning('No existe factura');
            return;
        }
        if (this.cuentaSeleccionada?.codigoEstadoFactura == adm.ESTADO_FACTURA_RECHAZADA) {
            this.mensajeService.showWarning('La factura está rechazada');
            return;
        }
        if (this.cuentaSeleccionada?.codigoEstadoFactura == adm.ESTADO_FACTURA_ANULADO) {
            this.mensajeService.showWarning('La factura está anulada');
            return;
        }
        const factura: any = {
            ... this.cuentaSeleccionada!,
            codigoCliente: this.cuentaSeleccionada.codigoCliente,
            nombreRazonSocial: this.cuentaSeleccionada.cliente
        }
        console.log(factura);
        /*const ref = this.dialogService.open(EnviarWhatsappComponent, {
            header: 'Enviar Factura por WhatsApp',
            width: '300px',
            data: factura,
        });
        ref.onClose.subscribe((res) => {});*/

        const ref = this.dialogService.open(WhatsappFacturaComponent, {
            header: 'Enviar Factura por WhatsApp',
            width: '500px',
            data: factura,
        });
        ref.onClose.subscribe((res) => {});
    }

    opcionFacturaUrl() {
        if (!this.cuentaSeleccionada?.codigoEstadoFactura) {
            this.mensajeService.showWarning('No existe factura');
            return;
        }

        //window.open(this.facturaSeleccionada.url, '_blank');
    }

    opcionFacturaDescargar(imprimir:boolean) {
        if (!this.cuentaSeleccionada?.codigoEstadoFactura) {
            this.mensajeService.showWarning('No existe factura');
            return;
        }

        this.blockedPanel = true;
        const solicitud ={
            cuf:this.cuentaSeleccionada.cufFactura!,
            nitEmpresa: this.sessionService.getSessionEmpresaSfeNit()
        }
        this.sfeService.decargar(solicitud)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                const fileName = `factura-${this.cuentaSeleccionada.cufFactura}.pdf`;
                this.fileService.printFile(blob, fileName, imprimir);
                this.blockedPanel = false;
            });
    }

    getSeverity(status: number) {
        switch (status) {
            case 908:
                return 'success';
            case 904:
                return 'warning';
            case 905:
                return 'danger';
            default:
                return 'info';
        }
    }
}

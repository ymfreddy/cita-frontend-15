import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem } from 'primeng/api';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { adm } from 'src/app/shared/constants/adm';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import {
    BusquedaCita,
    BusquedaCliente,
    BusquedaProducto,
    BusquedaServicio,
} from 'src/app/shared/models/busquedas.model';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { Cuenta, CuentaDetalle } from 'src/app/shared/models/cuenta.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { CuentasService } from 'src/app/shared/services/cuentas.service';
import { ServiciosService } from 'src/app/shared/services/servicios.service';
import { SfeService } from 'src/app/shared/services/sfe.service';
import { FormularioClienteComponent } from '../../clientes/formulario-cliente/formulario-cliente.component';
import {
    ProductoResumen,
    SaldoProducto,
} from 'src/app/shared/models/producto.model';
import { ProductosService } from 'src/app/shared/services/productos.service';
import {
    Pago,
    RegistrarFinalizarCuenta,
} from 'src/app/shared/models/pago.model';
import { ServicioResumen } from 'src/app/shared/models/servicio.model';
import { Cita, CitaDetalle } from 'src/app/shared/models/cita.model';
import { CitasService } from 'src/app/shared/services/citas.service';

@Component({
    selector: 'app-formulario-pago-cuenta',
    templateUrl: './formulario-pago-cuenta.component.html',
    styleUrls: ['./formulario-pago-cuenta.component.scss'],
})
export class FormularioPagoCuentaComponent {
    items: MenuItem[] = [{ label: 'Detalle' }, { label: 'Finalizar' }];
    listaTipoPago: any[] = [];
    activeIndexPago: number = 0;
    activeIndexDetalle: number = 0;
    cuenta?: Cuenta;
    itemForm!: FormGroup;
    evento = '';
    submited = false;
    idCita?:number;

    detalle: CuentaDetalle[] = [];
    detalleEliminado: number[] = [];
    detalleSeleccionado?: CuentaDetalle;

    listaClientesFiltrados: Cliente[] = [];

    listaProductos: ProductoResumen[] = [];
    listaProductosFiltrados: ProductoResumen[] = [];

    listaServicios: ServicioResumen[] = [];
    listaServiciosFiltrados: ServicioResumen[] = [];

    listaCitas: Cita[] = [];
    listaCitasFiltrados: Cita[] = [];

    cuentaConTarjeta = false;
    cuentaConGif = false;
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private dialogService: DialogService,
        private mensajeService: MensajeService,
        private clienteService: ClientesService,
        private datepipe: DatePipe,
        private cuentaService: CuentasService,
        private sessionService: SessionService,
        private helperService: HelperService,
        private servicioService: ServiciosService,
        private confirmationService: ConfirmationService,
        private productoService: ProductosService,
        private citasService: CitasService
    ) {
        this.listaTipoPago = [
            { label: 'Contado', value: 1, icon: 'pi pi-wallet' },
            { label: 'Tarjeta', value: 2, icon: 'pi pi-credit-card' },
            { label: 'Cheque', value: 3, icon: 'pi pi-money-bill' },
            { label: 'Otro', value: 5, icon: 'pi pi-qrcode' },
        ];
    }

    ngOnInit(): void {
        this.cuenta = this.config.data.cuenta;
        this.idCita = this.config.data.idCita;
        let clienteTemporal: any;
        if (this.cuenta != null) {
            clienteTemporal = {
                id: this.cuenta?.idCliente,
                codigoCliente: this.cuenta?.codigoCliente,
                telefonoCliente: this.cuenta?.telefonoCliente,
                emailCliente: this.cuenta?.emailCliente,
                nombreCompleto: this.cuenta?.cliente,
            };
        }

        this.itemForm = this.fb.group({
            servicio: [null],
            producto: [null],
            cita: [null],
            clienteTemporal: [clienteTemporal, Validators.required],
            idCliente: [this.cuenta?.idCliente],
            codigoCliente: [this.cuenta?.codigoCliente],
            cliente: [this.cuenta?.cliente],
            telefonoCliente: [this.cuenta?.telefonoCliente],
            id: [{ value: this.cuenta?.id ?? 0, disabled: true }],
            correlativo: [{ value: this.cuenta?.correlativo, disabled: true }],
            idSucursal: [
                this.cuenta?.idSucursal ??
                    this.sessionService.getSessionUserData().idSucursal,
            ],
            fecha: [
                this.datepipe.transform(
                    this.cuenta?.fecha ?? new Date(),
                    'dd/MM/yyyy'
                ) ?? '',
            ],
            codigoTipoCuenta: [
                this.cuenta?.codigoTipoCuenta ?? adm.TIPO_CUENTA_CONTADO,
                Validators.required,
            ],
            codigoEstadoCuenta: [
                this.cuenta?.codigoEstadoCuenta ?? adm.ESTADO_CUENTA_ACTIVO,
                Validators.required,
            ],
            subtotal: [{ value: this.cuenta?.subtotal ?? 0, disabled: true }],
            descuentoAdicional: [
                this.cuenta?.descuentoAdicional ?? 0,
                Validators.required,
            ],
            total: [{ value: this.cuenta?.total ?? 0, disabled: true }],

            codigoTipoPago: [
                adm.CODIGO_TIPO_PAGO_EFECTIVO,
                Validators.required,
            ],
            numeroTarjeta: [{ value: '', disabled: true }],
            codigoTipoMoneda: [adm.CODIGO_TIPO_MONEDA_BOLIVIANO],
            tipoCambio: [adm.TIPO_DE_CAMBIO_BOLIVIANO],
            gift: [0],
            montoPagado: [0],
        });

        // cargar datos adicionales
        this.detalle = this.cuenta?.detalle ?? [];

        if (this.idCita) {
            this.establecerDatosCita(this.idCita);
        }
    }

    public onSubmit(): void {
        if (this.evento === 'salir') {
            this.dialogRef.close(null);
        }
        if (this.evento === 'atras') {
            this.activeIndexPago = 0;
        } else {
            if (!this.itemForm.valid) {
                this.mensajeService.showWarning('Verifique los datos');
                return;
            }
            if (this.evento === 'siguiente') {
                if (this.detalle.length==0) {
                    this.mensajeService.showWarning('Debe agregar al menos un item');
                    return;
                }
                this.activeIndexPago = 1;
            }
            if (this.evento === 'finalizar') this.finalizarCuenta();
        }
    }

    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
    }

    getDetalleTotal(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.total)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES);
        }

        return 0;
    }

    getDetalleDescuento(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.descuento)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES);
        }

        return 0;
    }

    getDetalleSubtotal(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.subtotal)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES);
        }

        return 0;
    }

    getTotal() {
        let valor =
            this.getDetalleTotal() - this.itemForm.value.descuentoAdicional;
        return !isNaN(valor)
            ? this.helperService.round(valor, adm.NUMERO_DECIMALES)
            : 0;
    }

    getSaldo() {
        let valor = this.getTotal() - this.itemForm.value.montoPagado;
        return !isNaN(valor)
            ? this.helperService.round(valor, adm.NUMERO_DECIMALES)
            : 0;
    }

    deleteItem(item: any) {
        this.detalle = this.detalle.filter((x) =>{ return !(x.codigoStock === item.codigoStock && x.codigoProducto === item.codigoProducto && x.reservado === item.reservado)});
        // verificar si tiene id
        if (item.id) {
            this.detalleEliminado.push(item.id);
        }
    }

    onEditComplete(event: any) {
        console.log(event);
        this.calcularFilas();
    }
    calcularFilas() {
        this.detalle.forEach((row) => {
            if (!row.precio) {
                row.precio = 0;
            }
            if (!row.cantidad) {
                row.cantidad = 0;
            }
            if (!row.descuento) {
                row.descuento = 0;
            }
            let subtotal = row.precio * row.cantidad;
            subtotal = this.helperService.round(subtotal, adm.NUMERO_DECIMALES);
            row.subtotal = subtotal;

            let descuento = row.descuento;
            descuento = this.helperService.round(
                descuento,
                adm.NUMERO_DECIMALES
            );
            row.descuento = descuento;

            row.total = this.helperService.round(
                subtotal - descuento,
                adm.NUMERO_DECIMALES
            );
        });
    }

    // cliente
    actualizarCliente() {
        if (!this.itemForm.controls['clienteTemporal'].value) {
            this.mensajeService.showWarning(
                'Debe seleccionar un cliente para actualizar'
            );
            return;
        }

        this.clienteService
            .getById(this.itemForm.controls['clienteTemporal'].value.id)
            .subscribe({
                next: (res) => {
                    const ref = this.dialogService.open(
                        FormularioClienteComponent,
                        {
                            header: 'Actualizar',
                            width: '80%',
                            data: {
                                idEmpresa:
                                    this.sessionService.getSessionEmpresaId(),
                                item: res.content,
                            },
                        }
                    );
                    ref.onClose.subscribe((res2) => {
                        if (res2) {
                            this.seleccionarCliente(res2);
                        }
                    });
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                },
            });
    }

    filtrarCliente(event: any) {
        let query = event.query;
        this.buscarCliente(query);
    }

    buscarCliente(termino: string) {
        const criteriosBusqueda: BusquedaCliente = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            termino: termino.trim(),
            cantidadRegistros: 10,
            resumen: true,
        };

        this.clienteService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaClientesFiltrados = [];
                    return;
                }
                this.listaClientesFiltrados = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    seleccionarCliente(event: any) {
        this.itemForm.patchValue({ clienteTemporal: event });
        this.itemForm.patchValue({ idCliente: event?.id });
        this.itemForm.patchValue({ codigoCliente: event?.codigoCliente });
        this.itemForm.patchValue({ cliente: event?.nombreCompleto });
        this.itemForm.patchValue({ telefonoCliente: event?.telefono });
        //this.elmP?.focusInput();
    }

    limpiarCliente() {
        this.itemForm.patchValue({ clienteTemporal: null });
        this.itemForm.patchValue({ idCliente: '' });
        this.itemForm.patchValue({ codigoCliente: '' });
        this.itemForm.patchValue({ cliente: '' });
        this.itemForm.patchValue({ telefonoCliente: '' });
        //this.elmC?.focusInput();
    }

    //cita
    establecerDatosCita(idCita:number){
        this.citasService.getById(idCita).subscribe({
            next: (res) => {
                console.log(res.content);
                const citaTemporal = res.content;
                let listaCitaTemporal: Cita[] = [];
                listaCitaTemporal.push(citaTemporal);
                this.listaCitas=listaCitaTemporal;

                // establecer cliente
                const clienteTemporal = {
                    id: res.content.idCliente,
                    codigoCliente: res.content.codigoCliente,
                    telefonoCliente: res.content.telefonoCliente,
                    emailCliente: res.content.emailCliente,
                    nombreCompleto: res.content.cliente,
                };
                this.seleccionarCliente(clienteTemporal);
                this.seleccionarCita(citaTemporal);
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    filtrarCita(event: any) {
        let query = event.query;
        const criteriosBusqueda: BusquedaCita = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            idSucursal: this.sessionService.getSessionUserData().idSucursal,
            codigosEstadosCita:
                adm.CITA_ESTADO_INASISTENCIA +
                ',' +
                adm.CITA_ESTADO_CONFIRMADA +
                ',' +
                adm.CITA_ESTADO_RESERVA +
                ',' +
                adm.CITA_ESTADO_EN_ESPERA +
                ',' +
                adm.CITA_ESTADO_INICIADA,
            resumen: true,
            soloNoPagados: true,
            cantidadRegistros: 20,
            termino: query.trim(),
        };
        this.buscarCita(criteriosBusqueda);
    }

    filtrarCitaCliente() {
        const codigoCliente = this.itemForm.controls['codigoCliente'].value;
        if (!codigoCliente) {
            this.mensajeService.showInfo('Debe seleccionar un cliente');
            return;
        }

        const criteriosBusqueda: BusquedaCita = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            codigoCliente: codigoCliente,
            idSucursal: this.sessionService.getSessionUserData().idSucursal,
            codigosEstadosCita:
                adm.CITA_ESTADO_INASISTENCIA +
                ',' +
                adm.CITA_ESTADO_CONFIRMADA +
                ',' +
                adm.CITA_ESTADO_RESERVA +
                ',' +
                adm.CITA_ESTADO_EN_ESPERA +
                ',' +
                adm.CITA_ESTADO_INICIADA,
            resumen: true,
            soloNoPagados: true,
        };
        this.buscarCita(criteriosBusqueda);
    }

    seleccionarCita(event: any) {
        this.addCitaItem(event);
    }

    buscarCita(criteriosBusqueda: BusquedaCita) {
        this.citasService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                this.listaCitas = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    addCitaItem(cita: Cita) {
        this.listaCitas.findIndex
        let objIndexEvento =this.listaCitas.findIndex((obj => obj.id == cita.id));
        if (!this.listaCitas[objIndexEvento].detalle){
            console.log('cargar detalle por servicio');
            this.citasService.getDetail(cita.id!).subscribe({
                next: (res) => {
                    this.listaCitas[objIndexEvento].detalle= res.content;
                    this.addCitaDetalleItem(this.listaCitas[objIndexEvento].detalle!);
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                },
            });
        }
        else{
            this.addCitaDetalleItem(this.listaCitas[objIndexEvento].detalle!);
        }
    }

    addCitaDetalleItem(citaDetalle: CitaDetalle[]) {
        citaDetalle[0].idCita
        const existeCita = this.detalle.filter((x) => x.idCita === citaDetalle[0].idCita);
        if (existeCita.length>0){
            this.detalle = this.detalle.filter((x) => x.idCita !== citaDetalle[0].idCita);
            this.calcularFilas();
            return;
        }

        citaDetalle.forEach(servicio => {
            const precio = servicio.precio;
            let descuento = 0;
            if (servicio.descuento) {
                descuento = servicio.descuento;
            }

            const item: CuentaDetalle = {
                idProducto: servicio.idProducto,
                codigo: '',
                codigoTipoProducto: servicio.codigoTipoProducto,
                codigoProducto: servicio.codigoProducto,
                producto: servicio.producto,
                cantidad: servicio.cantidad,
                precio: precio,
                subtotal: precio,
                descuento: descuento,
                total: precio - descuento,
                codigoTipoDescuento: servicio.codigoTipoDescuento,
                valorDescuento: servicio.descuento,
                idCita:servicio.idCita,
                reservado:true,
                idCitaDetalle: servicio.id
            };
            this.detalle.push(item);
            this.itemForm.patchValue({ cita: null });
            //this.elmP?.focusInput();
        });
    }

    // productos
    filtrarProducto(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarProducto(query);
    }

    seleccionarProducto(event: any) {
        this.addProductoItem(event);
    }

    buscarProducto(termino: string) {
        const criteriosBusqueda: BusquedaProducto = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            idSucursal: this.sessionService.getSessionUserData().idSucursal,
            termino: termino.trim(),
            cantidadRegistros: 20,
            resumen: true,
        };

        this.productoService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                console.log(res.content);
                this.convertirSaldos(res.content);
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    addProductoItem(producto: ProductoResumen) {
        const existeProducto = producto.saldo
            ? this.detalle.find(
                  (x) =>
                      x.codigoProducto === producto.codigoProducto &&
                      x.codigoStock === producto.saldo?.codigoStock && !x.reservado
              )
            : this.detalle.find(
                  (x) => x.codigoProducto === producto.codigoProducto && !x.reservado
              );

        const esConInventario =
            producto.codigoTipoProducto ===
            adm.TIPO_PRODUCTO_PRODUCTO_INVENTARIO;

        if (
            esConInventario &&
            (!producto.saldo || producto.saldo.saldo! <= 0)
        ) {
            this.mensajeService.showWarning(
                'El producto no tiene saldo existente'
            );
            return;
        }

        if (existeProducto) {
            existeProducto.cantidad = existeProducto.cantidad + 1;
            this.calcularFilas();
            return;
        }

        const precio = esConInventario
            ? producto.saldo?.precioVenta!
            : producto.precio;
        let descuento = 0;
        if (producto.descuento) {
            if (esConInventario) {
                if (
                    !this.esDescuentoPorcentaje(
                        producto.descuento.codigoTipoDescuento!
                    )
                ) {
                    descuento = producto.descuento.descuentoEstablecido!;
                } else {
                    let tempDescuento =
                        (precio * producto.descuento.descuentoEstablecido!) /
                        100;
                    descuento = this.helperService.round(
                        tempDescuento,
                        adm.NUMERO_DECIMALES
                    );
                }
            } else {
                descuento = producto.descuento.descuento;
            }
        }

        const item: CuentaDetalle = {
            idProducto: producto.id,
            codigo: '',
            codigoTipoProducto: producto.codigoTipoProducto,
            codigoProducto: producto.codigoProducto,
            producto: producto.nombre,
            cantidad: 1,
            precio: precio,
            subtotal: precio,
            descuento: descuento,
            total: precio - descuento,
            codigoTipoDescuento: producto.descuento
                ? producto.descuento.codigoTipoDescuento
                : adm.TIPO_DESCUENTO_TOTAL,
            valorDescuento: producto.descuento
                ? producto.descuento.descuentoEstablecido
                : 0,
            codigoStock: producto.saldo?.codigoStock,
            reservado:false
        };
        this.detalle.push(item);
        this.itemForm.patchValue({ producto: null });
        //this.elmP?.focusInput();
    }

    deleteProductoItem(item: any) {
        this.detalle = this.detalle.filter(
            (x) => x.codigoProducto != item.codigoProducto && !x.reservado
        );
        // verificar si tiene id
        if (item.id) {
            this.detalleEliminado.push(item.id);
        }
    }

    // servicios
    filtrarServicio(event: any) {
        let query = event.query;
        this.buscarServicio(query);
    }

    seleccionarServicio(event: any) {
        this.addServicioItem(event);
    }

    buscarServicio(termino: string) {
        const criteriosBusqueda: BusquedaServicio = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            idSucursal: this.sessionService.getSessionUserData().idSucursal,
            termino: termino.trim(),
            cantidadRegistros: 20,
            resumen: true,
        };

        this.servicioService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                console.log(res.content);
                let lista = res.content;
                if (lista.length == 0) {
                    this.listaServicios = [];
                    return;
                }
                this.listaServicios = lista;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    addServicioItem(servicio: ServicioResumen) {
        console.log(this.detalle);
        const existeProducto = this.detalle.find(
            (x) => x.codigoProducto === servicio.codigoProducto && !x.reservado
        );

        if (existeProducto) {
            existeProducto.cantidad = existeProducto.cantidad + 1;
            this.calcularFilas();
            return;
        }

        const precio = servicio.precio;
        let descuento = 0;
        if (servicio.descuento) {
            descuento = servicio.descuento.descuento;
        }

        const item: CuentaDetalle = {
            idProducto: servicio.id,
            codigo: '',
            codigoProducto: servicio.codigoProducto,
            codigoTipoProducto: servicio.codigoTipoProducto,
            producto: servicio.nombre,
            cantidad: 1,
            precio: precio,
            subtotal: precio,
            descuento: descuento,
            total: precio - descuento,
            codigoTipoDescuento: servicio.descuento
                ? servicio.descuento.codigoTipoDescuento
                : adm.TIPO_DESCUENTO_TOTAL,
            valorDescuento: servicio.descuento
                ? servicio.descuento.descuentoEstablecido
                : 0,
            reservado:false
        };
        this.detalle.push(item);
        this.itemForm.patchValue({ servicio: null });
        //this.elmP?.focusInput();
    }

    deleteServicioItem(item: any) {
        this.detalle = this.detalle.filter(
            (x) => x.codigoProducto != item.codigoProducto && !x.reservado
        );
        // verificar si tiene id
        if (item.id) {
            this.detalleEliminado.push(item.id);
        }
    }

    esDescuentoPorcentaje(codigoTipoDescuento: string) {
        return codigoTipoDescuento === adm.TIPO_DESCUENTO_PORCENTAJE;
    }

    esDescuentoTotal(codigoTipoDescuento: string) {
        return codigoTipoDescuento === adm.TIPO_DESCUENTO_TOTAL;
    }

    convertirSaldos(lista: any[]) {
        if (lista.length == 0) {
            this.listaProductos = [];
            return;
        }
        let temporal: ProductoResumen[] = [];
        lista.forEach((element: any) => {
            if (element.saldos && element.saldos.length > 0) {
                element.saldos.forEach((saldo: any) => {
                    const prod: ProductoResumen = { ...element };
                    const temp: SaldoProducto = {
                        idProducto: saldo.idProducto,
                        codigoStock: saldo.codigoStock,
                        precioCompra: saldo.precioCompra,
                        precioVenta: saldo.precioVenta,
                        saldo: saldo.saldo,
                    };
                    prod.saldo = temp;
                    prod.codigoProductoStock =
                        prod.codigoProducto + ':' + prod.saldo?.codigoStock;
                    temporal.push(prod);
                });
            } else {
                let prod: ProductoResumen = { ...element };
                prod.codigoProductoStock = prod.codigoProducto;
                temporal.push(prod);
            }
        });
        this.listaProductos = temporal;
    }

    public siguiente(): void {
        if (
            this.itemForm.controls['codigoTipoCuenta'].value ===
            adm.TIPO_CUENTA_CONTADO
        ) {
            this.itemForm.patchValue({ montoPagado: this.getTotal() });
            this.itemForm.controls['montoPagado'].disable();
        } else {
            //this.elmMontoPagado?.nativeElement.focus();
            this.itemForm.patchValue({ montoPagado: 0 });
            this.itemForm.controls['montoPagado'].enable();
        }
        this.itemForm.updateValueAndValidity();
        this.evento = 'siguiente';
    }

    public atras(): void {
        this.evento = 'atras';
    }

    public guardar(): void {
        this.evento = 'guardar';
    }

    public finalizar(): void {
        this.evento = 'finalizar';
    }

    // metodo pago
    canbioTipoPago(event: any) {
        if (!event.value) {
            this.cuentaConGif = false;
            this.cuentaConTarjeta = false;
            this.itemForm.controls['numeroTarjeta'].disable();
            this.itemForm.patchValue({ numeroTarjeta: '' });
            this.itemForm.patchValue({ gift: 0 });
            this.itemForm.updateValueAndValidity();
            return;
        }

        if (event.value === adm.CODIGO_TIPO_PAGO_TARJETA) {
            this.itemForm.controls['numeroTarjeta'].enable();
            this.cuentaConTarjeta = true;
        } else {
            this.cuentaConTarjeta = false;
            this.itemForm.controls['numeroTarjeta'].disable();
            this.itemForm.patchValue({ numeroTarjeta: '' });
        }

        this.itemForm.updateValueAndValidity();
    }

    finalizarCuenta() {
        let existeItemError: string = '';
        if (this.detalle.length==0) {
            this.mensajeService.showWarning('Debe agregar al menos un item');
            return;
        }

        this.detalle.forEach((element) => {
            if (element.cantidad <= 0) {
                existeItemError =
                    'La cantidad del item ' +
                    element.producto +
                    ', debe ser mayor a 0 ';
                return;
            }
            if (element.precio <= 0) {
                existeItemError =
                    'El precio del item ' +
                    element.producto +
                    ', debe ser mayor a 0 ';
                return;
            }
            if (element.descuento < 0) {
                existeItemError =
                    'El descuento del item ' +
                    element.producto +
                    ', debe ser mayor o igual a 0 ';
                return;
            }
            if (element.total <= 0) {
                existeItemError =
                    'El total del servicio ' +
                    element.producto +
                    ', debe ser mayor a 0 ';
                return;
            }
            var lgnDescAdicional = element.descripcionAdicional
                ? element.descripcionAdicional.length
                : 0;
            if (element.producto!.length + lgnDescAdicional > 500) {
                existeItemError =
                    'El nombre y la descripción adicional no deben ser más de 500 caracteres';
                return;
            }
        });

        if (existeItemError) {
            this.mensajeService.showWarning(existeItemError);
            return;
        }

        if (
            this.itemForm.controls['descuentoAdicional'].value >=
            this.getDetalleTotal()
        ) {
            this.mensajeService.showWarning(
                'El Descuento adicional no puede ser mayor o igual al Total'
            );
            return;
        }
        if (this.getTotal() < 0) {
            this.mensajeService.showWarning('El total no puede ser menor a 0');
            return;
        }

        if (
            this.itemForm.controls['montoPagado'].value === null ||
            this.itemForm.controls['montoPagado'].value === undefined
        ) {
            this.mensajeService.showWarning(
                'El monto pagado debe tener un valor'
            );
            return;
        }

        if (
            this.itemForm.controls['codigoTipoCuenta'].value ===
                adm.TIPO_CUENTA_CREDITO &&
            (this.itemForm.controls['montoPagado'].value < 0 ||
                this.itemForm.controls['montoPagado'].value >= this.getTotal())
        ) {
            this.mensajeService.showWarning(
                'El monto pagado debe ser entre 0 y ' + this.getTotal()
            );
            return;
        }

        const cuenta: Cuenta = {
            ...this.cuenta,
            id: this.itemForm.controls['id'].value,
            idSucursal:
                this.itemForm.controls['idSucursal'].value ??
                this.sessionService.getSessionUserData().idSucursal,
            idCliente: this.itemForm.controls['idCliente'].value,
            codigoCliente: this.itemForm.controls['codigoCliente'].value,
            cliente: this.itemForm.controls['cliente'].value,
            telefonoCliente: this.itemForm.controls['telefonoCliente'].value,
            codigoEstadoCuenta:
                this.itemForm.controls['codigoEstadoCuenta'].value,
            codigoTipoCuenta: this.itemForm.controls['codigoTipoCuenta'].value,
            subtotal: this.getDetalleTotal(),
            descuentoAdicional:
                this.itemForm.controls['descuentoAdicional'].value,
            total: this.getTotal(),
            detalle: this.detalle,
            itemsEliminados:
                this.detalleEliminado.length == 0
                    ? null
                    : this.detalleEliminado,
        };

        const pago: Pago = {
            idCuenta: this.itemForm.controls['id'].value,
            idSucursal: this.itemForm.controls['idSucursal'].value,
            idTurno: this.sessionService.getTurno(),
            gift: this.itemForm.controls['gift'].value,
            idCliente: this.itemForm.controls['idCliente'].value,
            codigoCliente: this.itemForm.controls['codigoCliente'].value,
            cliente: this.itemForm.controls['cliente'].value,
            telefonoCliente: this.itemForm.controls['telefonoCliente'].value,
            codigoTipoPago: this.itemForm.controls['codigoTipoPago'].value,
            codigoTipoMoneda: this.itemForm.controls['codigoTipoMoneda'].value,
            numeroTarjeta: this.itemForm.controls[
                'numeroTarjeta'
            ].value.replaceAll('-0000-0000-', '00000000'),
            tipoCambio: this.itemForm.controls['tipoCambio'].value,
            montoPagado: this.itemForm.controls['montoPagado'].value,
        };

        const finalizar: RegistrarFinalizarCuenta = {
            pago: pago.montoPagado === 0 ? null : pago,
            cuenta: cuenta,
        };

        console.log(finalizar);
        this.confirmationService.confirm({
            message: 'Esta seguro de finalizar la cuenta?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.submited = true;
                this.cuentaService.registrarFinalizar(finalizar).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(res.content);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            },
        });
    }
}

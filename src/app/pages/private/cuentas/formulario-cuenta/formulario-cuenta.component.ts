import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { FormularioClienteComponent } from '../../clientes/formulario-cliente/formulario-cliente.component';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { DatePipe } from '@angular/common';
import { SessionService } from 'src/app/shared/security/session.service';
import { Cuenta, CuentaDetalle } from 'src/app/shared/models/cuenta.model';
import { CuentasService } from 'src/app/shared/services/cuentas.service';
import {
    Servicio,
    ServicioResumen,
} from 'src/app/shared/models/servicio.model';
import { adm } from 'src/app/shared/constants/adm';
import { MenuItem } from 'primeng/api';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import {
    BusquedaCliente,
    BusquedaServicio,
} from 'src/app/shared/models/busquedas.model';
import { AutoComplete } from 'primeng/autocomplete';
import { ServiciosService } from 'src/app/shared/services/productos.service';

@Component({
    selector: 'app-formulario-cuenta',
    templateUrl: './formulario-cuenta.component.html',
    styleUrls: ['./formulario-cuenta.component.scss'],
})
export class FormularioCuentaComponent implements OnInit {
    @ViewChild('clienteTemporal') elmC?: AutoComplete;
    @ViewChild('servicio') elmP?: AutoComplete;
    items: MenuItem[] = [];

    itemsMenu: MenuItem[] = [];

    activeIndex: number = 0;

    cuenta?: Cuenta;
    cliente?: Cliente;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaTipos: Parametrica[] = [];

    detalle: CuentaDetalle[] = [];
    detalleEliminado: number[] = [];

    listaServiciosFiltrados: ServicioResumen[] = [];
    listaClientesFiltrados: Cliente[] = [];
    detalleSeleccionado?: CuentaDetalle;

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private dialogService: DialogService,
        private mensajeService: MensajeService,
        private parametricasService: ParametricasService,
        private clienteService: ClientesService,
        private datepipe: DatePipe,
        private cuentaService: CuentasService,
        private sessionService: SessionService,
        private helperService: HelperService,
        private servicioService: ServiciosService
    ) {}

    ngOnInit(): void {
        this.items = [
            {
                label: 'Detalle',
                command: (event: any) =>
                    this.mensajeService.showInfo(event.item.label),
            },
            {
                label: 'Finalizar',
                command: (event: any) =>
                    this.mensajeService.showInfo(event.item.label),
            },
        ];

        this.cuenta = this.config.data.cuenta;
        console.log(this.cuenta);

        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TIPO_CUENTA)
            .subscribe((data) => {
                this.listaTipos = data as unknown as Parametrica[];
            });

        let clienteTemporal: any;
        if (this.cuenta != null) {
            clienteTemporal = {
                id: this.cuenta?.idCliente,
                codigoCliente: this.cuenta?.codigoCliente,
                email: this.cuenta?.telefonoCliente,
                nombre: this.cuenta?.cliente,
            };
        }

        this.itemForm = this.fb.group({
            servicio: [null],
            clienteTemporal: [clienteTemporal, Validators.required],
            idCliente: [this.cuenta?.idCliente],
            codigoCliente: [this.cuenta?.codigoCliente],
            cliente: [this.cuenta?.cliente],
            telefonoCliente: [this.cuenta?.telefonoCliente],
            id: [{ value: this.cuenta?.id ?? 0, disabled: true }],
            correlativo: [{ value: this.cuenta?.correlativo, disabled: true }],
            idSucursal: [this.cuenta?.idSucursal],
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
        });

        // cargar datos cliente
        /*this.clienteService.getById(this.cuenta?.idCliente!).subscribe({
            next: (res) => {
                this.cliente = res.content;
                this.itemForm.patchValue({ idCliente: this.cliente?.id });
                this.itemForm.updateValueAndValidity();
            },
            error: (err) => {},
        });*/

        // cargar datos adicionales
        this.detalle = this.cuenta?.detalle ?? [];
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            if (this.cuenta?.id) this.elmP?.focusInput();
            else this.elmC?.focusInput();
        }, 500);
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.mensajeService.showWarning('Verifique los datos');
                return;
            }
            if (this.detalle.length == 0) {
                this.mensajeService.showWarning(
                    'Debe agregar al menos un servicio a la cuenta'
                );
                return;
            }

            // verificar los item
            let existeItemError: string = '';
            this.detalle.forEach((element) => {
                if (element.cantidad <= 0) {
                    existeItemError =
                        'La cantidad del servicio ' +
                        element.servicio +
                        ', debe ser mayor a 0 ';
                    return;
                }
                if (element.precio <= 0) {
                    existeItemError =
                        'El precio del servicio ' +
                        element.servicio +
                        ', debe ser mayor a 0 ';
                    return;
                }
                if (element.descuento < 0) {
                    existeItemError =
                        'El descuento del servicio ' +
                        element.servicio +
                        ', debe ser mayor o igual a 0 ';
                    return;
                }
                if (element.total <= 0) {
                    existeItemError =
                        'El total del servicio ' +
                        element.servicio +
                        ', debe ser mayor a 0 ';
                    return;
                }
                var lgnDescAdicional = element.descripcionAdicional
                    ? element.descripcionAdicional.length
                    : 0;
                if (element.servicio!.length + lgnDescAdicional > 500) {
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
                this.mensajeService.showWarning(
                    'El total no puede ser menor a 0'
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
                telefonoCliente:
                    this.itemForm.controls['telefonoCliente'].value,
                codigoEstadoCuenta:
                    this.itemForm.controls['codigoEstadoCuenta'].value,
                codigoTipoCuenta:
                    this.itemForm.controls['codigoTipoCuenta'].value,
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

            this.submited = true;
            if (cuenta.id > 0) {
                this.cuentaService.edit(cuenta).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.submited = false;
                        this.dialogRef.close(res.content);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.cuentaService.add(cuenta).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.submited = false;
                        this.dialogRef.close(res.content);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            }
        }
    }

    // servicio
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

    // servicio

    buscarServicio(termino: string) {
        const criteriosBusqueda: BusquedaServicio = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            //idSucursal: this.sessionService.getSessionUserData().idSucursal,
            termino: termino.trim(),
            cantidadRegistros: 20,
            resumen: true,
        };

        this.servicioService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaServiciosFiltrados = [];
                    return;
                }
                this.listaServiciosFiltrados = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    addItem(servicio: Servicio) {
        const existeServicio = this.detalle.find(
            (x) => x.codigoServicio === servicio.codigoServicio
        );
        if (existeServicio) {
            this.mensajeService.showWarning('El servicio ya está adicionado');
            return;
        }

        const detalle: CuentaDetalle = {
            idServicio: servicio.id,
            codigoServicio: servicio.codigoServicio,
            codigoTipoDescuento: servicio.descuento
                ? servicio.descuento.codigoTipoDescuento
                : adm.TIPO_DESCUENTO_TOTAL,
            valorDescuento: servicio.descuento
                ? servicio.descuento.descuentoEstablecido
                : 0,
            servicio: servicio.nombre,
            cantidad: 1,
            precio: servicio.precio,
            subtotal: servicio.precio,
            descuento: 0,
            total: servicio.precio,
        };

        this.itemForm.patchValue({ servicio: null });
        this.listaServiciosFiltrados = [];

        this.detalle.push(detalle);
        this.elmP?.focusInput();
    }

    deleteItem(item: any) {
        this.detalle = this.detalle.filter(
            (x) => x.codigoServicio != item.codigoServicio
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

    filtrarServicio(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarServicio(query);
    }

    seleccionarServicio(event: any) {
        this.addItem(event);
    }

    onEditComplete(event: any) {
        console.log(event);
        this.calcularFilas();
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
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
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
        this.elmP?.focusInput();
    }

    limpiarCliente() {
        this.itemForm.patchValue({ clienteTemporal: null });
        this.itemForm.patchValue({ idCliente: '' });
        this.itemForm.patchValue({ codigoCliente: '' });
        this.itemForm.patchValue({ cliente: '' });
        this.itemForm.patchValue({ telefonoCliente: '' });
        this.elmC?.focusInput();
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    onActiveIndexChange(event: any) {
        this.activeIndex = event;
    }

    // ngOnDestroy(): void {
    //     this.dialogService.dialogComponentRefMap.forEach((dialog) => {
    //         dialog.destroy();
    //     });
    // }
}

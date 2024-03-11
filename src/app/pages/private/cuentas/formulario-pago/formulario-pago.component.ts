import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Liquidacion, Pago } from 'src/app/shared/models/pago.model';
import { Cliente } from 'src/app/shared/models/cliente.model';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { Cuenta } from '../../../../shared/models/cuenta.model';
import { InputNumber } from 'primeng/inputnumber';
import { ConfirmationService } from 'primeng/api';
import { PagosService } from 'src/app/shared/services/pagos.service';
import { delay } from 'rxjs';
import { adm } from 'src/app/shared/constants/adm';
import { AutoComplete } from 'primeng/autocomplete';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { ParametricaSfe } from 'src/app/shared/models/sfe.model';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { SfeService } from 'src/app/shared/services/sfe.service';
import { BusquedaCliente } from 'src/app/shared/models/busquedas.model';

@Component({
  selector: 'app-formulario-pago',
  templateUrl: './formulario-pago.component.html',
  styleUrls: ['./formulario-pago.component.scss']
})
export class FormularioPagoComponent implements OnInit {
    @ViewChild('cliente') elmC?: AutoComplete;
    @ViewChild('cuenta') inputCuenta!: InputNumber;
    @ViewChild('descripcion') inputDescripcion!: ElementRef;
    items: Cuenta[] = [];
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;

    listaTipoPago: ParametricaSfe[] = [];
    listaClientesFiltrados: Cliente[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private sessionService: SessionService,
        public dialogService: DialogService,
        private mensajeService: MensajeService,
        private clienteService: ClientesService,
        private sfeService: SfeService,
        private confirmationService: ConfirmationService,
        private pagoService: PagosService,
        private fileService:FilesService,
        private helperService: HelperService
    ) {}

    ngAfterViewInit(): void {
        setTimeout(() => {
            if (this.items.length == 1)
                this.inputCuenta.input.nativeElement.focus();
            else this.inputDescripcion.nativeElement.focus();
        }, 500);
    }

    ngOnInit(): void {
        let temporalCliente: any;
        this.items = this.config.data;
        if (this.items && this.items.length>0){
            temporalCliente = {
                id: this.items[0].idCliente,
                codigoCliente: this.items[0].codigoCliente,
                nombre: this.items[0].cliente,
            };
        }

        this.sfeService.getTipoMetodoPago().subscribe((data) => {
            this.listaTipoPago = data as unknown as ParametricaSfe[];
        });

        this.itemForm = this.fb.group({
            idCuenta: [this.items[0].id],
            codigoTipoPago: [
                adm.CODIGO_TIPO_PAGO_EFECTIVO,
                Validators.required,
            ],
            numeroTarjeta: [{ value: '', disabled: true }],
            codigoTipoMoneda: [adm.CODIGO_TIPO_MONEDA_BOLIVIANO],
            tipoCambio: [adm.TIPO_DE_CAMBIO_BOLIVIANO],

            temporalCliente: [temporalCliente, Validators.required],
            idCliente: [this.items[0]?.idCliente],
            codigoCliente: [this.items[0]?.codigoCliente],
            cliente: [this.items[0]?.cliente],

            totalCuenta: [this.getTotalTotal()],
            saldo: [this.getSaldoTotal()],
            cuenta: [
                //this.items.length == 1 ? 0 : this.getSaldoTotal(),
                this.getSaldoTotal(),
                Validators.required,
            ],
            gift: [0],
            montoPagado: [0],
            descripcion: ['', Validators.required],
        });
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.mensajeService.showWarning('Verifique los datos');
                return;
            }

            // verificar el turno
            /*if (this.sessionService.getTurno() == 0) {
                this.mensajeService.showWarning(
                    'No exise un turno abierto para realizar la operación'
                );
                return;
            }*/

            if (
                this.itemForm.controls['cuenta'].value <= 0 ||
                this.itemForm.controls['cuenta'].value >
                    this.itemForm.controls['saldo'].value
            ) {
                this.mensajeService.showWarning(
                    'El monto a cuenta debe ser mayor a 0 y menor o igual al saldo actual'
                );
                return;
            }

            const pago: Pago = {
                idCuenta: this.itemForm.controls['idCuenta'].value,
                idTurno: this.sessionService.getTurno(),
                gift: this.itemForm.controls['gift'].value,
                idCliente: this.itemForm.controls['idCliente'].value,
                codigoCliente: this.itemForm.controls['codigoCliente'].value,
                codigoTipoPago: this.itemForm.controls['codigoTipoPago'].value,
                codigoTipoMoneda:
                    this.itemForm.controls['codigoTipoMoneda'].value,
                numeroTarjeta: this.itemForm.controls[
                    'numeroTarjeta'
                ].value.replaceAll('-', ''),
                tipoCambio: this.itemForm.controls['tipoCambio'].value,
                montoPagado: this.itemForm.controls['cuenta'].value,
                descripcion: this.itemForm.controls['descripcion'].value,
            };

            this.confirmationService.confirm({
                message: 'Esta seguro de realizar la operación?',
                header: 'Confirmación',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.submited = true;
                    if (this.items.length == 1) {
                        this.pagoService.add(pago).subscribe({
                            next: (res) => {
                                this.mensajeService.showSuccess(
                                    res.message
                                );
                                //this.printPago(res.content.id, res.content.correlativo);
                                this.dialogRef.close(pago);
                                this.submited = false;
                            },
                            error: (err) => {
                                this.mensajeService.showError(
                                    err.error.message
                                );
                                this.submited = false;
                            },
                        });
                    } else {
                        const liquidacion: Liquidacion = {
                            pago: pago,
                            listaIdCuentas: this.items.map(a=>a.id),
                        };
                        this.pagoService.liquidar(liquidacion).subscribe({
                            next: (res) => {
                                this.mensajeService.showSuccess(
                                    res.message
                                );
                                /*res.content.forEach((element: any) => {
                                    this.printPago(element.id,element.correlativo);
                                });*/

                                this.dialogRef.close(pago);
                                this.submited = false;
                            },
                            error: (err) => {
                                this.mensajeService.showError(
                                    err.error.message
                                );
                                this.submited = false;
                            },
                        });
                    }
                },
            });
        }
    }

    printPago(idPago: number, correlativo: string) {
        // const fileName = `pago-${correlativo}.pdf`;
        // this.utilidadesService
        //     .getReciboPago(idPago)
        //     .pipe(delay(1000))
        //     .subscribe((blob: Blob): void => {
        //         this.fileService.printFile(blob, fileName, false);
        //     });
    }

    getSaldoNuevo() {
        let valor = this.itemForm.value.saldo - this.itemForm.value.cuenta;
        return !isNaN(valor) ? this.helperService.round(valor, adm.NUMERO_DECIMALES): 0;
    }

    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
    }

    getSaldoTotal(): number {
        if (this.items) {
            const sum = this.items
                .map((t) => t.saldo!)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES)
        }

        return 0;
    }

    getTotalTotal(): number {
        if (this.items) {
            const sum = this.items
                .map((t) => t.total!)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES)
        }

        return 0;
    }

    onClose() {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

   // CLIENTE
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
    this.itemForm.patchValue({ temporalCliente: event });
    this.itemForm.patchValue({ idCliente: event?.id });
    this.itemForm.patchValue({ codigoCliente: event?.codigoCliente });
    this.itemForm.patchValue({ cliente: event?.nombre });
}

limpiarCliente() {
    this.itemForm.patchValue({ temporalCliente: null });
    this.itemForm.patchValue({ idCliente: '' });
    this.itemForm.patchValue({ codigoCliente: '' });
    this.itemForm.patchValue({ cliente: '' });
    this.elmC?.focusInput();
}
}

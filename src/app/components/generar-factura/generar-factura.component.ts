import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { BusquedaCliente } from 'src/app/shared/models/busquedas.model';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { Cuenta } from 'src/app/shared/models/cuenta.model';
import { AsociacionSfe, SolicitudRecepcionFactura } from 'src/app/shared/models/sfe.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { SfeService } from 'src/app/shared/services/sfe.service';

@Component({
  selector: 'app-generar-factura',
  templateUrl: './generar-factura.component.html',
  styleUrls: ['./generar-factura.component.scss']
})
export class GenerarFacturaComponent implements OnInit {
    submited = false;
    closeClicked = false;
    cuenta!: Cuenta;
    itemForm!: FormGroup;
    listaAsociacion: AsociacionSfe[] = [];
    listaClientesFiltrados: Cliente[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private mensajeService: MensajeService,
        private sfeService: SfeService,
        private sessionService: SessionService,
        private clienteService:ClientesService
    ) {}

    ngOnInit(): void {
        //this.item = this.sessionService.getSessionUserData();
        this.cuenta = this.config.data.cuenta;
        console.log(this.cuenta);

         // cargar parametricas
        this.sfeService.getAsociaciones(this.sessionService.getSessionEmpresaSfeNit()).subscribe((data) => {
            this.listaAsociacion = data as unknown as AsociacionSfe[];
        });

        this.itemForm = this.fb.group({
            clienteTemporal: [null, Validators.required],
            codigoCliente: [null],
            razonSocial: [null, Validators.required],
            email: [null],
            codigoAsociacion: [null, Validators.required],
        });

        this.clienteService
            .getById(this.cuenta.idCliente!)
            .subscribe({
                next: (res) => {
                    this.itemForm.patchValue({ clienteTemporal: res.content});
                    this.itemForm.patchValue({ codigoCliente: res.content.codigoCliente});
                    this.itemForm.patchValue({ razonSocial: res.content.razonSocial?? res.content.nombreCompleto});
                    this.itemForm.patchValue({ email: res.content.email});
                    this.itemForm.updateValueAndValidity();
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                },
            });

    }

    public onSubmit(): void {
        if (!this.itemForm.valid) {
            this.mensajeService.showWarning('Verifique los datos');
            return;
        }

        const solicitud:SolicitudRecepcionFactura = {
            idCuenta: this.cuenta.id,
            codigoAsociacion: this.itemForm.controls['codigoAsociacion'].value ,
            codigoCliente: this.itemForm.controls['codigoCliente'].value ,
            razonSocial: this.itemForm.controls['razonSocial'].value ,
            email: this.itemForm.controls['email'].value
        }

        this.submited = true;
        this.sfeService.recepcionar(solicitud)
            .subscribe({
                next: (res) => {
                    this.mensajeService.showSuccess(res.message);
                    this.dialogRef.close(res.content);
                    this.submited = false;
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                    this.submited = false;
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
        this.itemForm.patchValue({ codigoCliente: event?.codigoCliente });
        this.itemForm.patchValue({ razonSocial: event?.razonSocial??event?.nombreCompleto });
        this.itemForm.patchValue({ email: event?.email });
        //this.elmP?.focusInput();
    }

    limpiarCliente() {
        this.itemForm.patchValue({ clienteTemporal: null });
        this.itemForm.patchValue({ idCliente: '' });
        this.itemForm.patchValue({ codigoCliente: '' });
        this.itemForm.patchValue({ razonSocial: '' });
        this.itemForm.patchValue({ email: '' });
        //this.elmC?.focusInput();
    }


    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }
}


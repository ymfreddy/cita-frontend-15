import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { ConsultaMedicaDato, ConsultaMedicaRegistro, ConsultaMedicaResumen } from 'src/app/shared/models/consulta-medica.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { ConsultasMedicasService } from '../../../../shared/services/consultas-medicas.service';
import { Cita } from 'src/app/shared/models/cita.model';
import { FormularioClienteComponent } from '../../clientes/formulario-cliente/formulario-cliente.component';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { DatePipe } from '@angular/common';
import { SessionService } from 'src/app/shared/security/session.service';

@Component({
    selector: 'app-formulario-consulta',
    templateUrl: './formulario-consulta.component.html',
    styleUrls: ['./formulario-consulta.component.scss'],
})
export class FormularioConsultaComponent implements OnInit {
    consulta?: ConsultaMedicaResumen;
    datos?: ConsultaMedicaDato;
    cita?: Cita;
    cliente?: Cliente;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaTipos: Parametrica[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private dialogService: DialogService,
        private mensajeService: MensajeService,
        private parametricasService: ParametricasService,
        private clienteService: ClientesService,
        private datepipe: DatePipe,
        private consultaMedicaService: ConsultasMedicasService,
        private sessionService:SessionService
    ) {}

    ngOnInit(): void {
        this.cita = this.config.data.cita;
        this.consulta = this.config.data.consultaMedica;

        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TIPO_CONSULTA)
            .subscribe((data) => {
                this.listaTipos = data as unknown as Parametrica[];
            });

        this.itemForm = this.fb.group({
            id: [this.consulta?.id],
            idEmpresa: [this.consulta?.idEmpresa??this.sessionService.getSessionEmpresaId()],
            correlativo: [this.consulta?.correlativo],
            idCita: [this.cita ? this.cita?.id : null],
            idCliente: [this.consulta?.idCliente],
            idUsuarioProfesional: [this.consulta?.idUsuarioProfesional],
            codigoTipo: [this.consulta?.codigoTipo],
            fecha: [
                this.datepipe.transform(
                    this.consulta?.fecha ?? new Date(),
                    'dd/MM/yyyy HH:mm'
                ) ?? '',
            ],

            idConsultaMedicaDato: [null],
            motivo: [null],
            sintomas: [null],
            peso: [null],
            talla: [null],
            presionArterial: [null],
            pulso: [null],
            temperatura: [null],
            inspeccionGeneral: [null],
            diagnostico: [null],
            respiracion: [null],

        });

        // cargar datos cliente
        this.clienteService.getById(this.consulta?.idCliente!).subscribe({
            next: (res) => {
                this.cliente = res.content;
                this.itemForm.patchValue({ idCliente: this.cliente?.id});
                this.itemForm.updateValueAndValidity();
            },
            error: (err) => {},
        });

        // cargar datos adicionales
        if (this.consulta?.id) {
            this.consultaMedicaService.getDatosById(this.consulta?.id!).subscribe({
                next: (res) => {
                    this.datos = res.content;
                    this.itemForm.patchValue({ idConsultaMedicaDato: this.datos!.id });
                    this.itemForm.patchValue({ motivo: this.datos!.motivo });
                    this.itemForm.patchValue({ peso: this.datos!.peso });
                    this.itemForm.patchValue({ sintomas: this.datos!.sintomas ? this.datos!.sintomas.split(",") : null });
                    this.itemForm.patchValue({ talla: this.datos!.talla });
                    this.itemForm.patchValue({ presionArterial: this.datos!.presionArterial });
                    this.itemForm.patchValue({ pulso: this.datos!.pulso });
                    this.itemForm.patchValue({ temperatura: this.datos!.temperatura });
                    this.itemForm.patchValue({ inspeccionGeneral: this.datos!.inspeccionGeneral, });
                    this.itemForm.patchValue({ diagnostico: this.datos!.diagnostico,});
                    this.itemForm.updateValueAndValidity();
                },
                error: (err) => {},
            });
        }
    }

    ngAfterViewInit(): void {
        // setTimeout(() => {
        //     if (this.consulta?.id)
        //         this.elmNombre?.nativeElement.focus();
        //     else
        //         this.elmDocumento?.nativeElement.focus();
        // }, 500);
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.mensajeService.showWarning('Verifique los datos');
                return;
            }

            const sintomas = this.itemForm.controls['sintomas'].value;
            console.log(sintomas);

            const datos: ConsultaMedicaDato = {
                id: this.itemForm.controls['idConsultaMedicaDato'].value,
                idConsultaMedica: this.itemForm.controls['id'].value,
                peso: this.itemForm.controls['peso'].value,
                talla: this.itemForm.controls['talla'].value,
                presionArterial: this.itemForm.controls['presionArterial'].value,
                pulso: this.itemForm.controls['pulso'].value,
                temperatura: this.itemForm.controls['temperatura'].value,
                sintomas: (!sintomas || sintomas.length==0) ? null:sintomas.join(','),
                motivo: this.itemForm.controls['motivo'].value,
                inspeccionGeneral: this.itemForm.controls['inspeccionGeneral'].value,
                diagnostico: this.itemForm.controls['diagnostico'].value
            }

            const registro: ConsultaMedicaRegistro = {
                id: this.itemForm.controls['id'].value,
                correlativo: this.itemForm.controls['correlativo'].value,
                idEmpresa: this.itemForm.controls['idEmpresa'].value,
                idCliente: this.itemForm.controls['idCliente'].value,
                idUsuarioProfesional: this.itemForm.controls['idUsuarioProfesional'].value,
                idCita: this.itemForm.controls['idCita'].value,
                codigoTipo: this.itemForm.controls['codigoTipo'].value,
                datos: datos
            };

            this.submited = true;
            console.log(registro);
            // modificar cliente 0
            if (registro.id > 0) {
                this.consultaMedicaService.edit(registro).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(res.content);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.consultaMedicaService.add(registro).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
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

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    actualizarCliente() {
        this.clienteService
            .getById(this.cliente?.id!)
            .subscribe({
                next: (res) => {
                    const ref = this.dialogService.open(
                        FormularioClienteComponent,
                        {
                            header: 'Actualizar',
                            width: '500px',
                            data: {
                                idEmpresa: this.cita?.idEmpresa,
                                item: res.content,
                            },
                        }
                    );
                    ref.onClose.subscribe((res2) => {
                        if (res2) {
                            //console.log(res2);
                            this.cliente=res2;
                            console.log(this.cliente)
                        }
                    });
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                },
            });
    }
}

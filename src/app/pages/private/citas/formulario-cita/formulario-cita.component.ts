import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/information.service';
import { Cita } from 'src/app/shared/models/cita.model';
import { citasService } from 'src/app/shared/services/citas.service';

@Component({
    selector: 'app-formulario-cita',
    templateUrl: './formulario-cita.component.html',
    styleUrls: ['./formulario-cita.component.scss'],
    providers: [DialogService],
})
export class FormularioCitaComponent implements OnInit {
    item?: Cita;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaEstados: any[] = [];
    listaTipos: any[] = [];
    idEmpresa!:number;

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private mensajeService: MensajeService,
        private citaservice: citasService,
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.item = this.config.data.item;

        this.listaEstados = [
            { codigo: 'RESERVA', nombre: 'RESERVA' },
            { codigo: 'CANCELADO', nombre: 'CANCELADO' },
            { codigo: 'ATENDIDO', nombre: 'ATENDIDO' },
        ];

        this.listaTipos = [
            { codigo: 'CONSULTA', nombre: 'CONSULTA' },
            { codigo: 'RECONSULTA', nombre: 'RECONSULTA' },
        ];

        this.itemForm = this.fb.group({
            id: [this.item?.id],
            estado: [this.item?.estado, Validators.required],
            tipo: [this.item?.tipo, Validators.required],
            titulo: [this.item?.titulo, Validators.required],
            inicio: [this.item?.inicio , Validators.required],
            fin: [this.item?.fin , Validators.required],
            fecha: [this.item?.fecha],
            color: [this.item?.color??'#6466f1'],
            //color: [new FormControl()],

            idCliente: [this.item?.idCliente??1],
            idEmpresa: [this.item?.idEmpresa],
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

            // obtener valores combo
            const cita: Cita = {
                id: this.itemForm.controls['id'].value,
                idEmpresa: this.itemForm.controls['idEmpresa'].value ?? this.idEmpresa,
                idCliente: this.itemForm.controls['idCliente'].value,
                color: this.itemForm.controls['color'].value,
                titulo: this.itemForm.controls['titulo'].value,
                tipo: this.itemForm.controls['tipo'].value,
                estado: this.itemForm.controls['estado'].value,
                fecha: this.itemForm.controls['fecha'].value,
                inicio: this.itemForm.controls['inicio'].value,
                fin: this.itemForm.controls['fin'].value,
            };

            this.submited = true;
            // modificar cita 0
            if (cita.id !=null) {
                this.citaservice.edit(cita).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(cita);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.citaservice.add(cita).subscribe({
                    next: (res) => {
                        cita.id = res.content;
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(cita);
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
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { adm } from 'src/app/shared/constants/adm';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';

@Component({
    selector: 'app-formulario-cliente',
    templateUrl: './formulario-cliente.component.html',
    styleUrls: ['./formulario-cliente.component.scss'],
    providers: [DialogService],
})
export class FormularioClienteComponent implements OnInit {
    @ViewChild('numeroDocumento') elmDocumento?: ElementRef;
    @ViewChild('nombre') elmNombre?: ElementRef;
    item?: Cliente;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaDocumentos: any[] = [];
    idEmpresa!:number;
    esCodigoEspecial? = false;
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private mensajeService: MensajeService,
        private parametricasService: ParametricasService,
        private clienteservice: ClientesService,
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.item = this.config.data.item;

        console.log(this.item);

        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TIPO_DOCUMENTO)
            .subscribe((data) => {
                this.listaDocumentos = data as unknown as Parametrica[];
            });

        const tipoDoc = this.item?.codigoTipoDocumentoIdentidad??adm.TIPO_DOC_CI;
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            codigoCliente: [this.item?.codigoCliente],
            codigoTipoDocumentoIdentidad: [tipoDoc, Validators.required,],
            numeroDocumento: [this.item?.numeroDocumento, [Validators.required]],
            complemento: [{ value: this.item?.complemento, disabled: tipoDoc!=adm.TIPO_DOC_CI }],
            nombres: [this.item?.nombres , Validators.required],
            apellidos: [this.item?.apellidos , Validators.required],
            direccion: [this.item?.direccion],
            codigoGenero: [this.item?.codigoGenero??'M'],
            fechaNacimiento: [this.item?.fechaNacimiento ? new Date(this.item?.fechaNacimiento) : null],
            ocupacion: [this.item?.ocupacion],
            tipoSangre: [this.item?.tipoSangre],
            telefono: [this.item?.telefono],
            email: [this.item?.email, Validators.email],
            idEmpresa: [this.item?.idEmpresa],
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            if (this.item?.id)
                this.elmNombre?.nativeElement.focus();
            else
                this.elmDocumento?.nativeElement.focus();
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

            const numeroDocumento =
                this.itemForm.controls['numeroDocumento'].value;
            const complemento = this.itemForm.controls['complemento'].value
                ? this.itemForm.controls['complemento'].value.trim()
                : '';
            const cliente: Cliente = {
                id: this.itemForm.controls['id'].value,
                idEmpresa: this.itemForm.controls['idEmpresa'].value ??
                    this.idEmpresa,
                codigoCliente: this.getCodigoCliente(
                    numeroDocumento,
                    complemento
                ),
                codigoTipoDocumentoIdentidad: this.itemForm.controls['codigoTipoDocumentoIdentidad']
                    .value,
                numeroDocumento: numeroDocumento,
                complemento: complemento,
                nombres: this.itemForm.controls['nombres'].value.trim(),
                apellidos: this.itemForm.controls['apellidos'].value.trim(),
                codigoGenero: this.itemForm.controls['codigoGenero'].value,
                fechaNacimiento: this.itemForm.controls['fechaNacimiento'].value,
                ocupacion: this.itemForm.controls['ocupacion'].value,
                tipoSangre: this.itemForm.controls['tipoSangre'].value,
                direccion: this.itemForm.controls['direccion'].value,
                telefono: this.itemForm.controls['telefono'].value,
                email: this.itemForm.controls['email'].value,
            };

            this.submited = true;
            console.log(cliente);
            // modificar cliente 0
            if (cliente.id > 0) {
                this.clienteservice.edit(cliente).subscribe({
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
                this.clienteservice.add(cliente).subscribe({
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

    public getCodigoCliente(numeroDocumento: string, complemento: string) {
        if (this.esCodigoEspecial && numeroDocumento=='-') return '0';
        const numeroDocumentoSanitized = numeroDocumento
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        const complementoSanitized = complemento
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        const final =
            numeroDocumentoSanitized +
            (complementoSanitized.length === 0
                ? ''
                : '-' + complementoSanitized);
        return `${final}`;
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    canbioTipoDocumento(event: any) {
        if (!event.value) {
            this.itemForm.controls['complemento'].disable();
            this.itemForm.patchValue({ complemento: '' });
            this.itemForm.updateValueAndValidity();
            return;
        }
        const tipoDocumento = this.listaDocumentos.find(
            (x) => x.codigo == event.value
        )?.codigo;

        if (tipoDocumento=='CI') {
            this.itemForm.controls['complemento'].enable();
        } else {
            this.itemForm.controls['complemento'].disable();
            this.itemForm.patchValue({ complemento: '' });
        }
        this.itemForm.updateValueAndValidity();
    }
}

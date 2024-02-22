import { Component, OnInit } from '@angular/core';
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
import { MensajeService } from 'src/app/shared/helpers/information.service';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { ClientesService } from 'src/app/shared/services/clientes.service';

@Component({
    selector: 'app-formulario-cliente',
    templateUrl: './formulario-cliente.component.html',
    styleUrls: ['./formulario-cliente.component.scss'],
    providers: [DialogService],
})
export class FormularioClienteComponent implements OnInit {
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
        private clienteservice: ClientesService,
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.item = this.config.data.item;

        this.listaDocumentos = [
            { codigo: 'CI', nombre: 'CI' },
            { codigo: 'NIT', nombre: 'NIT' },
            { codigo: 'CEX', nombre: 'CI EXTRANJERO' },
            { codigo: 'PAS', nombre: 'PASAPORTE' },
            { codigo: 'OD', nombre: 'OTRO DOCUMENTO' },

        ];

        this.itemForm = this.fb.group({
            id: [this.item?.id],
            codigoCliente: [this.item?.codigoCliente],
            codigoTipoDocumentoIdentidad: [this.item?.codigoTipoDocumentoIdentidad, Validators.required,],
            numeroDocumento: [this.item?.numeroDocumento, [Validators.required]],
            complemento: [{ value: this.item?.complemento, disabled: this.item?.codigoTipoDocumentoIdentidad!='CI' }],
            nombre: [this.item?.nombre , Validators.required],
            direccion: [this.item?.direccion],
            telefono: [this.item?.telefono],
            email: [this.item?.email, Validators.email],
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
            const codigoTipoDocumento =
                this.itemForm.controls['codigoTipoDocumentoIdentidad'].value;
            const tipoDocumento = this.listaDocumentos.find(
                (x) => x.codigo === codigoTipoDocumento
            )?.descripcion;
            const numeroDocumento =
                this.itemForm.controls['numeroDocumento'].value;
            const complemento = this.itemForm.controls['complemento'].value
                ? this.itemForm.controls['complemento'].value.trim()
                : '';
            const cliente: Cliente = {
                id: this.itemForm.controls['id'].value,
                idEmpresa:
                    this.itemForm.controls['idEmpresa'].value ??
                    this.idEmpresa,
                codigoCliente: this.getCodigoCliente(
                    numeroDocumento,
                    complemento
                ),
                codigoTipoDocumentoIdentidad:
                    this.itemForm.controls['codigoTipoDocumentoIdentidad']
                        .value,
                numeroDocumento: numeroDocumento,
                complemento: complemento,
                nombre: this.itemForm.controls['nombre'].value.trim(),
                direccion: this.itemForm.controls['direccion'].value,
                telefono: this.itemForm.controls['telefono'].value,
                email: this.itemForm.controls['email'].value,
            };

            this.submited = true;
            // modificar cliente 0
            if (cliente.id > 0) {
                this.clienteservice.edit(cliente).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(cliente);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.clienteservice.add(cliente).subscribe({
                    next: (res) => {
                        cliente.id = res.content;
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(cliente);
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

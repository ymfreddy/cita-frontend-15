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
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';


@Component({
    selector: 'app-formulario-empresa',
    templateUrl: './formulario-empresa.component.html',
    styleUrls: ['./formulario-empresa.component.scss'],
    providers: [DialogService],
})
export class FormularioEmpresaComponent implements OnInit {
    item?: Empresa;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private MensajeService: MensajeService,
        private empresaservice: EmpresasService,
    ) {}

    ngOnInit(): void {
        this.item = this.config.data;
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            nit: [
                this.item?.nit,
                Validators.required,
            ],
            nombre: [this.item?.nombre ?? '', Validators.required],
            representanteLegal: [this.item?.representanteLegal],
            email: [this.item?.email],
            //sigla: [{value:this.item?.sigla, disabled: this.item?.id }, [Validators.required]],
            sigla: [this.item?.sigla, Validators.required],
        });
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.MensajeService.showWarning('Verifique los datos');
                return;
            }

            const empresa: Empresa = {
                id: this.itemForm.controls['id'].value,
                nit: this.itemForm.controls['nit'].value,
                nombre: this.itemForm.controls['nombre'].value.trim(),
                representanteLegal: this.itemForm.controls['representanteLegal'].value,
                email: this.itemForm.controls['email'].value,
                sigla: this.itemForm.controls['sigla'].value,
            };
            console.log(empresa);

            this.submited = true;
            if (empresa.id > 0) {
                this.empresaservice.edit(empresa).subscribe({
                    next: (res) => {
                        this.MensajeService.showSuccess(res.message);
                        this.dialogRef.close(empresa);
                    },
                    error: (err) => {
                        this.MensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.empresaservice.add(empresa).subscribe({
                    next: (res) => {
                        empresa.id = res.content;
                        this.MensajeService.showSuccess(res.message);
                        this.dialogRef.close(empresa);
                    },
                    error: (err) => {
                        this.MensajeService.showError(err.error.message);
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

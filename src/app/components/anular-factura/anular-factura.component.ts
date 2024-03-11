import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { Cuenta } from 'src/app/shared/models/cuenta.model';
import { ParametricaSfe } from 'src/app/shared/models/sfe.model';
import { SfeService } from 'src/app/shared/services/sfe.service';

@Component({
    selector: 'app-anular-factura',
    templateUrl: './anular-factura.component.html',
    styleUrls: ['./anular-factura.component.scss'],
})
export class AnularFacturaComponent implements OnInit {
    item?: Cuenta;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaMotivos: ParametricaSfe[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private mensajeService: MensajeService,
        private sfeService: SfeService,
        private helperService :HelperService
    ) {}

    ngOnInit(): void {
        this.sfeService.getMotivoAnulacion().subscribe((data) => {
            this.listaMotivos = data as unknown as ParametricaSfe[];
        });

        // cargar data
        this.item = this.config.data;
        this.itemForm = this.fb.group({
            cuf: [this.item?.cufFactura],
            codigoMotivo: ['', Validators.required],
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
            const anular: any = {
                cuf: this.itemForm.controls['cuf'].value,
                codigoMotivo: this.itemForm.controls['codigoMotivo'].value,
            };
            this.submited = true;
            this.sfeService.anular(anular).subscribe({
                next: (res) => {
                   this.mensajeService.showSuccess(res.message +"\n"+this.helperService.jsonToString(res.content));
                   this.dialogRef.close(anular);
                   this.submited = false;
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message +"\n"+this.helperService.jsonToString(err.error.content));
                    this.submited = false;
                },
            });
        }
    }


    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }
}

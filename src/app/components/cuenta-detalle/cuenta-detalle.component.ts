import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { Cuenta, CuentaDetalle } from 'src/app/shared/models/cuenta.model';
import { CuentasService } from 'src/app/shared/services/cuentas.service';

@Component({
  selector: 'app-cuenta-detalle',
  templateUrl: './cuenta-detalle.component.html',
  styleUrls: ['./cuenta-detalle.component.scss']
})
export class CuentaDetalleComponent implements OnInit {

    item?: Cuenta ;
    detalle : CuentaDetalle[] = [];
    constructor(
        private config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private cuentaService: CuentasService,
        private mensajeService: MensajeService
    ) {}

    ngOnInit(): void {
        this.item = this.config.data.item;
        this.cuentaService.getDetail(this.item?.id!)
        .subscribe({
            next: (res) => {
                this.detalle = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });

    }

}

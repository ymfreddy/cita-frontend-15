import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { BusquedaPago } from 'src/app/shared/models/busquedas.model';
import { Cuenta } from 'src/app/shared/models/cuenta.model';
import { Pago } from 'src/app/shared/models/pago.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { PagosService } from 'src/app/shared/services/pagos.service';

@Component({
  selector: 'app-pagos-detalle',
  templateUrl: './pagos-detalle.component.html',
  styleUrls: ['./pagos-detalle.component.scss']
})
export class PagosDetalleComponent implements OnInit {
    blockedPanel: boolean = false;
    item?: Cuenta ;
    listaPagos : Pago[] = [];
    constructor(
        private config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private pagosService: PagosService,
        private mensajeService: MensajeService,
        private sessionService: SessionService,
        private confirmationService : ConfirmationService
    ) {}

    ngOnInit(): void {
        this.item = this.config.data;
        this.loadData();
    }

    loadData(){
        const busqueda :BusquedaPago ={
            idCuenta: this.item?.id,
            idEmpresa: this.sessionService.getSessionUserData().idEmpresa
        };
        this.pagosService.get(busqueda)
        .subscribe({
            next: (res) => {
                this.listaPagos = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    descargarComprobante(item: any) {
        /*this.blockedPanel = true;
        const fileName = `pago-${item.correlativo}.pdf`;
        this.utilidadesService
            .getReciboPago(item.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, false);
                this.blockedPanel = false;
            });*/
    }

    anularPago(item: any) {
        this.confirmationService.confirm({
            message: 'Esta seguro de anular el pago '+item.correlativo+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.blockedPanel = true;
                this.pagosService.delete(item)
                .subscribe({
                    next: (res) => {
                        this.listaPagos = this.listaPagos.filter(x=> x.id!==item.id);
                        this.loadData();
                        this.mensajeService.showSuccess(res.message);
                        this.blockedPanel = false;
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.blockedPanel = false;
                    },
                });
            },
        });
    }

    cerrar(){
        this.dialogRef.close(this.item);
    }
}

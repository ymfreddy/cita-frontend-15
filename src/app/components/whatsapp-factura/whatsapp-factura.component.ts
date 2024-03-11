import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { BusquedaCliente } from 'src/app/shared/models/busquedas.model';
import { Cuenta } from 'src/app/shared/models/cuenta.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-whatsapp-factura',
  templateUrl: './whatsapp-factura.component.html',
  styleUrls: ['./whatsapp-factura.component.scss']
})
export class WhatsappFacturaComponent implements OnInit {
    item!: Cuenta;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private mensajeService: MensajeService,
        private clienteService: ClientesService,
        private sessionService :SessionService
    ) {}

    ngOnInit(): void {
        // cargar data
        this.item = this.config.data;
        this.itemForm = this.fb.group({
            telefono: [null, Validators.required],
        });

        const criteriosBusqueda: BusquedaCliente = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            codigoCliente: this.item?.codigoCliente,
            resumen: true,
        };
        this.clienteService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.mensajeService.showWarning('No existe el cliente')
                    return;
                }
                if (res.content[0].telefono){
                    this.enviarMensaje(this.item.cliente!, res.content[0].telefono, 'https://agendaprofesional.com/');
                }
                else{
                    this.itemForm.patchValue({ telefono: res.content[0].telefono });
                    this.itemForm.updateValueAndValidity();
                }
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
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
            this.enviarMensaje(this.item.cliente!, this.itemForm.value.telefono, 'https://agendaprofesional.com/');
        }
    }


    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    enviarMensaje(empresa:string, telefono:string, mensaje:string){
        window.open(`${environment.whatsappUrl}${telefono}&text=${empresa} le remite la siguiente factura: `+encodeURIComponent(mensaje), '_blank');
        this.dialogRef.close(this);
    }
}

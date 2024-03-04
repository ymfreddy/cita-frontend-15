import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { PuntoVenta } from 'src/app/shared/models/punto.model';
import { ParametricaSfe } from 'src/app/shared/models/sfe.model';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { PuntosService } from 'src/app/shared/services/puntos.service';
import { SfeService } from 'src/app/shared/services/sfe.service';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';

@Component({
  selector: 'app-formulario-punto',
  templateUrl: './formulario-punto.component.html',
  styleUrls: ['./formulario-punto.component.scss']
})
export class FormularioPuntoComponent implements OnInit {
    item?: PuntoVenta;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;

    listaEmpresas: Empresa[] = [];
    listaSucursales: Sucursal[] = [];
    listaTipos: ParametricaSfe[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private mensajeService: MensajeService,
        private puntosService: PuntosService,
        private empresasService: EmpresasService,
        private sessionService: SessionService,
        private sfeService: SfeService,
        private sucursalesService: SucursalesService
    ) {}

    ngOnInit(): void {
        this.empresasService.get().subscribe({
            next: (res) => {
                this.listaEmpresas = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });

        this.sfeService.getTipoPuntoVenta().subscribe((data) => {
            console.log(data);
            this.listaTipos = data as unknown as ParametricaSfe[];
        });

        this.item = this.config.data;
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            idEmpresa: [this.item?.idEmpresa, Validators.required],
            numeroSucursal: [this.item?.numeroSucursal, Validators.required],
            numeroPunto: [this.item?.numeroPuntoVenta, Validators.required],
            codigoTipoPuntoVenta: [this.item?.codigoTipoPuntoVenta, Validators.required],
            nombre: [this.item?.nombre, Validators.required],
        });

        if (this.item?.id && this.item?.id>0){
            this.cargarSucursales(this.item?.idEmpresa);
        }
    }

    public onSubmit(): void {
        if (this.closeClicked) {
            this.dialogRef.close(null);
        } else {
            if (!this.itemForm.valid) {
                this.mensajeService.showWarning('Verifique los datos');
                return;
            }

            const punto: PuntoVenta = {
                id: this.itemForm.controls['id'].value,
                idEmpresa: this.itemForm.controls['idEmpresa'].value ??
                    this.sessionService.getSessionEmpresaId(),
                    numeroSucursal: this.itemForm.controls['numeroSucursal'].value,
                    numeroPuntoVenta: this.itemForm.controls['numeroPunto'].value,
                    nombre: this.itemForm.controls['nombre'].value,
                    codigoTipoPuntoVenta: this.itemForm.controls['codigoTipoPuntoVenta'].value,
            };
            this.submited = true;
            if (punto.id > 0) {
                this.puntosService.edit(punto).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(punto);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.puntosService.add(punto).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(punto);
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

    cambioEmpresa(event: any) {
        if (!event.value) {
            this.listaSucursales = [];
            return;
        }

        this.cargarSucursales(event.value);
    }

    private cargarSucursales(idEmpresa: number):void{
        this.sucursalesService
            .getByIdEmpresa(idEmpresa)
            .subscribe({
                next: (res) => {
                    this.listaSucursales = res.content;
                    this.itemForm.updateValueAndValidity();
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                },
            });
    }
}

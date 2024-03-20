import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { Servicio } from 'src/app/shared/models/servicio.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Categoria } from 'src/app/shared/models/categoria.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { CategoriasService } from 'src/app/shared/services/categorias.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { adm } from 'src/app/shared/constants/adm';
import { ServiciosService } from 'src/app/shared/services/servicios.service';
import { ActividadSfe, ParametricaSfe, ProductoSfe } from 'src/app/shared/models/sfe.model';
import { SfeService } from 'src/app/shared/services/sfe.service';

@Component({
    selector: 'app-formulario-servicio',
    templateUrl: './formulario-servicio.component.html',
    styleUrls: ['./formulario-servicio.component.scss'],
    providers: [DialogService],
})
export class FormularioServicioComponent implements OnInit {
    item?: Servicio;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    fileImagen: any;
    listaCategorias: Categoria[] = [];

    listaTiposUnidad: ParametricaSfe[] = [];
    listaActividades: ActividadSfe[] = [];

    listaTiposProductoSinSeleccionado: ProductoSfe[] = [];
    listaTiposProductoSin: ProductoSfe[] = [];
    idEmpresa!:number;
    nitEmpresa!:number;

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private fileService: FilesService,
        private mensajeService: MensajeService,
        private servicioservice: ServiciosService,
        private sessionService: SessionService,
        private parametricasService: ParametricasService,
        private categoriasService: CategoriasService,
        private sfeService: SfeService
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.nitEmpresa = this.config.data.nitEmpresa;
        this.item = this.config.data.item;
        // cargar parametricas
        const busqueda = {
            idEmpresa : this.idEmpresa,
            idsCategorias : this.sessionService.isSuperAdmin() ? '': this.sessionService.getSessionUserData().categorias
        }

        this.categoriasService
            .get(busqueda)
            .subscribe({
                next: (res) => {
                    this.listaCategorias = res.content;
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                },
            });

            this.sfeService.getTipoUnidad().subscribe((data) => {
                this.listaTiposUnidad = data as unknown as ParametricaSfe[];
            });


            this.sfeService.getActividades(this.nitEmpresa).subscribe((data) => {
                this.listaActividades = data as unknown as ActividadSfe[];
            });

            this.sfeService.getProductosSin(this.nitEmpresa).subscribe((data) => {
                this.listaTiposProductoSin = data as unknown as ProductoSfe[];
                if (this.item?.id){
                    this.listaTiposProductoSinSeleccionado = this.listaTiposProductoSin.filter(x=>x.codigoActividad==this.item?.codigoActividadSin);
                }
            });

            console.log(this.item);
        // cargar data
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            idCategoria: [this.item?.idCategoria, Validators.required],
            codigoProducto: [this.item?.codigoProducto, Validators.required],
            codigoActividadSin: [this.item?.codigoActividadSin],
            codigoProductoSin: [this.item?.codigoProductoSin],
            codigoTipoUnidadSin: [this.item?.codigoTipoUnidadSin],
            nombre: [this.item?.nombre, Validators.required],
            descripcion: [this.item?.descripcion],
            idEmpresa: [this.item?.idEmpresa],
            precio: [this.item?.precio ?? 0, Validators.required],
            tiempo: [this.item?.tiempo ?? 60, Validators.required],
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

            if (this.itemForm.controls['precio'].value===0) {
                this.mensajeService.showWarning('El precio del servicio debe ser mayor a 0');
                return;
            }

            const idCategoria = this.itemForm.controls['idCategoria'].value;
            // obtener valores combo
            const categoria = this.listaCategorias.find(
                (x) => x.id === idCategoria
            )?.nombre;

            const servicio: Servicio = {
                id: this.itemForm.controls['id'].value,
                idEmpresa:
                    this.itemForm.controls['idEmpresa'].value ??
                    this.idEmpresa,
                idCategoria: this.itemForm.controls['idCategoria'].value,
                codigoProducto:
                    this.itemForm.controls['codigoProducto'].value.trim(),
                codigoActividadSin:
                    this.itemForm.controls['codigoActividadSin'].value,
                codigoProductoSin:
                    this.itemForm.controls['codigoProductoSin'].value,
                codigoTipoUnidadSin:
                    this.itemForm.controls['codigoTipoUnidadSin'].value,
                nombre: this.itemForm.controls['nombre'].value.trim(),
                descripcion: this.itemForm.controls['descripcion'].value,
                tiempo: this.itemForm.controls['tiempo'].value,
                precio: this.itemForm.controls['precio'].value,
                categoria: categoria ?? '',
            };

            this.submited = true;
            if (servicio.id > 0) {
                this.servicioservice.edit(servicio).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(servicio);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.servicioservice.add(servicio).subscribe({
                    next: (res) => {
                        servicio.id = res.content;
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(servicio);
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

    cargarImagen(event: any, fileUpload: any) {
        this.fileImagen = event.files[0];
        const formData = new FormData();
        formData.append('file', this.fileImagen);
        this.fileService.uploadImage(formData).subscribe({
            next: (resp) => {
                if (resp.success) {
                    this.itemForm.controls['imagenNombre'].setValue(
                        resp.content.fileName
                    );
                    this.itemForm.controls['imagenRuta'].setValue(
                        resp.content.fileDownloadUri
                    );
                }
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
        fileUpload.clear();
    }

    cambioActividad(event: any) {
        if (!event.value) {
            this.listaTiposProductoSinSeleccionado = [];
            return;
        }

        this.listaTiposProductoSinSeleccionado = this.listaTiposProductoSin.filter((x) => x.codigoActividad == event.value);
        this.itemForm.updateValueAndValidity();
    }
}

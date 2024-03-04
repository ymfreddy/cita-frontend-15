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
import { ServiciosService } from 'src/app/shared/services/productos.service';

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
        private categoriasService: CategoriasService
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

            console.log(this.item);
        // cargar data
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            codigoTipoServicio: [this.item?.codigoTipoServicio??adm.TIPO_SERVICIO_SERVICIO, Validators.required],
            idCategoria: [this.item?.idCategoria, Validators.required],
            codigoServicio: [this.item?.codigoServicio, Validators.required],
            codigoActividadSin: [this.item?.codigoActividadSin],
            codigoServicioSin: [this.item?.codigoServicioSin],
            codigoTipoUnidadSin: [this.item?.codigoTipoUnidadSin],
            nombre: [this.item?.nombre, Validators.required],
            descripcion: [this.item?.descripcion],
            imagenNombre: [this.item?.imagenNombre],
            imagenRuta: [this.item?.imagenRuta],
            idEmpresa: [this.item?.idEmpresa],
            precio: [this.item?.precio ?? 0],
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
                codigoTipoServicio: this.itemForm.controls['codigoTipoServicio'].value,
                idCategoria: this.itemForm.controls['idCategoria'].value,
                codigoServicio:
                    this.itemForm.controls['codigoServicio'].value.trim(),
                codigoActividadSin:
                    this.itemForm.controls['codigoActividadSin'].value,
                codigoServicioSin:
                    this.itemForm.controls['codigoServicioSin'].value,
                codigoTipoUnidadSin:
                    this.itemForm.controls['codigoTipoUnidadSin'].value,
                nombre: this.itemForm.controls['nombre'].value.trim(),
                descripcion: this.itemForm.controls['descripcion'].value,
                precio: this.itemForm.controls['precio'].value,
                imagenNombre: this.itemForm.controls['imagenNombre'].value,
                imagenRuta: this.itemForm.controls['imagenRuta'].value,
                categoria: categoria ?? '',
                tipoServicio: '',
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
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { SessionService } from 'src/app/shared/security/session.service';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Categoria } from 'src/app/shared/models/categoria.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { CategoriasService } from 'src/app/shared/services/categorias.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { SfeService } from 'src/app/shared/services/sfe.service';
import { ProductosService } from 'src/app/shared/services/productos.service';
import { Producto } from 'src/app/shared/models/producto.model';
import { ActividadSfe, ParametricaSfe, ProductoSfe } from 'src/app/shared/models/sfe.model';
import { adm } from 'src/app/shared/constants/adm';

@Component({
    selector: 'app-formulario-producto',
    templateUrl: './formulario-producto.component.html',
    styleUrls: ['./formulario-producto.component.scss'],
    providers: [DialogService],
})
export class FormularioProductoComponent implements OnInit {
    item?: Producto;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    fileImagen: any;
    listaCategorias: Categoria[] = [];
    listaTiposProducto: Parametrica[] = [];
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
        private productoservice: ProductosService,
        private sessionService: SessionService,
        private sfeService: SfeService,
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

        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TIPO_PRODUCTO)
            .subscribe((data) => {
                this.listaTiposProducto = data as unknown as Parametrica[];
                this.listaTiposProducto = this.listaTiposProducto.filter(x=>x.codigo!==adm.TIPO_PRODUCTO_SERVICIO);
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

        // cargar data
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            codigoTipoProducto: [this.item?.codigoTipoProducto, Validators.required],
            idCategoria: [this.item?.idCategoria, Validators.required],
            codigoProducto: [this.item?.codigoProducto, Validators.required],
            codigoActividadSin: [this.item?.codigoActividadSin],
            codigoProductoSin: [this.item?.codigoProductoSin],
            codigoTipoUnidadSin: [
                this.item?.codigoTipoUnidadSin,
                Validators.required,
            ],
            nombre: [this.item?.nombre, Validators.required],
            descripcion: [this.item?.descripcion],
            imagenNombre: [this.item?.imagenNombre],
            imagenRuta: [this.item?.imagenRuta],
            idEmpresa: [this.item?.idEmpresa],
            precio: {
                value: this.item?.precio ?? 0,
                disabled: this.item?.codigoTipoProducto ==adm.TIPO_PRODUCTO_PRODUCTO_INVENTARIO,
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

            if ((this.itemForm.controls['codigoTipoProducto'].value===adm.TIPO_PRODUCTO_PRODUCTO)
                && this.itemForm.controls['precio'].value===0) {
                this.mensajeService.showWarning('El precio del producto/servicio debe ser mayor a 0');
                return;
            }

            if (this.itemForm.controls['codigoTipoProducto'].value===adm.TIPO_PRODUCTO_PRODUCTO_INVENTARIO && this.itemForm.controls['precio'].value>0) {
                this.mensajeService.showWarning('El precio del producto debe ser 0');
                return;
            }

            const idCategoria = this.itemForm.controls['idCategoria'].value;
            const codigoTipoProducto =
                this.itemForm.controls['codigoTipoProducto'].value;
            const codigoActividadSin =
                this.itemForm.controls['codigoActividadSin'].value;
            const codigoProductoSin =
                this.itemForm.controls['codigoProductoSin'].value;
            const codigoTipoUnidadSin =
                this.itemForm.controls['codigoTipoUnidadSin'].value;

            // obtener valores combo
            const categoria = this.listaCategorias.find(
                (x) => x.id === idCategoria
            )?.nombre;
            const tipoProducto = this.listaTiposProducto.find(
                (x) => x.id === codigoTipoProducto
            )?.nombre;
            const actividad = this.listaActividades.find(
                (x) => x.codigoCaeb === codigoActividadSin
            )?.descripcion;
            const tipoProductoSin = this.listaTiposProductoSin.find(
                (x) => x.codigoProducto === codigoProductoSin
            )?.descripcion;
            const tipoUnidad = this.listaTiposUnidad.find(
                (x) => x.codigo === codigoTipoUnidadSin
            )?.descripcion;

            const producto: Producto = {
                id: this.itemForm.controls['id'].value,
                idEmpresa: this.itemForm.controls['idEmpresa'].value ??
                    this.idEmpresa,
                codigoTipoProducto: this.itemForm.controls['codigoTipoProducto'].value,
                idCategoria: this.itemForm.controls['idCategoria'].value,
                codigoProducto: this.itemForm.controls['codigoProducto'].value.trim(),
                codigoActividadSin: this.itemForm.controls['codigoActividadSin'].value,
                codigoProductoSin: this.itemForm.controls['codigoProductoSin'].value,
                codigoTipoUnidadSin: this.itemForm.controls['codigoTipoUnidadSin'].value,
                nombre: this.itemForm.controls['nombre'].value.trim(),
                descripcion: this.itemForm.controls['descripcion'].value,
                precio: this.itemForm.controls['precio'].value,
                imagenNombre: this.itemForm.controls['imagenNombre'].value,
                imagenRuta: this.itemForm.controls['imagenRuta'].value,
                actividadSin: actividad ?? '',
                categoria: categoria ?? '',
                tipoProducto: tipoProducto ?? '',
                productoSin: tipoProductoSin ?? '',
                tipoUnidadSin: tipoUnidad ?? ''
            };

            this.submited = true;
            if (producto.id > 0) {
                this.productoservice.edit(producto).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(producto);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.productoservice.add(producto).subscribe({
                    next: (res) => {
                        producto.id = res.content;
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(producto);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            }
        }
    }

    canbioTipoProducto(event: any) {
        if (event.value == adm.TIPO_PRODUCTO_PRODUCTO_INVENTARIO) {
            this.itemForm.controls['precio'].disable();
            this.itemForm.patchValue({ costo: 0 });
            this.itemForm.patchValue({ precio: 0 });
        } else {
            this.itemForm.patchValue({ cantidadMinimaAlerta: 0 });
            this.itemForm.controls['precio'].enable();
        }
    }

    public onClose(): void {
        this.closeClicked = true;
    }

    public onSave(): void {
        this.closeClicked = false;
    }

    cambioActividad(event: any) {
        if (!event.value) {
            this.listaTiposProductoSinSeleccionado = [];
            return;
        }

        this.listaTiposProductoSinSeleccionado = this.listaTiposProductoSin.filter((x) => x.codigoActividad == event.value);
        this.itemForm.updateValueAndValidity();
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

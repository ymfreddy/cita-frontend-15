import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/information.service';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { Asociacion } from 'src/app/shared/models/session-usuario.model';

@Component({
    selector: 'app-formulario-usuario',
    templateUrl: './formulario-usuario.component.html',
    styleUrls: ['./formulario-usuario.component.scss'],
    providers: [DialogService],
})
export class FormularioUsuarioComponent implements OnInit {
    item?: Usuario;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaEmpresas: Empresa[] = [];
    listaTiposUsuarios: Parametrica[] = [];
    listaOpcionesAgrupadas: any[] = [];
    listaCategorias: any[]= [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private MensajeService: MensajeService,
        private empresasService: EmpresasService,
        private usuarioservice: UsuariosService,
        private sessionService: SessionService,
        private parametricasService: ParametricasService,
        private helperService:HelperService,
    ) {}

    ngOnInit(): void {
        this.empresasService.get().subscribe({
            next: (res) => {
                this.listaEmpresas = res.content;
            },
            error: (err) => {
                this.MensajeService.showError(err.error.message);
            },
        });

        this.parametricasService
            .getParametricasByTipo(TipoParametrica.TIPO_USUARIO)
            .subscribe((data) => {
                this.listaTiposUsuarios = data as unknown as Parametrica[];
            });

        this.item = this.config.data;

        this.itemForm = this.fb.group({
            id: [this.item?.id],
            idEmpresa: [this.item?.idEmpresa, Validators.required],
            idSucursal: [this.item?.idSucursal],
            codigoTipoUsuario: [this.item?.codigoTipoUsuario, Validators.required],
            nombre: [this.item?.nombre ?? '', Validators.required],
            paterno: [this.item?.paterno],
            materno: [this.item?.materno],
            ci: [this.item?.ci, Validators.required],
            celular: [this.item?.celular, Validators.required],
            username: [this.item?.username, Validators.required],
            password: [''],
            cambiarClave: [this.item?.cambiarClave ?? false],
            enabled: [this.item?.enabled ?? true],
            email: [this.item?.email, Validators.email],
            empresaNit: [this.item?.empresaNit],
            opciones: [null , Validators.required],
            asociaciones: [this.item?.asociaciones ? this.item?.asociaciones.split(",") : null],
            categorias: [this.item?.categorias ? this.item?.categorias.split(",") : null],
        });

        this.usuarioservice.getOptions().subscribe({
            next: (res) => {
                this.listaOpcionesAgrupadas =  this.helperService.getGroupedList( res.content);
                // ver opciones seleccioandas
                if (this.item?.opciones){
                    let opcionesSeleccionadas : any[]=[];
                    this.item?.opciones.split(",").forEach(element => {
                        this.listaOpcionesAgrupadas.forEach(grupo=>{
                            const existe =grupo.items.find((x:any)=>x.id==+element);
                            if (existe){
                                opcionesSeleccionadas.push(existe);
                            }
                        })
                    });

                    this.itemForm.patchValue({ opciones: opcionesSeleccionadas });
                    //this.itemForm.controls['opciones'].setValue(opcionesSeleccionadas);
                    this.itemForm.updateValueAndValidity();
                }
            },
            error: (err) => {
                this.MensajeService.showError(err.error.message);
            },
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

            // obtener valores combo
            const codigoTipoUsuario = this.itemForm.controls['codigoTipoUsuario'].value;
            const tipoUsuario = this.listaTiposUsuarios.find(
                (x) => x.codigo === codigoTipoUsuario
            )?.nombre;

            const opciones = this.itemForm.controls['opciones'].value.map((x: any) => {return x.id });
            const asociaciones = this.itemForm.controls['asociaciones'].value;
            const categorias = this.itemForm.controls['categorias'].value;
            console.log(asociaciones);
            console.log(categorias);
            const usuario: Usuario = {
                id: this.itemForm.controls['id'].value,
                idEmpresa: this.itemForm.controls['idEmpresa'].value,
                idSucursal: this.itemForm.controls['idSucursal'].value,
                codigoTipoUsuario: codigoTipoUsuario,
                tipoUsuario: tipoUsuario ?? '',
                nombre: this.itemForm.controls['nombre'].value.trim(),
                paterno: this.itemForm.controls['paterno'].value,
                materno: this.itemForm.controls['materno'].value,
                nombreCompleto: this.itemForm.controls['nombre'].value.trim(),
                ci: this.itemForm.controls['ci'].value,
                celular: this.itemForm.controls['celular'].value,
                username: this.itemForm.controls['username'].value,
                password: this.itemForm.controls['password'].value,
                cambiarClave: this.itemForm.controls['cambiarClave'].value,
                enabled: this.itemForm.controls['enabled'].value,
                email: this.itemForm.controls['email'].value,
                empresaNit:
                    this.itemForm.controls['empresaNit'].value ??
                    this.sessionService.getSessionUserData().empresaNit,
                empresaNombre: '',
                opciones: opciones.length==0?'':opciones.join(','),
                asociaciones: (!asociaciones || asociaciones.length==0) ?'':asociaciones.join(','),
                categorias: (!categorias || categorias.length==0) ?'':categorias.join(','),
            };
            this.submited = true;
            if (usuario.id > 0) {
                this.usuarioservice.edit(usuario).subscribe({
                    next: (res) => {
                        this.MensajeService.showSuccess(res.message);
                        this.dialogRef.close(usuario);
                        this.submited = false;
                    },
                    error: (err) => {
                        this.MensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.usuarioservice.add(usuario).subscribe({
                    next: (res) => {
                        this.MensajeService.showSuccess(res.message);
                        this.dialogRef.close(usuario);
                        this.submited = false;
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

    cambioEmpresa(event: any) {
        const nit = this.listaEmpresas.find(x=>x.id===event.value)?.nit;
        this.itemForm.patchValue({ asociaciones: null });
        this.itemForm.patchValue({ categorias: null });
    }


}

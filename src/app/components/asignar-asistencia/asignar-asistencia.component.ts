import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { BusquedaUsuario } from 'src/app/shared/models/busquedas.model';
import { Asistencia, Usuario, UsuarioAsignacionAsistencia } from 'src/app/shared/models/usuario.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { AsistenciasService } from 'src/app/shared/services/asistencias.service';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';

@Component({
  selector: 'app-asignar-asistencia',
  templateUrl: './asignar-asistencia.component.html',
  styleUrls: ['./asignar-asistencia.component.scss']
})
export class AsignarAsistenciaComponent  implements OnInit {
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;
    listaUsuario: UsuarioAsignacionAsistencia[] = [];
    listaUsuariosSeleccionados: UsuarioAsignacionAsistencia[] = [];
    listaAsistencia: Asistencia[] = [];

    item?: Usuario;
    idEmpresa!:number;

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private mensajeService: MensajeService,
        private sessionService: SessionService,
        private usuarioService: UsuariosService,
        private asistenciaService:AsistenciasService
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.item = this.config.data.item;
        console.log(this.item);
        const busqueda: BusquedaUsuario ={
            idEmpresa: this.idEmpresa,
        };

        this.usuarioService.get(busqueda).subscribe({
            next: (res) => {
                this.listaUsuario = res.content;
                this.listaUsuario = this.listaUsuario.filter(x=>x.id!==this.item?.id!)
                this.asistenciaService.getByIdUsuarioAsistente(this.item?.id!).subscribe({
                    next: (res) => {
                        this.listaAsistencia = res.content;
                        this.listaUsuario.forEach(element=>{
                            element.idAsistencia=this.listaAsistencia.find(y=>y.idUsuarioAsistente==this.item?.id! && y.idUsuarioProfesional==element.id)?.id;
                        })

                        this.listaUsuariosSeleccionados = this.listaUsuario.filter(x=>x.idAsistencia);
                    },
                    error: (err) => {this.mensajeService.showError(err.error.message);},
                });
            },
            error: (err) => {this.mensajeService.showError(err.error.message);},
        });

    }

    onRowSelect(event:any) {
        console.log(event.data);
        const asistencia: Asistencia={
            idUsuarioAsistente: this.item?.id!,
            idUsuarioProfesional: event.data.id
        }
        this.asistenciaService.add(asistencia).subscribe({
            next: (res) => {
                this.mensajeService.showSuccess(res.message);
                let objIndex = this.listaUsuario.findIndex((obj => obj.id == event.data.id));
                this.listaUsuario[objIndex].idAsistencia = res.content;
            },
            error: (err) => {this.mensajeService.showError(err.error.message);},
        });
    }

    onRowUnselect(event:any) {
        console.log(event.data);
        if (event.data.idAsistencia){
            this.asistenciaService.delete(event.data.idAsistencia).subscribe({
                next: (res) => {
                    this.mensajeService.showSuccess(res.message);
                    let objIndex = this.listaUsuario.findIndex((obj => obj.id == event.data.id));
                    this.listaUsuario[objIndex].idAsistencia = null;
                },
                error: (err) => {this.mensajeService.showError(err.error.message);},
            });
        }

    }

    public onClose(): void {
        this.dialogRef.close(null);
    }
}

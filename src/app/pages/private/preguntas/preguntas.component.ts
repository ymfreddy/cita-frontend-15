import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import {
    Pregunta,
    SolicitudPregunta,
} from 'src/app/shared/models/pregunta.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { PreguntasService } from 'src/app/shared/services/preguntas.service';
import { RecursosService } from 'src/app/shared/services/recursos.service';
import { BusquedaPregunta } from '../../../shared/models/pregunta.model';
import { DatePipe } from '@angular/common';
import { Recurso } from 'src/app/shared/models/recurso.model';

@Component({
    selector: 'app-preguntas',
    templateUrl: './preguntas.component.html',
    styleUrls: ['./preguntas.component.scss'],
})
export class PreguntasComponent implements OnInit {
    itemForm!: FormGroup;
    submited = false;
    listaRecursos: Recurso[] = [];
    listaPreguntas: Pregunta[] = [];

    constructor(
        private fb: FormBuilder,
        private recursosService: RecursosService,
        private preguntasService: PreguntasService,
        private mensajeService: MensajeService,
        private sessionService: SessionService,
        private datepipe: DatePipe
    ) {}

    ngOnInit(): void {
        this.itemForm = this.fb.group({
            idRecurso: [null, Validators.required],
            pregunta: [null, Validators.required],
        });

        this.cargarRecursos();
        this.loadData();
    }

    cargarRecursos(){
        this.recursosService.listar().subscribe({
            next: (res) => {
                this.listaRecursos = res.content;
                this.itemForm.patchValue({ idRecurso: this.listaRecursos[0].id});
                this.itemForm.updateValueAndValidity();
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    loadData(): void {
        const hoy = new Date();
        const busqueda: BusquedaPregunta = {
            username: this.sessionService.getSessionUserData().username,
            fechaInicio: this.datepipe.transform(hoy, 'dd/MM/yyyy')!,
            fechaFin: this.datepipe.transform(hoy, 'dd/MM/yyyy')!,
        };
        this.preguntasService.get(busqueda).subscribe({
            next: (res) => {
                this.listaPreguntas = res.content.reverse();
                this.scrollToTheLastElementByClassName();
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    scrollToTheLastElementByClassName() {
        setTimeout(() => {
            let elements = document.getElementsByClassName('messages');
            if (elements.length>0){
                let ultimo: any = elements[elements.length - 1];
                let toppos = ultimo.offsetTop;
                document.getElementById('contenedorMensajes')!.scrollTop = toppos;
            }
        }, 50);
    }

    public onSubmit(): void {
        if (!this.itemForm.valid) {
            this.mensajeService.showWarning('Verifique los datos');
            return;
        }

        if (this.itemForm.value.pregunta.trim()=='') {
            this.mensajeService.showWarning('Debe introducir una pregunta');
            return;
        }

        const pregunta: SolicitudPregunta = {
            idRecurso: this.itemForm.value.idRecurso,
            pregunta: this.itemForm.value.pregunta,
        };

        this.submited = true;

        this.preguntasService.preguntar(pregunta).subscribe({
            next: (res) => {
                this.submited = false;
                const respuesta = res.content;
                console.log(respuesta);
                this.listaPreguntas.push(respuesta);
                this.scrollToTheLastElementByClassName();
                // limpiar el input
                this.itemForm.patchValue({ pregunta: ''});
                this.itemForm.updateValueAndValidity();

            },
            error: (err) => {
                this.submited = false;
                this.mensajeService.showError(err.error.message);
            },
        });
    }
}

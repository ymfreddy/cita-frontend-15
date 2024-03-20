import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    CalendarOptions,
    DateSelectArg,
    EventApi,
    EventChangeArg,
    EventClickArg,
    EventInput,
} from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { BusquedaCita } from 'src/app/shared/models/busquedas.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { CitasService } from 'src/app/shared/services/citas.service';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { Cita } from 'src/app/shared/models/cita.model';
import { DatePipe } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { FormularioCitaComponent } from '../formulario-cita/formulario-cita.component';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { Asistencia } from 'src/app/shared/models/usuario.model';
import { AsistenciasService } from 'src/app/shared/services/asistencias.service';
import { adm } from 'src/app/shared/constants/adm';

@Component({
    selector: 'app-reservas',
    templateUrl: './reservas.component.html',
    styleUrls: ['./reservas.component.scss'],
})
export class ReservasComponent implements OnInit {
    listaEmpresas: Empresa[] = [];
    idEmpresa!: number;

    listaProfesionales: Asistencia[] = [];
    usuarioProfesional!: any;

    listaCitas: EventInput[] = [];
    today = this.datepipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    currentEvents: EventApi[] = [];
    calendarVisible = true;
    calendarOptions: CalendarOptions = {
        timeZone: 'America/La_Paz',
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        },
        buttonText: {
            listWeek: 'Lista',
            listMonth: 'Mes',
            today: 'Hoy',
            day: 'Hoy',
            week: 'Semana',
            month: 'Mes',
        },
        initialView: 'timeGridWeek',
        //initialEvents: this.listaCitas, // alternatively, use the `events` setting to fetch from a feed
        //events: this.listaCitas,
        validRange: { start: this.today??'' },
        firstDay: 1,
        hiddenDays: [0],
        weekends: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        //dayCellDidMount: ({ date, el }) => { if (date.getDay() == 5 || date.getDay() == 6) el.style.backgroundColor = 'gainsboro'; },
        //businessHours: true,
        allDaySlot: false,
        slotMinTime: '07:00:00',
        slotMaxTime: '21:00:00',
        contentHeight: 'auto',
        //this worked!
        /*selectConstraint:{
            start: Date.parse('2024-02-27T15:00:00'),
            end: Date.parse('2024-03-10T24:00:00')
        },*/
        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this),
        locales: [{ code: 'es' }], // <==== HERE =====
        dateClick: (arg) => this.handleDateClick(arg),
        /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
        //eventChange : (arg) => this.cambio(arg),
        eventChange: this.handleChangeEvent.bind(this),
    };

    busquedaMemoria?: BusquedaCita;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private sessionService: SessionService,
        private empresasService: EmpresasService,
        private citasService: CitasService,
        private mensajeService: MensajeService,
        public dialogService: DialogService,
        private asistenciaService: AsistenciasService,
        public datepipe: DatePipe,
        private router: Router
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }
        if (this.sessionService.getBusquedaCita() != null) {
            this.busquedaMemoria = this.sessionService.getBusquedaCita();
        }

        this.idEmpresa = this.busquedaMemoria?.idEmpresa ?? this.sessionService.getSessionEmpresaId();
        /*if (this.esSuperAdm()){
            this.empresasService.get().subscribe({
                next: (res) => {
                    this.listaEmpresas = res.content;
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                },
            });
        }*/

        this.asistenciaService.getByIdUsuarioAsistente(this.sessionService.getSessionUserData().id).subscribe({
            next: (res) => {
                this.listaProfesionales = res.content;
            },
            error: (err) => {this.mensajeService.showError(err.error.message);},
        });


    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            if(this.sessionService.getSessionUserData().codigoTipoUsuario===adm.TIPO_USUARIO_PROFESIONAL
               || this.sessionService.getSessionUserData().codigoTipoUsuario===adm.TIPO_USUARIO_ADMIN
               || this.sessionService.getSessionUserData().codigoTipoUsuario===adm.TIPO_USUARIO_SUPERADMIN){
                this.cargarEventos(this.sessionService.getSessionUserData().id);
            }
            else if (this.sessionService.getSessionUserData().codigoTipoUsuario===adm.TIPO_USUARIO_PROFESIONAL && this.busquedaMemoria) {
                this.cargarEventos(this.busquedaMemoria.idUsuarioProfesional!);
                let objIndex = this.listaProfesionales.findIndex((obj => obj.idUsuarioProfesional == this.busquedaMemoria!.idUsuarioProfesional));
                this.usuarioProfesional = this.listaProfesionales[objIndex];            }
        }, 500);
    }

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
    }

    cambioEmpresa(event: any) {
        if (!event.value) {
            this.listaCitas = [];
            return;
        }
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.idEmpresa = empresaAux.id;
    }

    handleChangeEvent(changeInfo: EventChangeArg) {
        console.log(changeInfo);
        const cita: Cita = {
            id: +changeInfo.event.id,
            inicio: changeInfo.event.startStr,
            fin: changeInfo.event.endStr,
        };
        this.citasService.editDate(cita).subscribe({
            next: (res) => {},
            error: (err) => {
                this.mensajeService.showError(err.error.message);
                changeInfo.revert();
            },
        });
    }

    cargarEventos(idUsuario: number) {
        const criterios: BusquedaCita = {
            idEmpresa: this.idEmpresa,
            idSucursal: this.sessionService.getSessionUserData().idSucursal,
            idUsuarioProfesional: idUsuario,
            resumen: true,
        };
        this.citasService.get(criterios).subscribe({
            next: (res) => {
                //this.listaCitas = res.content.map();
                const newdata = res.content.map((x: any) => {
                    return {
                        id: x.id,
                        title: x.descripcion,
                        start: x.inicio,
                        end: x.fin,
                        backgroundColor: x.color,
                    };
                });

                this.listaCitas = newdata;
                console.log(this.listaCitas);
                this.calendarOptions.events = this.listaCitas;
                this.sessionService.setBusquedaCita(criterios);
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    cambio(item: any) {
        console.log(item.event);
        console.log(item.event.id);
        console.log(item.event.startStr);
        console.log(item.event.endStr);
        console.log(item.event.start);
        console.log(item.event.end);
    }

    handleCalendarToggle() {
        this.calendarVisible = !this.calendarVisible;
    }

    handleWeekendsToggle() {
        const { calendarOptions } = this;
        calendarOptions.weekends = !calendarOptions.weekends;
    }

    handleDateSelect(selectInfo: DateSelectArg) {
        console.log(this.usuarioProfesional);
        const TipoUsuario=this.sessionService.getSessionUserData().codigoTipoUsuario;
        const item: Cita = {
            idEmpresa: this.idEmpresa,
            idUsuarioProfesional: TipoUsuario===adm.TIPO_USUARIO_ASISTENTE ? this.usuarioProfesional.idUsuarioProfesional: this.sessionService.getSessionUserData().id,
            inicio: selectInfo.startStr,
            fin: selectInfo.endStr,
        };
        const ref = this.dialogService.open(FormularioCitaComponent, {
            header: 'Nuevo',
            width: '90%',
            data: { idEmpresa: this.idEmpresa, item: item },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                console.log(res);
                const calendarApi = selectInfo.view.calendar;
                calendarApi.unselect(); // clear date selection
                calendarApi.addEvent({
                    id: res.id,
                    title: res.descripcion,
                    start: res.inicio,
                    end: res.fin,
                    backgroundColor: res.color,
                    allDay: false,
                });
            }
        });
    }

    handleEventClick(clickInfo: EventClickArg) {
        this.citasService.getById(+clickInfo.event.id).subscribe({
            next: (res) => {
                const item: Cita = res.content;
                const ref = this.dialogService.open(FormularioCitaComponent, {
                    header: 'Editar',
                    width: '90%',
                    data: { idEmpresa: this.idEmpresa, item: item },
                });
                ref.onClose.subscribe((res) => {
                    if (res) {
                        console.log(res);
                        // se elimina
                        clickInfo.event.remove();
                        //se añade el actualziado
                        const calendarApi = clickInfo.view.calendar;
                        calendarApi.unselect(); // clear date selection
                        calendarApi.addEvent({
                            id: res.id,
                            title: res.descripcion,
                            start: res.inicio,
                            end: res.fin,
                            backgroundColor: res.color,
                            allDay: false,
                        });
                    }
                });
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    handleEvents(events: EventApi[]) {
        this.currentEvents = events;
        this.changeDetector.detectChanges();
    }

    handleDateClick(arg: any) {
        console.log(arg);
    }

    listboxChange(event:any) {
        console.log(event.value);
        this.cargarEventos(event.value.idUsuarioProfesional);
    }
}

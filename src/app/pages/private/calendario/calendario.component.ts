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
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { Asistencia } from 'src/app/shared/models/usuario.model';
import { AsistenciasService } from 'src/app/shared/services/asistencias.service';
import { adm } from 'src/app/shared/constants/adm';
import { FormularioCitaComponent } from '../citas/formulario-cita/formulario-cita.component';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { FormularioPagoCuentaComponent } from '../cuentas/formulario-pago-cuenta/formulario-pago-cuenta.component';


@Component({
    selector: 'app-calendario',
    templateUrl: './calendario.component.html',
    styleUrls: ['./calendario.component.scss'],
})
export class CalendarioComponent implements OnInit {
    date!: Date[];
    listaEmpresas: Empresa[] = [];
    idEmpresa!: number;

    listaProfesionales: Asistencia[] = [];
    usuarioProfesional!: any;

    listaCitas: EventInput[] = [];
    citaSeleccionada!:EventClickArg;

    today = this.datepipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    currentEvents: EventApi[] = [];
    verDetalleCita = false;
    calendarVisible = true;
    calendarOptions: CalendarOptions = {
        timeZone: 'America/La_Paz',
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            // right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            right: 'timeGridWeek,timeGridDay,listWeek',
        },
        buttonText: {
            listWeek: 'Lista',
            // listMonth: 'Mes',
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
        eventDidMount: (info) => { if (info.event.extendedProps['pagado']) {info.el.style.backgroundColor = 'gainsboro'; info.el.style.borderLeft = '12px solid rgb(30, 148, 105)'; }},
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
        private dialogService: DialogService,
        private asistenciaService: AsistenciasService,
        private confirmationService : ConfirmationService,
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
        this.confirmationService.confirm({
            message: 'Estás seguro que deseas modificar la reserva?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
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
            },
            reject:() =>{
                changeInfo.revert();
            }
        });


    }

    cargarEventos(idUsuario: number) {
        const criterios: BusquedaCita = {
            idEmpresa: this.idEmpresa,
            idSucursal: this.sessionService.getSessionUserData().idSucursal,
            idUsuarioProfesional: idUsuario,
            codigosEstadosCita:  adm.CITA_ESTADO_INASISTENCIA+','+ adm.CITA_ESTADO_CONFIRMADA+','+adm.CITA_ESTADO_RESERVA+','+adm.CITA_ESTADO_EN_ESPERA+','+adm.CITA_ESTADO_INICIADA,
            //resumen: true,
        };
        this.citasService.get(criterios).subscribe({
            next: (res) => {
                console.log(res.content);
                //this.listaCitas = res.content.map();
                const newdata = res.content.map((x: any) => {
                    return {
                        id: x.id,
                        title: x.descripcion,
                        start: x.inicio,
                        end: x.fin,
                        backgroundColor: x.color,
                        editable:!x.pagado,
                        extendedProps: {
                            pagado :x.pagado,
                            correlativo: x.correlativo,
                            telefonoCliente: x.telefonoCliente,
                            emailCliente: x.emailCliente,
                            generoCliente: x.generoCliente,
                            edadCliente: x.edadCliente,
                            nota: x.nota,
                            codigoEstadoCita: x.codigoEstadoCita,
                            estadoCita: x.estadoCita
                        }
                    };
                });

                this.listaCitas = newdata;

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
                const calendarApi = selectInfo.view.calendar;
                calendarApi.unselect(); // clear date selection
                console.log(res);
                const citas:Cita[] =res;
                citas.forEach(cita => {
                    const evento = {
                        id: cita.id?.toString(),
                        title: cita.descripcion,
                        start: cita.inicio,
                        end: cita.fin,
                        backgroundColor: cita.color,
                        allDay: false,
                        editable:!cita.pagado,
                        extendedProps: {
                            pagado :cita.pagado,
                            correlativo: cita.correlativo,
                            telefonoCliente: cita.telefonoCliente,
                            emailCliente: cita.emailCliente,
                            generoCliente: cita.generoCliente,
                            edadCliente: cita.edadCliente,
                            nota: cita.nota,
                            codigoEstadoCita: cita.codigoEstadoCita,
                            estadoCita: cita.estadoCita
                        },
                    }

                    this.listaCitas.push(evento);
                    calendarApi.addEvent(evento);
                });
            }
        });
    }

    handleEventClick(clickInfo: EventClickArg) {
        console.log(clickInfo.event.id);
        console.log(this.listaCitas);
        const seleccionado = this.listaCitas.find(x=>x.id==clickInfo.event.id);
        console.log(seleccionado);
        if (seleccionado){
            this.citaSeleccionada = clickInfo;
            this.verDetalleCita=true;
        }
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

    editarCita(){
        this.citasService.getById(+this.citaSeleccionada.event.id).subscribe({
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
                        this.actualizarCita(this.citaSeleccionada, res);
                    }
                });
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    pagarCita(){
        const ref = this.dialogService.open(FormularioPagoCuentaComponent, {
            header: 'Pagar',
            width: '95%',
            draggable: true,
            maximizable: true,
            data: { idCita: +this.citaSeleccionada.event.id },
        });
        ref.onClose.subscribe((res2) => {
            if (res2){
                console.log(res2);
                this.citasService.getById(+this.citaSeleccionada.event.id).subscribe({
                    next: (res) => {
                        console.log(res);
                        this.actualizarCita(this.citaSeleccionada, res.content);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                    },
                });
            }
        });
    }

    actualizarCita(clickInfo: EventClickArg, cita:Cita) {
        clickInfo.event.remove();
        //se añade el actualziado
        const calendarApi = clickInfo.view.calendar;
        calendarApi.unselect(); // clear date selection
        calendarApi.addEvent({
                            id: cita.id!.toString(),
                            title: cita.descripcion,
                            start: cita.inicio,
                            end: cita.fin,
                            backgroundColor: cita.color,
                            allDay: false,
                            editable:!cita.pagado,
                            extendedProps: {
                                pagado :cita.pagado,
                                correlativo: cita.correlativo,
                                telefonoCliente: cita.telefonoCliente,
                                emailCliente: cita.emailCliente,
                                generoCliente: cita.generoCliente,
                                edadCliente: cita.edadCliente,
                                nota: cita.nota,
                                codigoEstadoCita: cita.codigoEstadoCita,
                                estadoCita: cita.estadoCita
                            },
                        });
    }

    nuevaVenta(){
        const ref = this.dialogService.open(FormularioPagoCuentaComponent, {
            header: 'Venta',
            width: '95%',
            draggable: true,
            maximizable: true,
            data: { idEmpresa: this.idEmpresa },
        });
        ref.onClose.subscribe((res) => {

        });
    }
}

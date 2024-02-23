import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventApi, EventChangeArg, EventClickArg, EventInput } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { INITIAL_EVENTS, createEventId } from './event-utils';
import { BusquedaCita } from 'src/app/shared/models/busquedas.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { citasService } from 'src/app/shared/services/citas.service';
import { MensajeService } from 'src/app/shared/helpers/information.service';
import { map } from 'rxjs/operators';
import { Cita } from 'src/app/shared/models/cita.model';
import { HelperService } from '../../../shared/helpers/helper.service';
import { DatePipe } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { FormularioCitaComponent } from '../citas/formulario-cita/formulario-cita.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent implements OnInit {
    // calendarOptions: CalendarOptions = {
    //     initialView: 'dayGridMonth',
    //     plugins: [dayGridPlugin, interactionPlugin],
    //     dateClick: (arg) => this.handleDateClick(arg),
    //     events: [
    //       { title: 'event 1', date: '2024-02-21' },
    //       { title: 'event 2', date: '2024-02-22' }
    //     ]
    //   };

    idEmpresa!:number;
    listaCitas: EventInput[] = [];
    //today = new Date().toISOString().slice(0,10);
    today = this.datepipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    //today = this.helperService.getDateTimeString();

    currentEvents: EventApi[] = [];
    calendarVisible = true;
    calendarOptions: CalendarOptions = {
        timeZone: 'America/La_Paz',
        plugins: [
          interactionPlugin,
          dayGridPlugin,
          timeGridPlugin,
          listPlugin,
        ],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        buttonText: {
            listWeek: 'Lista',
            listMonth: 'Mes',
            today:'Hoy',
            day:'Hoy',
            week:'Semana',
            month:'Mes'
        },
        initialView: 'timeGridWeek',
        //initialEvents: this.listaCitas, // alternatively, use the `events` setting to fetch from a feed
        //events: this.listaCitas,
        validRange: { start: this.today??'' },
        firstDay: 1,
        hiddenDays: [ 0 ],
        weekends: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,

        dayCellDidMount: ({ date, el }) => {
            if (date.getDay() == 5 || date.getDay() == 6 )
              el.style.backgroundColor = 'gainsboro'
          },
        //businessHours: true,
        allDaySlot: false,
        slotMinTime: "07:00:00",
        slotMaxTime: "21:00:00",
        contentHeight: "auto",
        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this),
        locales: [ { code: 'es' }], // <==== HERE =====
        dateClick: (arg) => this.handleDateClick(arg),
        /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
        //eventChange : (arg) => this.cambio(arg),
        eventChange: this.handleChangeEvent.bind(this),
      };

      handleChangeEvent(changeInfo: EventChangeArg){
        console.log(changeInfo);
        const cita: Cita = {
            id:changeInfo.event.id,
            inicio:changeInfo.event.startStr,
            fin:changeInfo.event.endStr,
            fecha:changeInfo.event.start!.toISOString().replace(/T.*$/, '')
        }
        this.citasService.editDate(cita).subscribe({
            next: (res) => {

            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
                changeInfo.revert();
            },
        });
      }

    constructor(
        private changeDetector: ChangeDetectorRef,
        private sessionService: SessionService,
        private citasService:citasService,
        private mensajeService: MensajeService,
        public dialogService: DialogService,
        public datepipe: DatePipe,
        private router: Router) { }

        ngOnInit(): void {
            if (!this.sessionService.verifyUrl(this.router.url)) {
                this.router.navigate(['/auth/access']);
            }

            this.idEmpresa = this.sessionService.getSessionEmpresaId();

            this.cargarEventos();
            console.log(this.today);
        }

    cargarEventos(){
        const busqueda: BusquedaCita ={
            idEmpresa:this.sessionService.getSessionEmpresaId()
        };
        this.citasService.get(busqueda).subscribe({
            next: (res) => {
                //this.listaCitas = res.content.map();
                const newdata = res.content.map((x:any) => {
                    return { id: x.id, title: x.titulo, start:x.inicio, end:x.fin, backgroundColor:x.color};
                  });

                  this.listaCitas = newdata;
                  console.log(this.listaCitas);
                  this.calendarOptions.events = this.listaCitas;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }


    cambio(item: any){
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
        /*const title = prompt('Please enter a new title for your event');
        const calendarApi = selectInfo.view.calendar;

        calendarApi.unselect(); // clear date selection

        if (title) {
          calendarApi.addEvent({
            id: createEventId(),
            title,
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay
          });
        }*/

        const item: Cita = {
            idEmpresa: this.idEmpresa,
            idCliente: 1,
            tipo:'CONSULTA',
            estado: 'RESERVA',
            titulo: 'CITA RESERVADA',
            fecha: selectInfo.start!.toISOString().replace(/T.*$/, ''),
            inicio: selectInfo.startStr,
            fin: selectInfo.endStr,
        }
        const ref = this.dialogService.open(FormularioCitaComponent, {
            header: 'Nuevo',
            width: '80%',
            data: { idEmpresa: this.idEmpresa, item: item },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                console.log(res);
                             const calendarApi = selectInfo.view.calendar;
                calendarApi.unselect(); // clear date selection
             calendarApi.addEvent({
            id: res.id,
            title: res.titulo,
            start: res.inicio,
            end: res.fin,
            backgroundColor: res.color,
            allDay: false
          });



            }
        });
      }

      handleEventClick(clickInfo: EventClickArg) {
        /*if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
          clickInfo.event.remove();
        }*/
        this.mensajeService.showInfo(clickInfo.event.title);
      }

      handleEvents(events: EventApi[]) {
        this.currentEvents = events;
        this.changeDetector.detectChanges();
      }

      handleDateClick(arg : any) {
        console.log(arg);
        //alert('date click! ' + arg.dateStr)
      }
  }


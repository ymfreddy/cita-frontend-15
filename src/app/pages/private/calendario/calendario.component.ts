import { ChangeDetectorRef, Component } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { INITIAL_EVENTS, createEventId } from './event-utils';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent {
    // calendarOptions: CalendarOptions = {
    //     initialView: 'dayGridMonth',
    //     plugins: [dayGridPlugin, interactionPlugin],
    //     dateClick: (arg) => this.handleDateClick(arg),
    //     events: [
    //       { title: 'event 1', date: '2024-02-21' },
    //       { title: 'event 2', date: '2024-02-22' }
    //     ]
    //   };

    today = new Date().toISOString().slice(0,10);
    currentEvents: EventApi[] = [];
    calendarVisible = true;
    calendarOptions: CalendarOptions = {
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
        initialView: 'dayGridMonth',
        initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
        validRange: {
            start: this.today
         },
        weekends: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,

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
        eventChange : (arg) => this.cambio(arg),
      };

      cambio(item: any){
        console.log(item.event);
        console.log(item.event.id);
      }

    handleCalendarToggle() {
        this.calendarVisible = !this.calendarVisible;
      }

      handleWeekendsToggle() {
        const { calendarOptions } = this;
        calendarOptions.weekends = !calendarOptions.weekends;
      }


    constructor(private changeDetector: ChangeDetectorRef) {
    }


      handleDateSelect(selectInfo: DateSelectArg) {
        const title = prompt('Please enter a new title for your event');
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
        }
      }

      handleEventClick(clickInfo: EventClickArg) {
        if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
          clickInfo.event.remove();
        }
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


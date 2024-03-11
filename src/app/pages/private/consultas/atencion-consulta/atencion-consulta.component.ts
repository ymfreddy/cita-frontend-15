import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarOptions, EventApi, EventClickArg, EventInput } from '@fullcalendar/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { BusquedaCita, BusquedaConsultaMedica, BusquedaCuenta } from 'src/app/shared/models/busquedas.model';
import { SessionService } from 'src/app/shared/security/session.service';
import { AsistenciasService } from 'src/app/shared/services/asistencias.service';
import { CitasService } from 'src/app/shared/services/citas.service';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { Cita } from 'src/app/shared/models/cita.model';
import { FormularioConsultaComponent } from '../formulario-consulta/formulario-consulta.component';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { ConsultaMedicaResumen } from 'src/app/shared/models/consulta-medica.model';
import { ConsultasMedicasService } from '../../../../shared/services/consultas-medicas.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { adm } from 'src/app/shared/constants/adm';
import { Cuenta } from 'src/app/shared/models/cuenta.model';
import { FormularioCuentaComponent } from '../../cuentas/formulario-cuenta/formulario-cuenta.component';
import { CuentasService } from 'src/app/shared/services/cuentas.service';
import { PagosDetalleComponent } from 'src/app/components/pagos-detalle/pagos-detalle.component';
import { FormularioPagoComponent } from '../../cuentas/formulario-pago/formulario-pago.component';
import { CuentaDetalleComponent } from 'src/app/components/cuenta-detalle/cuenta-detalle.component';

@Component({
  selector: 'app-atencion-consulta',
  templateUrl: './atencion-consulta.component.html',
  styleUrls: ['./atencion-consulta.component.scss']
})
export class AtencionConsultaComponent {
    citaSeleccionada? : Cita;
    cuentaSeleccionada? : Cuenta;
    listaConsulta: ConsultaMedicaResumen[]=[];
    listaCita: Cita[]=[];
    listaCuenta: Cuenta[]=[];
    itemsMenuCuenta!: MenuItem[];

    submited = false;
    //blockedPanel: boolean = false;
    listaEventos: EventInput[] = [];
    today = this.datepipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    currentEvents: EventApi[] = [];
    calendarOptions: CalendarOptions = {
        timeZone: 'America/La_Paz',
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
        titleFormat: { // will produce something like "Tuesday, September 18, 2018"
            month: 'short',
            year: 'numeric',
            day: 'numeric',
            //weekday: 'short'
        },
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'timeGridDay,listWeek',
        },
        buttonText: {
            listWeek: 'Lista',
            listMonth: 'Mes',
            today: 'Hoy',
            day: 'Hoy',
            week: 'Semana',
            month: 'Mes',
        },
        initialView: 'timeGridDay',
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
        //select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        //eventsSet: this.handleEvents.bind(this),
        locales: [{ code: 'es' }], // <==== HERE =====
        //dateClick: (arg) => this.handleDateClick(arg),
        /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
        //eventChange: this.handleChangeEvent.bind(this),
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
        private router: Router,
        private consultasMedicasService:ConsultasMedicasService,
        private confirmationService: ConfirmationService,
        private cuentasService: CuentasService
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        this.cargarOpcionesCuentas();
        this.cargarEventos();
    }

    cargarOpcionesCuentas(){
        const itemsCuenta : any[]=[];
        itemsCuenta.push({
            label: 'Pagar Saldo',
            icon: 'pi pi-directions-alt',
            command: () => {
                this.opcionPagarSaldo();
            },
        });
        itemsCuenta.push({
            label: 'Ver Pagos Realizados',
            icon: 'pi pi-directions-alt',
            command: () => {
                this.opcionVerPagosRealizados();
            },
        });
        itemsCuenta.push({
            label: 'Devolución Cuenta',
            icon: 'pi pi-directions-alt',
            command: () => {
                this.opcionCuentaDevolucion();
            },
        });
        itemsCuenta.push({
            label: 'Detalle Cuenta',
            icon: 'pi pi-list',
            command: () => {
                this.opcionCuentaDetalle();
            },
        });

        this.itemsMenuCuenta = [
            {
                label: 'Opciones Cuenta',
                items: itemsCuenta,
            },
        ];
    }

    cargarEventos() {
        const criterios: BusquedaCita = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            idUsuarioProfesional: this.sessionService.getSessionUserData().id,
            estadosCita: adm.CITA_ESTADO_RESERVA+','+adm.CITA_ESTADO_PENDIENTE+','+adm.CITA_ESTADO_ATENDIDA,
            resumen: true,
        };
        this.citasService.get(criterios).subscribe({
            next: (res) => {
                this.listaCita = res.content;
                console.log(res.content);
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

                this.listaEventos = newdata;
                console.log(this.listaEventos);
                this.calendarOptions.events = this.listaEventos;
                this.sessionService.setBusquedaCita(criterios);
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    handleEventClick(clickInfo: EventClickArg) {
        let objIndex = this.listaCita.findIndex((obj => obj.id == +clickInfo.event.id));
        const cita = this.listaCita[objIndex];
        if (cita){
            this.cargarCita(cita.id!);
        }
    }

    cargarCita(id:number){
        this.citasService.getById(id).subscribe({
            next: (res) => {
                const item: Cita = res.content;
                console.log(item);
                this.citaSeleccionada = item;
                this.cargarConsultas(this.citaSeleccionada.codigoCliente!);
                this.cargarCuentas(this.citaSeleccionada.codigoCliente!);
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    cargarConsultas(codigoCliente: string){
        const busqueda: BusquedaConsultaMedica = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            idUsuarioProfesional: this.sessionService.getSessionUserData().id,
            codigoCliente: codigoCliente,
            resumen: true,
        }
        console.log(busqueda);
        this.consultasMedicasService.get(busqueda).subscribe({
            next: (res) => {
                console.log(res.content);
                this.listaConsulta = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    nuevaConsulta() {
        if (!this.citaSeleccionada){
            this.mensajeService.showWarning('Debe seleccionar un cita');
            return;
        }

        const consulta:ConsultaMedicaResumen={
            idCliente: this.citaSeleccionada?.idCliente,
            idUsuarioProfesional:this.citaSeleccionada?.idUsuarioProfesional,
            codigoTipo:this.citaSeleccionada?.codigoTipo,
        }

        const ref = this.dialogService.open(FormularioConsultaComponent, {
            header: 'Nuevo',
            width: '90%',
            draggable: true,
            resizable: true,
            maximizable: true,
            data: { consultaMedica: consulta, cita: this.citaSeleccionada },
        });

        ref.onClose.subscribe((res) => {
            if (res) {
                console.log(res)
                this.listaConsulta.unshift(res);
                this.listaConsulta=this.listaConsulta.slice();
                // cambiar estado de cita a atendido
                this.citasService.getById(this.citaSeleccionada?.id!).subscribe({
                    next: (res) => {
                        this.citaSeleccionada = res.content;
                        // actualizar de listado
                        let objIndex = this.listaCita.findIndex((obj => obj.id == this.citaSeleccionada!.id));
                        this.listaCita[objIndex]=this.citaSeleccionada!;
                        // actualizar evento
                        console.log(this.citaSeleccionada);
                        console.log(this.listaEventos);
                        let objIndexEvento =this.listaEventos.findIndex((obj => obj.id == this.citaSeleccionada!.id));
                        console.log(objIndexEvento);
                        this.listaEventos[objIndexEvento].color = this.citaSeleccionada?.color;
                        this.listaEventos[objIndexEvento].backgroundColor = this.citaSeleccionada?.color;
                        console.log(this.listaEventos[objIndexEvento]);
                        this.changeDetector.detectChanges();
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                    },
                });
            }
        });
    }

    editarConsulta(item: ConsultaMedicaResumen) {
        const ref = this.dialogService.open(FormularioConsultaComponent, {
            header: 'Actualizar',
            width: '90%',
            data: { consultaMedica: item, cita: null },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                console.log(res)
                let objIndex = this.listaConsulta.findIndex((obj => obj.id == res.id));
                this.listaConsulta[objIndex]=res;
                this.listaConsulta=this.listaConsulta.slice();
            }
        });
    }

    eliminarConsulta(item:ConsultaMedicaResumen){
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar la consulta '+item.correlativo+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.consultasMedicasService.delete(item.id!).subscribe({
                    next: (res) => {
                        this.listaConsulta = this.listaConsulta.filter((x) => x.id !== item.id);
                        this.mensajeService.showSuccess(res.message);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                    },
                });
            },
        });
    }

    // cuentas
    cargarCuentas(codigoCliente: string): void {
        this.submited = true;
        const criterios: BusquedaCuenta = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            idSucursal: this.sessionService.getSessionUserData().idSucursal,
            codigoCliente : codigoCliente,
            codigosEstadosCuenta: [adm.ESTADO_CUENTA_ACTIVO,adm.ESTADO_CUENTA_REVERTIDA, adm.ESTADO_CUENTA_CREDITO_POR_PAGAR].join(','),
        };

        console.log(criterios);
        this.cuentasService.get(criterios)
            .subscribe({
                next: (res) => {
                    this.sessionService.setBusquedaCuenta(criterios);
                    this.listaCuenta = res.content;
                    console.log(this.listaCuenta);
                    this.submited = false;
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                    this.submited = false;
                },
            });
    }

    newItem() {
        const clienteTemporal = {
            id: this.citaSeleccionada?.idCliente,
            codigoCliente:this.citaSeleccionada?.codigoCliente,
            telefonoCliente: this.citaSeleccionada?.telefonoCliente,
            nombreCompleto: this.citaSeleccionada?.cliente,
        };

        const ref = this.dialogService.open(FormularioCuentaComponent, {
            header: 'Nuevo',
            width: '90%',
            draggable: true,
            resizable: false,
            maximizable: true,
            data: { cuenta: null, cliente: clienteTemporal},
        });

        ref.onClose.subscribe((res) => {
            this.cargarCuentas(this.citaSeleccionada?.codigoCliente!);
            if (res) {
                //this.items.unshift(res);
                //this.items=this.items.slice();
            }
        });
    }

    editItem(item: Cuenta) {
        this.cuentasService.getDetail(item.id).subscribe({
            next: (res) => {
                item.detalle = res.content;
                const ref = this.dialogService.open(FormularioCuentaComponent, {
                    header: 'Actualizar',
                    width: '90%',
                    draggable: true,
                    resizable: false,
                    maximizable: true,
                    data: { cuenta: item},
                });

                ref.onClose.subscribe((res) => {
                    this.cargarCuentas(this.citaSeleccionada?.codigoCliente!);
                    if (res) {
                        console.log(res);
                        //let objIndex = this.items.findIndex((obj => obj.id == res!.id));
                        //this.items[objIndex]=res;
                    }
                });
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    esEditable(codigoEstado: String) {
        return codigoEstado === adm.ESTADO_CUENTA_ACTIVO || codigoEstado===adm.ESTADO_CUENTA_REVERTIDA;
    }

    opcionCuentaDescargar(imprimir:boolean) {
       /* if (this.esEditable(this.cuentaSeleccionada?.codigoEstadoCuenta)) {
            this.mensajeService.showWarning('Cuenta no finalizada');
            return;
        }

        this.submited = true;
        const fileName = `recibo-${this.cuentaSeleccionada?.correlativo}.pdf`;
        this.utilidadesService
            .getReciboCuenta(this.cuentaSeleccionada?.id)
            .pipe(delay(1000))
            .subscribe((blob: Blob): void => {
                this.fileService.printFile(blob, fileName, imprimir);
                this.blockedPanel = false;
            });*/
    }

    deleteItem(item: Cuenta) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar la cuenta ' + item.correlativo + ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.cuentasService.delete(item).subscribe({
                    next: (res) => {
                        this.listaCuenta = this.listaCuenta.filter((x) => x.id !== item.id);
                        this.mensajeService.showSuccess(res.message);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                    },
                });
            },
        });
    }

    opcionesCuenta(menu: any, event: any, item: Cuenta) {
        this.cuentaSeleccionada = item;
        menu.toggle(event);
    }

    opcionPagarSaldo() {
        if (this.cuentaSeleccionada?.codigoEstadoCuenta!=adm.ESTADO_CUENTA_CREDITO_POR_PAGAR){
            this.mensajeService.showWarning('Solo puede realizar el pago de cuentas por pagar');
            return;
        }

        const cuentas:Cuenta[]=[this.cuentaSeleccionada];
        const ref = this.dialogService.open(FormularioPagoComponent, {
            header: 'Cobrar',
            width: '80%',
            data: cuentas,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.cargarCuentas(this.citaSeleccionada?.codigoCliente!);
            }
        });
    }

    opcionVerPagosRealizados() {
        if (this.cuentaSeleccionada?.codigoEstadoCuenta!=adm.ESTADO_CUENTA_CREDITO_POR_PAGAR
            && this.cuentaSeleccionada?.codigoEstadoCuenta!=adm.ESTADO_CUENTA_CREDITO_PAGADO
            ){
            this.mensajeService.showWarning('Solo ver pagos de cuentas a credito');
            return;
        }

        const ref = this.dialogService.open(PagosDetalleComponent, {
            header: 'Pagos Realizados',
            width: '80%',
            data: this.cuentaSeleccionada,
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.cargarCuentas(this.citaSeleccionada?.codigoCliente!);
            }
        });
    }

    opcionCuentaDevolucion() {
        if (this.cuentaSeleccionada?.codigoEstadoCuenta!=adm.ESTADO_CUENTA_COBRADA){
            this.mensajeService.showWarning('Solo puede realizar la devolución de cuentas COBRADAS');
            return;
        }

        this.confirmationService.confirm({
            message: 'Esta seguro de realizar la devolución de la cuenta '+this.cuentaSeleccionada?.correlativo+' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.cuentasService.devolucion(this.cuentaSeleccionada!).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.cargarCuentas(this.citaSeleccionada?.codigoCliente!);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                    },
                });
            },
        });
    }

    opcionCuentaDetalle() {
                const ref = this.dialogService.open(CuentaDetalleComponent, {
                    header: 'Detalle Cuenta N° '+ this.cuentaSeleccionada!.correlativo,
                    width: '80%',
                    data: { item: this.cuentaSeleccionada},
                });
                ref.onClose.subscribe((res) => {
                });
    }

}

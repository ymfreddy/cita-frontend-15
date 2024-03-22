import { AfterContentChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { BusquedaCliente, BusquedaServicio, BusquedaUsuario } from 'src/app/shared/models/busquedas.model';
import { Cita, CitaDetalle, CitaEstado } from 'src/app/shared/models/cita.model';
import { CitasService } from 'src/app/shared/services/citas.service';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { FormularioClienteComponent } from '../../clientes/formulario-cliente/formulario-cliente.component';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { AutoComplete } from 'primeng/autocomplete';
import { adm } from 'src/app/shared/constants/adm';
import { Servicio } from 'src/app/shared/models/servicio.model';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { ServiciosService } from 'src/app/shared/services/servicios.service';
import * as moment from 'moment';
import { UsuarioResumen } from 'src/app/shared/models/usuario.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { ConfirmationService } from 'primeng/api';
moment.locale("es");

@Component({
    selector: 'app-formulario-cita',
    templateUrl: './formulario-cita.component.html',
    styleUrls: ['./formulario-cita.component.scss'],
    providers: [DialogService],
})
export class FormularioCitaComponent implements OnInit, AfterContentChecked   {
    @ViewChild('clienteTemporal') elmC?: AutoComplete;
    @ViewChild('servicio') elmP?: AutoComplete;
    item?: Cita;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;

    listaEstados: CitaEstado[] = [];
    idEmpresa!: number;
    listaClientesFiltrados: Cliente[] = [];
    listaUsuarios: UsuarioResumen[] = [];

    listaServicios: Servicio[] = [];
    listaServiciosFiltrados: Servicio[] = [];
    detalle: CitaDetalle[] = [];
    detalleEliminado: number[] = [];
    // multiplesServicios= false;
    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private mensajeService: MensajeService,
        private citaservice: CitasService,
        private clienteService: ClientesService,
        private dialogService: DialogService,
        private changeDetector: ChangeDetectorRef,
        private helperService: HelperService,
        private sessionService: SessionService,
        private servicioService: ServiciosService,
        private confirmationService:ConfirmationService
    ) {
    }

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.item = this.config.data.item;
        this.listaUsuarios = this.config.data.listaUsuarios;
        this.detalle = this.item?.detalle ?? [];

        this.cargarParametricas();
        this.cargarServicios();

        let temporalCliente: any;
        if (this.item?.id != null) {
            temporalCliente = {
                id: this.item?.idCliente,
                codigoCliente: this.item?.codigoCliente,
                telefono: this.item?.telefonoCliente,
                email: this.item?.emailCliente,
                nombreCompleto: this.item?.cliente,
            };
        }

        console.log(this.item?.inicio.slice(11, 16));
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            servicio: [null],
            correlativo: [this.item?.correlativo],
            clienteTemporal: [temporalCliente, Validators.required],
            idCliente: [this.item?.idCliente],
            codigoCliente: [this.item?.codigoCliente],
            cliente: [this.item?.cliente, Validators.required],
            telefonoCliente: [this.item?.telefonoCliente],
            emailCliente: [this.item?.emailCliente],
            codigoEstadoCita: [
                this.item?.codigoEstadoCita ?? adm.CITA_ESTADO_RESERVA,
                Validators.required,
            ],
            nota: [this.item?.nota],
            inicio: [this.item?.inicio.slice(11, 16), Validators.required],
            fin: [this.item?.fin.slice(11, 16), Validators.required],
            fecha: [moment(this.item?.inicio).format("dddd, D [de] MMMM [de] YYYY")],
            idEmpresa: [this.item?.idEmpresa],
            idSucursal: [this.item?.idSucursal?? this.sessionService.getSessionUserData().idSucursal],
            idUsuarioProfesional: [this.item?.idUsuarioProfesional, Validators.required],
            idProducto: [this.item?.idProducto],
            multiplesServicios: [false]
        });
    }

    cargarServicios(){
        const criteriosBusqueda: BusquedaServicio = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            //idSucursal: this.sessionService.getSessionUserData().idSucursal,
            resumen: true
        };

        this.servicioService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                console.log(res);
                if (res.content.length == 0) {
                    this.listaServicios = [];
                    return;
                }
                this.listaServicios = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    cargarParametricas(){
        this.citaservice.getEstados().subscribe((data) => {
            this.listaEstados = data.content as unknown as CitaEstado[];
            this.listaEstados = this.listaEstados.filter(x=>x.codigo!==adm.CITA_ESTADO_CANCELADA);
            console.log(this.listaEstados);
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

            if (this.detalle.length == 0) {
                this.mensajeService.showWarning('Debe asignar un servicio a la cita');
                return;
            }

            // obtener valores combo
            const cita: Cita = {
                id: this.itemForm.controls['id'].value,
                correlativo: this.itemForm.controls['correlativo'].value,
                idEmpresa:
                    this.itemForm.controls['idEmpresa'].value ?? this.idEmpresa,
                idSucursal:
                    this.itemForm.controls['idSucursal'].value,
                idUsuarioProfesional:
                    this.itemForm.controls['idUsuarioProfesional'].value,
                idProducto:
                    this.itemForm.controls['idProducto'].value,
                clienteTemporal: this.itemForm.controls['clienteTemporal'].value,
                idCliente: this.itemForm.controls['idCliente'].value,
                codigoCliente: this.itemForm.controls['codigoCliente'].value,
                cliente: this.itemForm.controls['cliente'].value,
                emailCliente:
                    this.itemForm.controls['emailCliente'].value,
                telefonoCliente:
                    this.itemForm.controls['telefonoCliente'].value,
                nota: this.itemForm.controls['nota'].value,
                codigoEstadoCita: this.itemForm.controls['codigoEstadoCita'].value,
                inicio:
                    this.item?.inicio.slice(0, 11) +
                    this.itemForm.controls['inicio'].value,
                fin:
                    this.item?.fin.slice(0, 11) +
                    this.itemForm.controls['fin'].value,
                detalle: this.detalle,
                itemsEliminados:
                    this.detalleEliminado.length == 0
                        ? null
                        : this.detalleEliminado,
            };

            console.log(cita);
            if (cita.id != null) {
                this.submited = true;
                this.citaservice.edit(cita).subscribe({
                    next: (res) => {
                        this.mensajeService.showSuccess(res.message);
                        this.dialogRef.close(res.content);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                        this.submited = false;
                    },
                });
            } else {
                this.confirmationService.confirm({
                    message: this.detalle.length == 1 ? 'Esta seguro de crear la reserva?' : 'Esta seguro de crear las '+this.detalle.length+' reservas?',
                    header: 'Confirmación',
                    icon: 'pi pi-exclamation-triangle',
                    accept: () => {
                        this.submited = true;
                        this.citaservice.add(cita).subscribe({
                            next: (res) => {
                                this.mensajeService.showSuccess(res.message);
                                this.dialogRef.close(res.content);
                            },
                            error: (err) => {
                                this.mensajeService.showError(err.error.message);
                                this.submited = false;
                            },
                        });
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

    // cliente
    adicionarNuevoCliente() {
        const ref = this.dialogService.open(FormularioClienteComponent, {
            header: 'Nuevo',
            width: '500px',
            data: { idEmpresa: this.idEmpresa },
        });
        ref.onClose.subscribe((res) => {
            if (res) {
                this.itemForm.patchValue({ clienteTemporal: res });
                this.itemForm.patchValue({ idCliente: res.id });
                this.itemForm.patchValue({ codigoCliente: res.codigoCliente });
                this.itemForm.patchValue({ cliente: res.nombreCompleto });
                this.itemForm.patchValue({ telefonoCliente: res.telefono });
                this.itemForm.patchValue({ emailCliente: res.email });
            }
        });
    }

    actualizarCliente() {
        if (!this.itemForm.controls['clienteTemporal'].value) {
            this.mensajeService.showWarning(
                'Debe seleccionar un cliente para actualizar'
            );
        }

        this.clienteService
            .getById(this.itemForm.controls['clienteTemporal'].value.id)
            .subscribe({
                next: (res) => {
                    const ref = this.dialogService.open(
                        FormularioClienteComponent,
                        {
                            header: 'Actualizar',
                            width: '500px',
                            data: {
                                idEmpresa: this.idEmpresa,
                                item: res.content,
                            },
                        }
                    );
                    ref.onClose.subscribe((res2) => {
                        if (res2) {
                            this.itemForm.patchValue({ clienteTemporal: res2 });
                            this.itemForm.patchValue({ idCliente: res2.id });
                            this.itemForm.patchValue({codigoCliente: res2.codigoCliente,});
                            this.itemForm.patchValue({cliente: res2.nombreCompleto, });
                            this.itemForm.patchValue({telefonoCliente: res2.telefono, });
                            this.itemForm.patchValue({emailCliente: res2.email, });
                        }
                    });
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                },
            });
    }

    filtrarCliente(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarCliente(query);
    }

    buscarCliente(termino: string) {
        const criteriosBusqueda: BusquedaCliente = {
            idEmpresa: this.idEmpresa,
            termino: termino.trim(),
            cantidadRegistros: 10,
            resumen: true,
        };

        this.clienteService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                if (res.content.length == 0) {
                    this.listaClientesFiltrados = [];
                    return;
                }
                this.listaClientesFiltrados = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    seleccionarCliente(event: any) {
        console.log(event);
        this.itemForm.patchValue({ idCliente: event?.id });
        this.itemForm.patchValue({ codigoCliente: event?.codigoCliente });
        this.itemForm.patchValue({ cliente: event?.nombreCompleto });
        this.itemForm.patchValue({ telefonoCliente: event?.telefono });
        this.itemForm.patchValue({ emailCliente: event?.email });
    }

    limpiarCliente() {
        this.itemForm.patchValue({ clienteTemporal: null });
        this.itemForm.patchValue({ idCliente: null });
        this.itemForm.patchValue({ codigoCliente: '' });
        this.itemForm.patchValue({ cliente: '' });
        this.itemForm.patchValue({ telefonoCliente: '' });
        this.itemForm.patchValue({ emailCliente: '' });
        this.elmC?.focusInput();
    }

    // servicio
    keyInput(event: any, keyc: string) {
        this.itemForm.patchValue({ [keyc]: event.value });
    }

    getDetalleTotal(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.total)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES)
        }

        return 0;
    }

    getDetalleDescuento(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.descuento)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES)
        }

        return 0;
    }

    getDetalleSubtotal(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.subtotal)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum,adm.NUMERO_DECIMALES);
        }

        return 0;
    }

    getDetalleTiempo(): number {
        if (this.detalle) {
            const sum = this.detalle
                .map((t) => t.tiempo)
                .reduce((acc, value) => acc + value, 0);
            return this.helperService.round(sum, adm.NUMERO_DECIMALES)
        }

        return 0;
    }

     // servicio
     buscarServicio(termino: string) {
        const criteriosBusqueda: BusquedaServicio = {
            idEmpresa: this.sessionService.getSessionEmpresaId(),
            //idSucursal: this.sessionService.getSessionUserData().idSucursal,
            termino: termino.trim(),
            cantidadRegistros: 20,
            resumen: true
        };

        this.servicioService.get(criteriosBusqueda).subscribe({
            next: (res) => {
                console.log(res);
                if (res.content.length == 0) {
                    this.listaServiciosFiltrados = [];
                    return;
                }
                this.listaServiciosFiltrados = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    addItem(servicio: Servicio) {
        const existeServicio = this.detalle.find(
            (x) => x.codigoProducto === servicio.codigoProducto
        );
        if (existeServicio) {
            this.mensajeService.showWarning(
                'El servicio ya está adicionado'
            );
            return;
        }

        const detalle: CitaDetalle = {
            idProducto: servicio.id,
            codigoProducto: servicio.codigoProducto,
            producto: servicio.nombre,
            cantidad: 1,
            precio: servicio.precio,
            subtotal: servicio.precio,
            descuento: 0,
            total: servicio.precio,
            tiempo: servicio.tiempo,
            id: 0,
            idCita: 0
        };

        this.itemForm.patchValue({ servicio: null });
        this.listaServiciosFiltrados = [];

        this.detalle.push(detalle);
        this.elmP?.focusInput();
    }

    deleteItem(item: any) {
        this.detalle = this.detalle.filter((x) => x.codigoProducto != item.codigoProducto);
        // verificar si tiene id
        if (item.id) {
            this.detalleEliminado.push(item.id);
        }
    }

    calcularFilas() {
        this.detalle.forEach(row => {
        if (!row.precio) {
            row.precio = 0;
        }
        if (!row.cantidad) {
            row.cantidad = 0;
        }
        if (!row.descuento) {
            row.descuento = 0;
        }
        let subtotal = row.precio * row.cantidad;
        subtotal = this.helperService.round(subtotal, adm.NUMERO_DECIMALES);
        row.subtotal = subtotal;

        let descuento = row.descuento;
        descuento = this.helperService.round(descuento, adm.NUMERO_DECIMALES);
        row.descuento = descuento;

        row.total = this.helperService.round((subtotal- descuento), adm.NUMERO_DECIMALES);
      });
    }

    filtrarServicio(event: any) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let query = event.query;
        this.buscarServicio(query);
    }

    seleccionarServicio(event: any) {
        this.addItem(event);
    }

    cambioServicio(event: any) {
        const servicio = this.listaServicios.find((x) => x.id === event.value);
            const detalle: CitaDetalle = {
                idProducto: servicio!.id,
                codigoProducto: servicio!.codigoProducto,
                producto: servicio!.nombre,
                cantidad: 1,
                precio: servicio!.precio,
                subtotal: servicio!.precio,
                descuento: 0,
                total: servicio!.precio,
                tiempo: servicio!.tiempo,
                id: 0
            };

        console.log(servicio);
        if (this.detalle.length==0){
            this.detalle.push(detalle);
        }else{
            console.log(this.detalle);
            this.detalle[0].codigoProducto =  servicio?.codigoProducto!;
            this.detalle[0].idProducto =  servicio?.id!;
            this.detalle[0].producto =  servicio?.nombre!;
            this.detalle[0].precio =  servicio?.precio!;
            this.detalle[0].subtotal =  servicio?.precio!;
            this.detalle[0].total =  servicio?.precio!;
            this.detalle[0].tiempo =  servicio?.tiempo!;
        }
    }

    ngAfterContentChecked(): void {
        this.changeDetector.detectChanges();
    }
}

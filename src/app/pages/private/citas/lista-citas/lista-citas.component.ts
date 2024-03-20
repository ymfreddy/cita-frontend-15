import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { Cita } from 'src/app/shared/models/cita.model';
import { CitasService } from 'src/app/shared/services/citas.service';
import { SessionService } from 'src/app/shared/security/session.service';
import { DialogService } from 'primeng/dynamicdialog';
import { delay, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { Sucursal } from 'src/app/shared/models/sucursal.model';
import { SucursalesService } from 'src/app/shared/services/sucursales.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { adm } from 'src/app/shared/constants/adm';
import { HelperService } from '../../../../shared/helpers/helper.service';
import { FilesService } from 'src/app/shared/helpers/files.service';
import { Usuario } from 'src/app/shared/models/usuario.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { Empresa } from 'src/app/shared/models/empresa.model';
import { EmpresasService } from 'src/app/shared/services/empresas.service';
import { MensajeService } from 'src/app/shared/helpers/mensaje.service';
import { BusquedaCita, BusquedaPago, BusquedaUsuario } from 'src/app/shared/models/busquedas.model';
import { FormularioCitaComponent } from '../formulario-cita/formulario-cita.component';
import { PagosService } from 'src/app/shared/services/pagos.service';
import { SfeService } from '../../../../shared/services/sfe.service';


@Component({
    selector: 'app-lista-citas',
    templateUrl: './lista-citas.component.html',
    styleUrls: ['./lista-citas.component.scss'],
    providers: [DialogService],
})
export class ListaCitasComponent implements OnInit, OnDestroy {
    onDestroy$: Subject<boolean> = new Subject();
    criteriosBusquedaForm!: FormGroup;
    busquedaMemoria?: BusquedaCita;

    items!: Cita[];
    listaEstadosCita: any[] = [];
    listaTiposCita: any[] = [];
    listaSucursales: Sucursal[] = [];
    listaUsuarios: Usuario[] = [];
    itemDialog!: boolean;
    blockedPanel: boolean = false;

    citaSeleccionada!: Cita;
    itemsMenuFactura!: MenuItem[];
    itemsMenuCita!: MenuItem[];

    opciones!: MenuItem[];

    listaEmpresas: Empresa[] = [];
    nitEmpresa!:number;
    idEmpresa!:number;

    constructor(
        private fb: FormBuilder,
        private citasService: CitasService,
        private sessionService: SessionService,
        private mensajeService: MensajeService,
        public dialogService: DialogService,
        private parametricasService: ParametricasService,
        private sucursalesService: SucursalesService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private datepipe: DatePipe,
        private helperService: HelperService,
        private usuarioService: UsuariosService,
        private empresasService: EmpresasService,
        private pagosService:PagosService,
        private fileService:FilesService,
        private sfeService :SfeService
    ) {}

    ngOnInit(): void {
        if (!this.sessionService.verifyUrl(this.router.url)) {
            this.router.navigate(['/auth/access']);
        }

        if (this.sessionService.getBusquedaCita() != null) {
            this.busquedaMemoria = this.sessionService.getBusquedaCita();
        }

        this.idEmpresa = this.busquedaMemoria?.idEmpresa ?? this.sessionService.getSessionEmpresaId();

        // cargar parametricas
        this.cargarEmpresas();
        this.cargarSucursales();
        this.cargarUsuarios();
        this.cargarParametricas();

        // fn cargar usuarios
        let fechaInicio = this.helperService.getDate(this.busquedaMemoria?.fechaInicio);
        let fechaFin = this.helperService.getDate(this.busquedaMemoria?.fechaFin);

        this.criteriosBusquedaForm = this.fb.group({
            idEmpresa: this.idEmpresa,
            nitEmpresa: this.nitEmpresa,
            idSucursal: [{ value: this.busquedaMemoria?.idSucursal??this.sessionService.getSessionUserData().idSucursal, disabled: false}],
            codigosEstadosCita: [this.busquedaMemoria?.codigosEstadosCita ? this.busquedaMemoria?.codigosEstadosCita.split(",") : null],
            codigosTiposCita: [this.busquedaMemoria?.codigosTiposCita ? this.busquedaMemoria?.codigosTiposCita.split(",") : null],
            fechaInicio: [fechaInicio, Validators.required],
            fechaFin: [fechaFin, Validators.required],
        });

        if (this.busquedaMemoria) {
            this.loadData();
        }
    }

    cargarEmpresas(){
        if (this.esSuperAdm()){
            this.empresasService
            .get()
            .subscribe({
                next: (res) => {
                    this.listaEmpresas = res.content;
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                },
            });
        }
    }

    cargarSucursales(){
        this.sucursalesService
        .getByIdEmpresa(this.idEmpresa)
        .subscribe({
            next: (res) => {
                this.listaSucursales = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    cargarUsuarios(){
        const busqueda: BusquedaUsuario = {
            idEmpresa: this.idEmpresa,
            resumen: true,
        };
        this.usuarioService.get(busqueda).subscribe({
            next: (res) => {
                this.listaUsuarios = res.content;
            },
            error: (err) => {
                this.mensajeService.showError(err.error.message);
            },
        });
    }

    cargarParametricas(){
        /*this.parametricasService
        .getParametricasByTipo(TipoParametrica.ESTADO_CITA)
        .subscribe((data) => {
            const parametricas = data.map((x: any) => {return { id: x.id.toString(), nombre: x.nombre }});
            this.listaEstadosCita = parametricas;
        });*/

        this.parametricasService
        .getParametricasByTipo(TipoParametrica.TIPO_CONSULTA)
        .subscribe((data) => {
            const parametricas = data.map((x: any) => {return { id: x.id.toString(), nombre: x.nombre }});
            this.listaTiposCita = parametricas;
        });
    }

    esSuperAdm(){
        return this.sessionService.isSuperAdmin();
    }

    loadData(): void {
        if (!this.criteriosBusquedaForm.valid) {
            this.mensajeService.showWarning('Verifique los datos');
            return;
        }

        // validar rango fecha
        if (
            this.criteriosBusquedaForm.controls['fechaFin'].value.getTime() -
                this.criteriosBusquedaForm.controls[
                    'fechaInicio'
                ].value.getTime() <
            0
        ) {
            this.mensajeService.showWarning(
                'La fecha inicio no debe ser menor a la fecha fin'
            );
            return;
        }

        const dias = Math.round(
            Math.abs(
                (this.criteriosBusquedaForm.controls[
                    'fechaInicio'
                ].value.getTime() -
                    this.criteriosBusquedaForm.controls[
                        'fechaFin'
                    ].value.getTime()) /
                    adm.UN_DIA
            )
        );
        if (dias > 31) {
            this.mensajeService.showWarning(
                'El rango de fechas debe ser menor o igual a 31 días'
            );
            return;
        }

        this.blockedPanel = true;
        const criterios = this.getBusquedaCriterios();

        this.citasService.get(criterios)
            .subscribe({
                next: (res) => {
                    this.sessionService.setBusquedaCita(criterios);
                    this.items = res.content;
                    console.log(this.items);
                    this.blockedPanel = false;
                },
                error: (err) => {
                    this.mensajeService.showError(err.error.message);
                    this.blockedPanel = false;
                },
            });
    }

    getBusquedaCriterios() {
        const fechaInicio = this.criteriosBusquedaForm.controls['fechaInicio']
            .value as Date;
        const fechaFin = this.criteriosBusquedaForm.controls['fechaFin']
            .value as Date;

        const estados = this.criteriosBusquedaForm.controls['codigosEstadosCita'].value;
        const tipos = this.criteriosBusquedaForm.controls['codigosTiposCita'].value;

        const criterios: BusquedaCita = {
            idEmpresa: this.criteriosBusquedaForm.controls['idEmpresa'].value,
            idSucursal: this.criteriosBusquedaForm.controls['idSucursal'].value,
            fechaInicio: this.datepipe.transform(fechaInicio, 'dd/MM/yyyy') ?? '',
            fechaFin: this.datepipe.transform(fechaFin, 'dd/MM/yyyy') ?? '',
            codigosTiposCita:(!tipos || tipos.length==0) ?'':tipos.join(','),
            codigosEstadosCita: (!estados || estados.length==0) ?'':estados.join(',')
        };
        return criterios;
    }

    newItem() {
        const ref = this.dialogService.open(FormularioCitaComponent, {
            header: 'Nuevo',
            width: '90%',
            draggable: true,
            resizable: false,
            maximizable: true,
            data: { cita: null},
        });

        ref.onClose.subscribe((res) => {
            if (res) {
                this.loadData();
                //this.items.unshift(res);
                //this.items=this.items.slice();
            }
        });
    }

    editItem(item: Cita) {
        const ref = this.dialogService.open(FormularioCitaComponent, {
            header: 'Actualizar',
            width: '90%',
            draggable: true,
            resizable: false,
            maximizable: true,
            data: { cita: item},
        });

        ref.onClose.subscribe((res) => {
            if (res) {
                console.log(res);
                //let objIndex = this.items.findIndex((obj => obj.id == res!.id));
                //this.items[objIndex]=res;
                this.loadData();
            }
        });
    }

    esEditable(codigoEstado: String) {
        return true;//codigoEstado === adm.ESTADO_CITA_ACTIVO || codigoEstado===adm.ESTADO_CITA_REVERTIDA;
    }

    deleteItem(item: Cita) {
        this.confirmationService.confirm({
            message: 'Esta seguro de eliminar la cita ' + item.correlativo + ' ?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.citasService.delete(item.id!).subscribe({
                    next: (res) => {
                        this.items = this.items.filter((x) => x.id !== item.id);
                        this.mensajeService.showSuccess(res.message);
                    },
                    error: (err) => {
                        this.mensajeService.showError(err.error.message);
                    },
                });
            },
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    public onSubmit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
        this.dialogService.dialogComponentRefMap.forEach((dialog) => {
            dialog.destroy();
        });
    }

    cambioEmpresa(event: any) {
        const empresaAux = this.listaEmpresas.find(x=>x.id===event.value)!;
        this.nitEmpresa = empresaAux.sfeNit;
        this.idEmpresa = empresaAux.id;
        this.listaSucursales = [];
        this.criteriosBusquedaForm.controls['nitEmpresa'].setValue(empresaAux.sfeNit);
        this.criteriosBusquedaForm.controls['idEmpresa'].setValue(empresaAux.id);
        this.criteriosBusquedaForm.controls['idSucursal'].setValue(null);
        this.criteriosBusquedaForm.controls['usuario'].setValue(null);
        this.cargarSucursales();
        this.cargarUsuarios();
    }

    getSeverity(status: number) {
        switch (status) {
            case 908:
                return 'success';
            case 904:
                return 'warning';
            case 905:
                return 'danger';
            default:
                return '';
        }
    }
}

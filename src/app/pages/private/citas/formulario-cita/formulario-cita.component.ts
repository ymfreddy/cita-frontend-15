import { Component, OnInit, ViewChild } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MensajeService } from 'src/app/shared/helpers/information.service';
import { BusquedaCliente } from 'src/app/shared/models/busquedas.model';
import { Cita, CitaEstado } from 'src/app/shared/models/cita.model';
import { CitasService } from 'src/app/shared/services/citas.service';
import { ClientesService } from 'src/app/shared/services/clientes.service';
import { FormularioClienteComponent } from '../../clientes/formulario-cliente/formulario-cliente.component';
import { Cliente } from 'src/app/shared/models/cliente.model';
import { AutoComplete } from 'primeng/autocomplete';
import { ParametricasService } from 'src/app/shared/services/parametricas.service';
import { TipoParametrica } from 'src/app/shared/enums/tipo-parametrica.model';
import { Parametrica } from 'src/app/shared/models/parametrica.model';
import { adm } from 'src/app/shared/constants/adm';

@Component({
    selector: 'app-formulario-cita',
    templateUrl: './formulario-cita.component.html',
    styleUrls: ['./formulario-cita.component.scss'],
    providers: [DialogService],
})
export class FormularioCitaComponent implements OnInit {
    @ViewChild('cliente') elmC?: AutoComplete;
    item?: Cita;
    itemForm!: FormGroup;
    closeClicked = false;
    submited = false;

    listaEstados: CitaEstado[] = [];
    listaTipos: Parametrica[] = [];
    idEmpresa!:number;
    listaClientesFiltrados: Cliente[] = [];

    constructor(
        private fb: FormBuilder,
        public config: DynamicDialogConfig,
        private dialogRef: DynamicDialogRef,
        private mensajeService: MensajeService,
        private citaservice: CitasService,
        private clienteService:ClientesService,
        private dialogService:DialogService,
        private parametricasService: ParametricasService,
    ) {}

    ngOnInit(): void {
        this.idEmpresa = this.config.data.idEmpresa;
        this.item = this.config.data.item;

        this.parametricasService.getParametricasByTipo(TipoParametrica.TIPO_CITA)
        .subscribe((data) => {
            this.listaTipos = data as unknown as Parametrica[];
        });
        this.citaservice.getEstados()
        .subscribe((data) => {
            this.listaEstados = data.content as unknown as CitaEstado[];
            console.log(this.listaEstados);
        });

        let temporalCliente: any;
        if (this.item?.id != null) {
            temporalCliente = {
                id: this.item?.idCliente,
                codigoCliente: this.item?.codigoCliente,
                telfono: this.item?.telefonoCliente,
                nombre: this.item?.nombreCliente,
            };
        }

        console.log(this.item?.inicio.slice(11,16));
        this.itemForm = this.fb.group({
            id: [this.item?.id],
            correlativo: [this.item?.correlativo],
            cliente: [temporalCliente, Validators.required],
            idCliente: [this.item?.idCliente],
            codigoCliente: [this.item?.codigoCliente],
            nombreCliente: [ this.item?.nombreCliente],
            telefonoCliente: [ this.item?.telefonoCliente],
            codigoEstado: [this.item?.codigoEstado?? adm.CITA_ESTADO_RESERVA, Validators.required],
            codigoTipo: [this.item?.codigoTipo?? adm.CITA_TIPO_CONSULTA, Validators.required],
            nota: [this.item?.nota],
            inicio: [this.item?.inicio.slice(11,16) , Validators.required],
            fin: [this.item?.fin.slice(11,16) , Validators.required],
            //fecha: [this.item?.fecha],
            idEmpresa: [this.item?.idEmpresa],
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


            // obtener valores combo
            const cita: Cita = {
                id: this.itemForm.controls['id'].value,
                correlativo: this.itemForm.controls['correlativo'].value,
                idEmpresa: this.itemForm.controls['idEmpresa'].value ?? this.idEmpresa,
                cliente: this.itemForm.controls['cliente'].value,
                idCliente: this.itemForm.controls['idCliente'].value,
                codigoCliente: this.itemForm.controls['codigoCliente'].value,
                nombreCliente: this.itemForm.controls['nombreCliente'].value,
                telefonoCliente: this.itemForm.controls['telefonoCliente'].value,
                nota: this.itemForm.controls['nota'].value,
                codigoTipo: this.itemForm.controls['codigoTipo'].value,
                codigoEstado: this.itemForm.controls['codigoEstado'].value,
                inicio: this.item?.inicio.slice(0,11)+this.itemForm.controls['inicio'].value,
                fin: this.item?.fin.slice(0,11)+this.itemForm.controls['fin'].value,
            };

            this.submited = true;
            // modificar cita 0
            console.log(cita);
            if (cita.id !=null) {
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
        width: '80%',
        data: { idEmpresa: this.idEmpresa},
    });
    ref.onClose.subscribe((res) => {
        if (res) {
            this.itemForm.patchValue({ cliente: res });
            this.itemForm.patchValue({ idCliente: res.id });
            this.itemForm.patchValue({ codigoCliente: res.codigoCliente });
            this.itemForm.patchValue({ nombreCliente: res.nombre });
            this.itemForm.patchValue({ telefonoCliente: res.telefono });
        }
    });
}

actualizarCliente() {
    if (!this.itemForm.controls['cliente'].value){
        this.mensajeService.showWarning('Debe seleccionar un cliente para actualizar');
    }

    this.clienteService.getById(this.itemForm.controls['cliente'].value.id).subscribe({
        next: (res) => {
            const ref = this.dialogService.open(FormularioClienteComponent, {
                header: 'Actualizar',
                width: '80%',
                data: { idEmpresa: this.idEmpresa, item: res.content },
            });
            ref.onClose.subscribe((res2) => {
                if (res2) {
                    this.itemForm.patchValue({ cliente: res2 });
                    this.itemForm.patchValue({ idCliente: res2.id });
                    this.itemForm.patchValue({ codigoCliente: res2.codigoCliente });
                    this.itemForm.patchValue({ nombreCliente: res2.nombre });
                    this.itemForm.patchValue({ telefonoCliente: res2.telefono });
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
    this.itemForm.patchValue({ idCliente: event?.id });
    this.itemForm.patchValue({ codigoCliente: event?.codigoCliente });
    this.itemForm.patchValue({ nombreCliente: event?.nombre });
    this.itemForm.patchValue({ telefonoCliente: event?.telefono });
}

limpiarCliente() {
    this.itemForm.patchValue({ cliente: null });
    this.itemForm.patchValue({ idCliente: null });
    this.itemForm.patchValue({ codigoCliente: '' });
    this.itemForm.patchValue({ nombreCliente: '' });
    this.itemForm.patchValue({ telefonoCliente: '' });
    this.elmC?.focusInput();
}

}

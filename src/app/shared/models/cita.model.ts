export interface Cita {
  id?: number;
  correlativo?: number;
  idEmpresa?: number;
  idSucursal?: number;
  numeroSucursal?: number;
  clienteTemporal?: any;
  idCliente?: number;
  codigoCliente?: string;
  cliente?: string;
  telefonoCliente?: string;
  emailCliente?: string;

  idUsuarioProfesional?: number;
  profesional?: string;

  idProducto?: number;
  producto?: string;

  descripcion?: string;
  nota?: string;
  fecha?: Date;
  inicio: string;
  fin: string;
  color?: string;
  codigoEstadoCita?: string;
  estadoCita?: string;
  detalle?: CitaDetalle[]
  itemsEliminados?:    number[]|null;

  edadCliente?:number;
  generoCliente?:string;

  pagado?:boolean;
}

export interface CitaDetalle {
    id:       number;
    idCita?:       number;
    idProducto:       number;
    codigoTipoDescuento?: string;
    codigoTipoProducto?: string;
    valorDescuento?:  number;

    codigoProducto: string;
    producto?:      string;
    cantidad:       number;
    precio: number;
    subtotal:       number;
    descuento: number;
    total:       number;
    tiempo: number,
    principal?: boolean;
    pagado?: boolean;
}

export interface CitaEstado {
    codigo: string;
    nombre: string;
    color: string;
}

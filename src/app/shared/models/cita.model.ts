export interface Cita {
  id?: number;
  correlativo?: number;
  idEmpresa?: number;
  clienteTemporal?: any;
  idCliente?: number;
  codigoCliente?: string;
  cliente?: string;
  telefonoCliente?: string;

  idUsuarioProfesional?: number;
  profesional?: string;

  descripcion?: string;
  nota?: string;
  inicio: string;
  fin: string;
  color?: string;
  codigoTipo?: string;
  codigoEstado?: string;
  tipo?: string;
  estado?: string;
  detalle?: CitaDetalle[]
  itemsEliminados?:    number[]|null;

  edadCliente?:number;
  generoCliente?:string;
}

export interface CitaDetalle {
    idServicio:       number;
    codigoServicio: string;
    servicio?:      string;
    cantidad:       number;
    precio: number;
    subtotal:       number;
    descuento: number;
    total:       number;
}

export interface CitaEstado {
    codigo: string;
    nombre: string;
    color: string;
}

export interface Cita {
  id?: string;
  correlativo?: number;
  idEmpresa?: number;
  cliente?: any;
  idCliente?: number;
  codigoCliente?: string;
  nombreCliente?: string;
  telefonoCliente?: string;

  descripcion?: string;
  nota?: string;
  inicio: string;
  fin: string;
  color?: string;
  codigoTipo?: string;
  codigoEstado?: string;
  tipo?: string;
  estado?: string;
}

export interface CitaEstado {
    codigo: string;
    nombre: string;
    color: string;
}

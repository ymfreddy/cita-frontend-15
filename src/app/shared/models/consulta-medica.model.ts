export interface ConsultaMedicaRegistro {
  id: number;
  correlativo?: number;
  idEmpresa?: number;
  idCliente?: number;
  idUsuarioProfesional?: number;
  idCita?: number;
  codigoTipo?: string;
  fecha?: string;
  datos?: ConsultaMedicaDato;
}

export interface ConsultaMedicaResumen {
    id?: number;
    correlativo?: number;
    idEmpresa?: number;

    clienteTemporal?: any;
    idCliente?: number;
    codigoCliente?: string;
    cliente?: string;

    idUsuarioProfesional?: number;
    profesional?: string;

    codigoTipo?: string;
    tipo?: string;

    fecha?: string;
    motivo?: string;
    sintomas?: string;
    diagnostico?: string;
  }


export interface ConsultaMedicaDato {
    id:       number;
    idConsultaMedica:       number;
    motivo: string;
    sintomas:      string;
    peso:       number;
    talla: number;
    presionArterial:       number;
    pulso: number;
    temperatura:       number;
    inspeccionGeneral:      string;
    diagnostico:      string;
}

export interface ConsultaMedicaEstado {
    codigo: string;
    nombre: string;
    color: string;
}

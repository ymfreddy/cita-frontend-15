export interface Usuario {
  id: number;
  idEmpresa: number;
  idSucursal: number;
  codigoTipoUsuario: string;
  tipoUsuario?: string;
  nombres: string;
  apellidos: string;
  nombreCompleto?: string;
  numeroDocumento: string;
  telefono: string;
  username: string;
  password: string;
  email: string;
  cambiarClave: boolean;
  enabled: boolean;
  opciones: string;
  administrados?: string;
  codigoCiudad: string;
  codigoGenero: string;
  empresaNombre?: string;
  empresaSfeNit: number;
}

export interface UsuarioClienteRegistro {
    //nombre: string;
    //paterno: string;
    //ci: number;
    email: string;
    password: string;
  }


  export interface UsuarioAuth {
    id: number;
    name: string;
    username: string;
    email: string;
    password: string;
  }


  export interface SessionUsuario {
    id: number;
    username: string;
    email: string;
    codigoTipoUsuario: string;
    tipoUsuario: string;
    idTurno: number;
    nombreCompleto: string;
    idEmpresa: number;
    idSucursal: number;
    idPuntoVenta: number;
    empresaNombre: string;
    empresaSfeNit: number;
    numeroSucursal?: number;
    numeroPuntoVenta?: number;
    cambiarClave: boolean;
    //asociaciones: Asociacion[];
    categorias: string;
    numeroDocumento: string;
    telefono: string;
    codigoGenero: string;
    codigoCiudad: string;
}

export interface Asociacion {
    id: number;
    codigoAsociacion: string;
    nombreSistema: string;
    ambiente: string;
    codigoDocumentoSector: number;
    modalidad: string;
    documentoSector: string;
    conexionAutomatica: boolean;
}

export interface UsuarioAsignacionAsistencia {
    id: number;
    numeroDocumento: string;
    nombreCompleto?: string;
    idAsistencia?: number|null;
}

export interface Asistencia {
    id?: number;
    idUsuarioAsistente: number;
    idUsuarioProfesional: number;
    profesional?: string;
}

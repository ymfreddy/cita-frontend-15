export interface BusquedaUsuario {
    idEmpresa?: number;
    codigosTiposUsuario?: string;
    username?: string;
    resumen?: boolean;
}

export interface BusquedaPaginada {
    idEmpresa?: number;
    username?: string;
    pagina?: number;
    cantidadItems?: number;
    campoOrden?: string ;
	tipoOrden?: number|1|-1;
    filtro?: string ;
    campoEspecifico?: string ;
}

export interface BusquedaCliente {
    idEmpresa?: number;
    codigoTipoDocumento?: number;
    codigoCliente?: string;
    resumen?: boolean;
    termino?: string;
    cantidadRegistros?: number;
}

export interface BusquedaCita {
    idEmpresa?: number;
    idSucursal?: number;
    idUsuarioProfesional?: number;
    codigoCliente?: string;
    codigosEstadosCita?: string;
    codigosTiposCita?: string;
    fechaInicio?: string;
    fechaFin?: string;

    resumen?: boolean;
    termino?: string;
    cantidadRegistros?: number;
    soloNoPagados?:boolean;

    campoOrden?:string;
    tipoOrden?:number;
}

export interface BusquedaServicio {
    idEmpresa?: number;
    idSucursal?: number;
    codigosTipoServicio?: string;
    idCategoria?: number;
    codigoServicio?: string;
    resumen?: boolean;
    termino?: string;
    cantidadRegistros?: number;
    idsCategorias?: string;
}

export interface BusquedaPaginadaServicio {
    idEmpresa?: number;
    idSucursal?: number;
    idServicio?: number;
    codigosTipoServicio?: string;
    idsCategorias?: string;
    pagina?: number;
    cantidadItems?: number;
    campoOrden?: string ;
	tipoOrden?: number|1|-1;
    filtro?: string ;
    campoEspecifico?: string ;
}


export interface BusquedaCategoria {
    idEmpresa?: number;
    idsCategorias?: string;
}

export interface BusquedaConsultaMedica {
    idEmpresa?: number;
    idUsuarioProfesional?: number;
    codigoCliente?: string;
    resumen?: boolean;
    termino?: string;
    cantidadRegistros?: number;
}

export interface BusquedaPago {
    idEmpresa?: number;
    idSucursal?: number;
    idCliente?: number;
    idCuenta?: number;
    idTurno?: number;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface BusquedaTurno {
    usuario?: string;
    idEmpresa?: number;
    idSucursal?: number;
    idPuntoVenta?: number;
    codigoEstadoTurno?: string;
    fechaInicio: string;
    fechaFin: string;
}


export interface BusquedaCuenta {
    idEmpresa: number;
    nitEmpresa?: number;
    idCuenta?: number;
    idSucursal: number;
    fechaInicio?: string;
    fechaFin?: string;
    codigosTiposCuenta?: string;
    codigosEstadosCuenta?: string;
    usuario?: string;
    codigoCliente?: string;
    correlativo?: string;
    soloCreditos?: boolean;
}

export interface BusquedaCuentaCliente {
    idEmpresa: number;
    usuario: string;
    idSucursal?: number;
    codigosEstadosCuenta: string;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface BusquedaPaginadaProducto {
    idEmpresa?: number;
    idSucursal?: number;
    idProducto?: number;
    codigosTiposProducto?: string;
    idsCategorias?: string;
    pagina?: number;
    cantidadItems?: number;
    campoOrden?: string ;
	tipoOrden?: number|1|-1;
    filtro?: string ;
    campoEspecifico?: string ;
}

export interface BusquedaProducto {
    idEmpresa?: number;
    idSucursal?: number;
    codigoTipoProducto?: string;
    idCategoria?: number;
    codigoProducto?: string;
    resumen?: boolean;
    termino?: string;
    cantidadRegistros?: number;
    idsCategorias?: string;
}

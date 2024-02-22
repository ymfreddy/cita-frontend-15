export interface BusquedaUsuario {
    idEmpresa?: number;
    idTipoUsuario?: number;
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


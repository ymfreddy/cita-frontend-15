export interface BusquedaUsuario {
    idEmpresa?: number;
    idTipoUsuario?: number;
    username?: string;
    resumen?: boolean;
}

export interface BusquedaPaginada {
    username?: string;
    pagina?: number;
    cantidadItems?: number;
    campoOrden?: string ;
	tipoOrden?: number|1|-1;
    filtro?: string ;
    campoEspecifico?: string ;
}

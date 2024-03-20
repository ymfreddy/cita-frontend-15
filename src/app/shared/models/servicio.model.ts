export interface Servicio {
  id: number;
  idCategoria: number;
  idEmpresa: number;
  codigoProducto: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  descuento?: DescuentoServicio;
  codigoActividadSin: string;
  codigoProductoSin: number;
  codigoTipoUnidadSin: number;
  tiempo: number;
}

export interface DescuentoServicio {
	id?: number;
	idDescuento? :number;
	codigoTipoDescuento? : string;
	tipoDescuento? : string;
	descuentoEstablecido? : number;
	descuento: number;
}

export interface ServicioResumen {
    id: number;
    codigoTipoProducto: string;
    codigoProducto: string;
    nombre: string;
    descripcion: string;
    precio: number;
    descuento?: DescuentoServicio;
    tiempo: number;
  }



  export interface SolicitudServicioMasivo {
    nit: number;
    sucursal: number;
    descripcion: string;
    nitProveedor: number;
    lista: any[];
  }

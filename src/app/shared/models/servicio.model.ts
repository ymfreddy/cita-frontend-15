export interface Servicio {
  id: number;
  codigoTipoServicio: string;
  idCategoria: number;
  idEmpresa: number;
  codigoServicio: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenNombre: string;
  imagenRuta: string;
  tipoServicio: string;
  categoria: string;
  descuento?: DescuentoServicio;
  codigoActividadSin: string;
  codigoServicioSin: number;
  codigoTipoUnidadSin: number;
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
    codigoTipoServicio: string;
    codigoServicio: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagenNombre: string;
    imagenRuta: string;
    descuento?: DescuentoServicio;
    codigoServicioStock: string;
    precioIce: number;
  }



  export interface SolicitudServicioMasivo {
    nit: number;
    sucursal: number;
    descripcion: string;
    nitProveedor: number;
    lista: any[];
  }

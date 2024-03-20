export interface ProductoInventario extends Producto {
    idSucursal: number;
    numeroSucursal: number;
    saldoTotal?: number;
}

export interface Producto {
  id: number;
  codigoTipoProducto: string;
  idCategoria: number;
  idEmpresa: number;
  codigoProducto: string;
  codigoActividadSin: string;
  codigoProductoSin: number;
  codigoTipoUnidadSin: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenNombre: string;
  imagenRuta: string;
  tipoProducto: string;
  categoria: string;
  actividadSin: string;
  productoSin: string;
  tipoUnidadSin: string;
  saldos?: SaldoProducto[];
  descuento?: DescuentoProducto;
}

export interface DescuentoProducto {
	id?: number;
	idDescuento? :number;
	codigoTipoDescuento? : string;
	tipoDescuento? : string;
	descuentoEstablecido? : number;
	descuento: number;
}

export interface SaldoProducto {
	idProducto?: number;
	codigoStock? :string;
	precioCompra? : number;
	precioVenta? : number;
	saldo?: number;
}

export interface ProductoResumen {
    id: number;
    codigoTipoProducto: string;
    codigoProducto: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagenNombre: string;
    imagenRuta: string;
    descuento?: DescuentoProducto;
    saldo?: SaldoProducto;
    codigoProductoStock: string;
  }



  export interface SolicitudProductoMasivo {
    nit: number;
    sucursal: number;
    descripcion: string;
    nitProveedor: number;
    lista: any[];
  }

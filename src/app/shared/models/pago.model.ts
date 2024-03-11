export interface Pago {
  id?: number;
  idCuenta: number;
  idTurno: number;
  idCliente: number;
  codigoCliente: string;
  cliente?: string;
  telefonoCliente?: string;
  codigoTipoMoneda: number;
  codigoTipoPago: number;
  numeroTarjeta?: number;
  tipoCambio: number;
  montoPagado: number;
  gift: number;
  descripcion?: string;
}

export interface PagoResumen {
    idTurno: number;
    codigoTipoPago: number;
    tipoPago: string;
    importe: number;
    gift?: number;
  }

  export interface Liquidacion {
    pago: Pago;
    listaIdCuentas: number[];
  }

  export interface FinalizarCuenta {
    idCuenta?: number;
    pago: Pago|null
}

export interface Liquidacion {
    pago: Pago;
    listaIdCuentas: number[];
  }

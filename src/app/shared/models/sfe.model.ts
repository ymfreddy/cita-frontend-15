export interface AsociacionSfe {
    id: number;
    codigoAsociacion: string;
    nombreSistema: string;
    ambiente: string;
    codigoDocumentoSector: number;
    modalidad: string;
    documentoSector: string;
    conexionAutomatica: boolean;
}

export interface ParametricaSfe {
    codigo: number;
    descripcion: string;
  }


  export interface ProductoSfe {
    codigoActividad: string;
    codigoProducto:  number;
    descripcion:     string;
  }

  export interface ActividadSfe {
    codigoCaeb:    string;
    descripcion:   string;
    tipoActividad: string;
  }

  export interface ActividadProductoSin {
      codigoActividadSin:    string;
      actividad:   string;
      codigoProductoSin: string;
      producto: string;
    }


    export interface SolicitudRecepcionFactura {
        idCuenta: number;
        codigoAsociacion: string;
        codigoCliente: string;
        razonSocial: string;
        email: string;
      }

      export interface SolicitudAnulacionFactura {
        cuf: string;
        codigoMotivo: string;
      }

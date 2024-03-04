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

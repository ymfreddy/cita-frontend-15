export interface SolicitudPregunta {
  idRecurso: number;
  pregunta: string;
}

export interface Pregunta {
    id: number;
    fecha: string;
    username: string;
    pregunta: string;
    respuesta: string;
    recursos: string;
}

export interface BusquedaPregunta {
    username: string;
    fechaInicio: string;
    fechaFin: string;
  }


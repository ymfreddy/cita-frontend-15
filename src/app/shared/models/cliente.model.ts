export interface Cliente {
  id: number;
  idEmpresa: number;
  codigoCliente: string;
  codigoTipoDocumentoIdentidad: string;
  numeroDocumento: string;
  complemento?: string;
  codigoGenero: string;
  nombres: string;
  apellidos: string;
  nombreCompleto?: string;
  fechaNacimiento?: string|null;
  ocupacion?: string;
  tipoSangre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  edad?: number;
  razonSocial?: string;
}

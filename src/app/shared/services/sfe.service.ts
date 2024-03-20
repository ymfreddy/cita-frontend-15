import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ActividadSfe, AsociacionSfe, ParametricaSfe, ProductoSfe, SolicitudAnulacionFactura, SolicitudRecepcionFactura } from '../models/sfe.model';
import { adm } from '../constants/adm';
import { HelperService } from '../helpers/helper.service';

@Injectable({
  providedIn: 'root'
})
export class SfeService {
    httpOptions: any;

    constructor(private httpClient: HttpClient, private helperService: HelperService) {
        this.httpOptions = {
            responseType: 'blob' as 'json',
        };
    }

    private getParametricasByTipo(tipo: string): Observable<ParametricaSfe[]> {
      const apiUrl = `${environment.api.adm}/sfe/parametricas/listar-por-tipo/${tipo}`;
      return this.httpClient.get<any>(apiUrl).pipe(
        map(res => {
          return res.content;
        })
      );
    }

    recepcionar(solicitud: SolicitudRecepcionFactura): Observable<any> {
        const apiUrl = `${environment.api.adm}/sfe/facturasElectronicas/procesar`;
        return this.httpClient.post<any>(apiUrl, solicitud);
    }


    anular(solicitud: SolicitudAnulacionFactura): Observable<any> {
        const apiUrl = `${environment.api.adm}/sfe/facturasElectronicas/anular`;
        return this.httpClient.post<any>(apiUrl, solicitud);
    }

    decargar(solicitud: any): Observable<any> {
        const queryString = this.helperService.jsonToQueryString(solicitud);
        const apiUrl = `${environment.sfeApiUtilsUrl}/api/v1/funciones/facturaPdf/descargar?${queryString}`;
        return this.httpClient.get<any>(apiUrl, this.httpOptions);
    }

    getTipoDocumento(): Observable<ParametricaSfe[]> {
      return this.getParametricasByTipo(adm.TIPO_PARAMAETRICA_SFE_TIPO_DOCUMENTO);
    }

    getTipoMetodoPago(): Observable<ParametricaSfe[]> {
      return this.getParametricasByTipo(adm.TIPO_PARAMAETRICA_SFE_TIPO_METODO_PAGO);
    }

    getTipoMoneda(): Observable<ParametricaSfe[]> {
      return this.getParametricasByTipo(adm.TIPO_PARAMAETRICA_SFE_TIPO_MONEDA);
    }

    getTipoUnidad(): Observable<ParametricaSfe[]> {
      return this.getParametricasByTipo(adm.TIPO_PARAMAETRICA_SFE_TIPO_UNIDAD_MEDIDA);
    }

    /*getTipoPais(): Observable<ParametricaSfe[]> {
      return this.getParametricasByTipo(7);
    }*/

    getMotivoAnulacion(): Observable<ParametricaSfe[]> {
      return this.getParametricasByTipo(adm.TIPO_PARAMAETRICA_SFE_TIPO_MOTIVO_ANULACION);
    }

    /*getTipoEmision(): Observable<ParametricaSfe[]> {
      return this.getParametricasByTipo(3);
    }*/

    getTipoPuntoVenta(): Observable<ParametricaSfe[]> {
      return this.getParametricasByTipo(adm.TIPO_PARAMAETRICA_SFE_TIPO_PUNTO_VENTA);
    }

    /*getTipoModalidad(): Observable<ParametricaSfe[]> {
      return this.getParametricasByTipo(2);
    }*/

    getTipoEvento(): Observable<ParametricaSfe[]> {
      return this.getParametricasByTipo(adm.TIPO_PARAMAETRICA_SFE_TIPO_EVENTO);
    }

    /*getTipoHabitacion(): Observable<ParametricaSfe[]> {
      return this.getParametricasByTipo(9);
    }*/

    getAsociaciones(nitEmpresa:number): Observable<AsociacionSfe[]> {
        const apiUrl = `${environment.api.adm}/sfe/asociaciones/${nitEmpresa}`;
        console.log(apiUrl);
        return this.httpClient.get<any>(apiUrl).pipe(
          map(res => {
              console.log(res);
            return res.content;
          })
        );
      }

    getActividades(nitEmpresa:number): Observable<ActividadSfe[]> {
      const apiUrl = `${environment.api.adm}/sfe/parametricas/actividades/${nitEmpresa}`;
      console.log(apiUrl);
      return this.httpClient.get<any>(apiUrl).pipe(
        map(res => {
            console.log(res);
          return res.content;
        })
      );
    }

    getProductosSin(nitEmpresa:number): Observable<ProductoSfe[]> {
      const apiUrl = `${environment.api.adm}/sfe/parametricas/productos/${nitEmpresa}`;
      return this.httpClient.get<any>(apiUrl).pipe(
        map(res => {
            console.log(res);
          return res.content;
        })
      );
    }
}

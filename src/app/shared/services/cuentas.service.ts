import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
//import { FinalizarCuenta } from '../models/finalizar-cuenta.model';
import { Cuenta } from '../models/cuenta.model';
import { FinalizarCuenta } from '../models/pago.model';


@Injectable({
  providedIn: 'root'
})
export class CuentasService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  get(criteriosSearch:any): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/cuentas/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getById(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/cuentas/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getDetail(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/cuentas/listarDetalle/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getDetailByCorrelativo(correlativo:string, idEmpresa:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/cuentas/listarDetallePorCorrelativo/${correlativo}/${idEmpresa}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(cuenta: Cuenta): Observable<any> {
    const apiUrl = `${environment.api.adm}/cuentas`;
    return this.httpClient.post<any>(apiUrl, cuenta);
  }

  finalize(cuenta: FinalizarCuenta): Observable<any> {
    const apiUrl = `${environment.api.adm}/cuentas/finalizar`;
    return this.httpClient.post<any>(apiUrl, cuenta);
  }

  edit(cuenta: Cuenta): Observable<any> {
    const apiUrl = `${environment.api.adm}/cuentas`;
    return this.httpClient.put<any>(apiUrl, cuenta);
  }

  delete(cuenta: Cuenta): Observable<any> {
    const apiUrl = `${environment.api.adm}/cuentas/${cuenta.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }

  devolucion(cuenta: Cuenta): Observable<any> {
    const apiUrl = `${environment.api.adm}/cuentas/devoluciones/${cuenta.id}`;
    return this.httpClient.put<any>(apiUrl, cuenta);
  }

  getDataFacturacion(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/cuentas/datos-facturacion/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { BusquedaPaginadaServicio, BusquedaServicio } from '../models/busquedas.model';
import { Servicio } from '../models/servicio.model';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  getPaged(criteriosSearch:BusquedaPaginadaServicio): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/servicios/listar-paginado?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  get(criteriosSearch:BusquedaServicio): Observable<any> {
    const queryString = this.helperService.jsonToQueryString(criteriosSearch);
    const apiUrl = `${environment.api.adm}/servicios/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(servicio: Servicio): Observable<any> {
    const apiUrl = `${environment.api.adm}/servicios`;
    return this.httpClient.post<any>(apiUrl, servicio);
  }

  edit(servicio: Servicio): Observable<any> {
    const apiUrl = `${environment.api.adm}/servicios`;
    return this.httpClient.put<any>(apiUrl, servicio);
  }

  delete(servicio: Servicio): Observable<any> {
    const apiUrl = `${environment.api.adm}/servicios/${servicio.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }
}

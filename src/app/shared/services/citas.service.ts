import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { BusquedaCita } from '../models/busquedas.model';
import { Cita } from '../models/cita.model';

@Injectable({
  providedIn: 'root'
})
export class citasService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  get(criteriosSearch:BusquedaCita): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    console.log(queryString);
    const apiUrl = `${environment.api.adm}/citas/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getById(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/citas/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(cita: Cita): Observable<any> {
    const apiUrl = `${environment.api.adm}/citas`;
    return this.httpClient.post<any>(apiUrl, cita);
  }

  edit(cita: Cita): Observable<any> {
    const apiUrl = `${environment.api.adm}/citas`;
    return this.httpClient.put<any>(apiUrl, cita);
  }

  editDate(cita: Cita): Observable<any> {
    const apiUrl = `${environment.api.adm}/citas/actualizar-fecha`;
    return this.httpClient.put<any>(apiUrl, cita);
  }

  delete(cita: Cita): Observable<any> {
    const apiUrl = `${environment.api.adm}/citas/${cita.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { ConsultaMedicaDato, ConsultaMedicaRegistro } from '../models/consulta-medica.model';
import { BusquedaConsultaMedica } from '../models/busquedas.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultasMedicasService {


    constructor(private httpClient: HttpClient, private helperService: HelperService) { }

    get(criteriosSearch:BusquedaConsultaMedica): Observable<any> {
      const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
      console.log(queryString);
      const apiUrl = `${environment.api.adm}/consultasMedicas/listar?${queryString}`;
      return this.httpClient.get<any>(apiUrl);
    }

    getById(id:number): Observable<any> {
      const apiUrl = `${environment.api.adm}/consultasMedicas/${id}`;
      return this.httpClient.get<any>(apiUrl);
    }

    add(consultamedica: ConsultaMedicaRegistro): Observable<any> {
      const apiUrl = `${environment.api.adm}/consultasMedicas`;
      return this.httpClient.post<any>(apiUrl, consultamedica);
    }

    edit(consultamedica: ConsultaMedicaRegistro): Observable<any> {
      const apiUrl = `${environment.api.adm}/consultasMedicas`;
      return this.httpClient.put<any>(apiUrl, consultamedica);
    }

    delete(id: number): Observable<any> {
      const apiUrl = `${environment.api.adm}/consultasMedicas/${id}`;
      return this.httpClient.delete<any>(apiUrl);
    }

    getDatosById(id:number): Observable<any> {
        const apiUrl = `${environment.api.adm}/consultasMedicas/datos-generales/${id}`;
        return this.httpClient.get<any>(apiUrl);
    }

    saveDatos(datos: ConsultaMedicaDato): Observable<any> {
        const apiUrl = `${environment.api.adm}/consultasMedicas/datos-generales`;
        return this.httpClient.post<any>(apiUrl, datos);
    }
}

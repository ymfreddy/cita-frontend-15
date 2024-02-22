import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from '../helpers/helper.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BusquedaPregunta, SolicitudPregunta } from '../models/pregunta.model';
import { BusquedaPaginada } from '../models/busquedas.model';

@Injectable({
  providedIn: 'root'
})
export class PreguntasService {

    constructor(private httpClient: HttpClient,private helperService: HelperService) { }

    preguntar(solicitud: SolicitudPregunta): Observable<any> {
        console.log(solicitud);
        const apiUrl = `${environment.api.adm}/preguntas`;
        return this.httpClient.post<any>(apiUrl, solicitud);
    }

    get(criteriosSearch:BusquedaPregunta): Observable<any> {
        const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
        const apiUrl = `${environment.api.adm}/preguntas/listar?${queryString}`;
        return this.httpClient.get<any>(apiUrl);
    }
}

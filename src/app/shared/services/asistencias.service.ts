import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../helpers/helper.service';
import { Asistencia } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AsistenciasService {

  constructor(private httpClient: HttpClient,private helperService: HelperService) { }

  getByIdUsuarioAsistente(idUsuarioAsistente: number): Observable<any> {
    const apiUrl = `${environment.api.adm}/asistencias/listar-asistencia/${idUsuarioAsistente}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(asistencia: Asistencia): Observable<any> {
    const apiUrl = `${environment.api.adm}/asistencias`;
    return this.httpClient.post<any>(apiUrl, asistencia);
  }

  delete(idAsistencia: number): Observable<any> {
    const apiUrl = `${environment.api.adm}/asistencias/${idAsistencia}`;
    return this.httpClient.delete<any>(apiUrl);
  }

}

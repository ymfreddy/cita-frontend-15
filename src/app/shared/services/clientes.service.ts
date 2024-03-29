import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Cliente } from '../models/cliente.model';
import { HelperService } from 'src/app/shared/helpers/helper.service';
import { BusquedaCliente, BusquedaPaginada } from '../models/busquedas.model';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  constructor(private httpClient: HttpClient, private helperService: HelperService) { }

  getPaged(criteriosSearch:BusquedaPaginada): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    const apiUrl = `${environment.api.adm}/clientes/listar-paginado?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  get(criteriosSearch:BusquedaCliente): Observable<any> {
    const queryString = this.helperService.jsonToQueryStringSinfiltro(criteriosSearch);
    console.log(queryString);
    const apiUrl = `${environment.api.adm}/clientes/listar?${queryString}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getTelefonoByIdEmpresaAndCodigoCliente(idEmpresa: number, codigoCliente:string): Observable<any> {
    const apiUrl = `${environment.api.adm}/clientes/telefonos/${idEmpresa}/${codigoCliente}`;
    return this.httpClient.get<any>(apiUrl);
  }

  getById(id:number): Observable<any> {
    const apiUrl = `${environment.api.adm}/clientes/${id}`;
    return this.httpClient.get<any>(apiUrl);
  }

  add(cliente: Cliente): Observable<any> {
    const apiUrl = `${environment.api.adm}/clientes`;
    return this.httpClient.post<any>(apiUrl, cliente);
  }

  edit(cliente: Cliente): Observable<any> {
    const apiUrl = `${environment.api.adm}/clientes`;
    return this.httpClient.put<any>(apiUrl, cliente);
  }

  delete(cliente: Cliente): Observable<any> {
    const apiUrl = `${environment.api.adm}/clientes/${cliente.id}`;
    return this.httpClient.delete<any>(apiUrl);
  }
}

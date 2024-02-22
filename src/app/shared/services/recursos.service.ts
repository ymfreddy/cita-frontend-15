import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from '../helpers/helper.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecursosService {

    constructor(private httpClient: HttpClient,private helperService: HelperService) { }

    listar(): Observable<any> {
        const apiUrl = `${environment.api.adm}/recursos`;
        return this.httpClient.get<any>(apiUrl);
    }
}

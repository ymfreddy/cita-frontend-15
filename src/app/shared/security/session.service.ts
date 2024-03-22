import { Injectable } from '@angular/core';
import { MenuOpcion } from '../models/menu-opcion';
import { Router } from '@angular/router';
import { adm } from 'src/app/shared/constants/adm';
import { SessionUsuario } from '../models/usuario.model';

@Injectable({
    providedIn: 'root',
})
export class SessionService {
    constructor(private router: Router) {}

    verifyUrl(url:string):boolean{
        const menu:MenuOpcion[] = this.getSessionMenu();
        const existeUrl = menu.find(x=>x.ruta==url);
        return existeUrl!=undefined;
    }

    isSuperAdmin():boolean{
        return this.getSessionUserData().codigoTipoUsuario===adm.TIPO_USUARIO_SUPERADMIN;
    }

    isAdmin():boolean{
        return this.getSessionUserData().codigoTipoUsuario===adm.TIPO_USUARIO_ADMIN;
    }

    getSessionEmpresaSfeNit(): number {
        if (sessionStorage.getItem('wx-user-data') == null) {
            this.router.navigateByUrl('');
            return 0;
        }

        const nitEmpresa = JSON.parse(
            sessionStorage.getItem('wx-user-data') ?? ''
        ).empresaSfeNit;
        return parseInt(nitEmpresa ?? '0');
    }

    getSessionEmpresaId(): number {
        if (sessionStorage.getItem('wx-user-data') == null) {
            this.router.navigateByUrl('');
            return 0;
        }

        const idEmpresa = JSON.parse(
            sessionStorage.getItem('wx-user-data') ?? ''
        ).idEmpresa;
        return parseInt(idEmpresa ?? '0');
    }

    setSessionMenu(value: any) {
        sessionStorage.setItem('wx-menu', JSON.stringify(value));
    }

    getSessionMenu(): MenuOpcion[] {
        return JSON.parse(sessionStorage.getItem('wx-menu') ?? '[]');
    }

    setSessionUserData(value: SessionUsuario) {
        sessionStorage.setItem('wx-user-data', JSON.stringify(value));
    }

    getSessionUserData(): SessionUsuario {
        if (sessionStorage.getItem('wx-user-data') == null) {
            this.router.navigateByUrl('');
        }

        return JSON.parse(sessionStorage.getItem('wx-user-data') ?? '{}');
    }

    // DESCUENTO
    setRegistroDescuento(data: any): void {
        sessionStorage.setItem('wx-descuento-data', JSON.stringify(data));
    }

    getRegistroDescuento(): any {
        return JSON.parse(sessionStorage.getItem('wx-descuento-data') ?? '{}');
    }

    setBusquedaDescuento(data: any): void {
        sessionStorage.setItem('wx-descuento-list', JSON.stringify(data));
    }

    getBusquedaDescuento(): any {
        const valor = sessionStorage.getItem('wx-descuento-list');
        if (!valor) return null;
        return JSON.parse(sessionStorage.getItem('wx-descuento-list') ?? '{}');
    }

    // TURNO
    setTurno(idTurno: number): void {
        const datos = JSON.parse(sessionStorage.getItem('wx-user-data') ?? '');
        datos.idTurno = idTurno;
        sessionStorage.setItem('wx-user-data', JSON.stringify(datos));
    }

    getTurno(): number {
        if (sessionStorage.getItem('wx-user-data') == null) {
            this.router.navigateByUrl('');
            return 0;
        }
        const idTurno = JSON.parse(
            sessionStorage.getItem('wx-user-data') ?? ''
        ).idTurno;
        return parseInt(idTurno ?? '0');
    }

    // citas
    setBusquedaCita(data: any): void {
        sessionStorage.setItem('wx-cts-list', JSON.stringify(data));
    }

    getBusquedaCita(): any {
        const valor = sessionStorage.getItem('wx-cts-list');
        if (!valor) return null;
        return JSON.parse(sessionStorage.getItem('wx-cts-list') ?? '{}');
    }
    // citas calendario
     setBusquedaCitaCalendario(data: any): void {
        sessionStorage.setItem('wx-cts-calendar', JSON.stringify(data));
    }

    getBusquedaCitaCalendario(): any {
        const valor = sessionStorage.getItem('wx-cts-calendar');
        if (!valor) return null;
        return JSON.parse(sessionStorage.getItem('wx-cts-calendar') ?? '{}');
    }
    // cuentas
    setBusquedaCuenta(data: any): void {
        sessionStorage.setItem('wx-cuenta-list', JSON.stringify(data));
    }

    getBusquedaCuenta(): any {
        const valor = sessionStorage.getItem('wx-cuenta-list');
        if (!valor) return null;
        return JSON.parse(sessionStorage.getItem('wx-cuenta-list') ?? '{}');
    }
}

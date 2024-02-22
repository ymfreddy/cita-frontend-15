import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
    email: string = environment.email;
    celular: number = environment.celular;
    version: string = environment.version;
    datos: any;

    services!: any[];

	responsiveOptions!: any[];

    constructor(public layoutService: LayoutService, public router: Router) {
        this.responsiveOptions = [
            {
                breakpoint: '1024px',
                numVisible: 3,
                numScroll: 3
            },
            {
                breakpoint: '768px',
                numVisible: 2,
                numScroll: 2
            },
            {
                breakpoint: '560px',
                numVisible: 1,
                numScroll: 1
            }
        ];
    }

    ngOnInit(): void {
        fetch('./assets/informacion/data.json')
            .then((res) => res.json())
            .then((json) => {
                this.datos = json;
                this.services = this.datos.servicios;
            });
    }

    solicitar(mensaje: string){
        window.open(`${environment.whatsappUrl}${environment.celular}&text=${mensaje}`, '_blank');
    }
}

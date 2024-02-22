import { Component, OnInit } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { PrimeNGConfig } from 'primeng/api';
import { filter } from 'rxjs';
import { Traduccion } from './shared/utils/traduccion';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(
        private primengConfig: PrimeNGConfig,
        private swUpdate: SwUpdate,
    ) {
        this.swUpdate.versionUpdates.pipe(filter((evt:any): evt is VersionReadyEvent => evt.type === 'VERSION_READY')).subscribe(()=> {
            this.swUpdate.activateUpdate().then(() => {
                if (confirm('Existe una nueva versión de la aplicación, desea actualizar?')){
                    document.location.reload();
                }
            });
        });
    }
    ngOnInit() {
        this.primengConfig.ripple = true;
        document.documentElement.style.fontSize = '14px';
        this.primengConfig.setTranslation(Traduccion.CONFIG_ES);
    }
}

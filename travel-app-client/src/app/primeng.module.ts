import {NgModule} from '@angular/core';
import {RatingModule} from 'primeng/rating';
import {OverlayPanelModule} from 'primeng/overlaypanel';
@NgModule({
    exports: [
        RatingModule,
        OverlayPanelModule
    ]
})

export class PrimeNGModule {}

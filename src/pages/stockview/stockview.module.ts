import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StockviewPage } from './stockview';

// Components
import { ComponentsModule } from '../../components/components.module';
import { AutoCompleteModule } from 'ionic2-auto-complete';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    StockviewPage
  ],
  imports: [
    ComponentsModule,
    AutoCompleteModule,
    LazyLoadImageModule,
    PipesModule,
    IonicPageModule.forChild(StockviewPage),
  ],
  exports: [
    StockviewPage
  ],
  entryComponents: [
    StockviewPage
  ]
})
export class StockviewPageModule {}

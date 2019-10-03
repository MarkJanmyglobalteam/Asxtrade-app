import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StocksPage } from './stocks';

import { ComponentsModule } from '../../components/components.module';
import { AutoCompleteModule } from 'ionic2-auto-complete';

@NgModule({
  declarations: [
    StocksPage
  ],
  imports: [
    ComponentsModule,
    AutoCompleteModule,
    IonicPageModule.forChild(StocksPage),
  ],
  exports: [
    StocksPage
  ],
  entryComponents: [
    StocksPage
  ]
})
export class StocksPageModule {}

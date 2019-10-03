import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IntroPage } from './intro';

@NgModule({
  declarations: [
    IntroPage,
  ],
  imports: [
    IonicPageModule.forChild(IntroPage),
  ],
  exports: [
    IntroPage
  ],
  entryComponents: [
    IntroPage
  ]
})
export class IntroPageModule {}

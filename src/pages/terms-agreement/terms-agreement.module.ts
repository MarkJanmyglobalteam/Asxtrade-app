import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TermsAgreementPage } from './terms-agreement';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    TermsAgreementPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(TermsAgreementPage),
  ],
  entryComponents: [
    TermsAgreementPage
  ]
})
export class TermsAgreementPageModule {}

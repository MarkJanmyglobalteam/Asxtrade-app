import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuestionnaireBasicPersonalInfoPage } from './questionnaire-basic-personal-info';

@NgModule({
  declarations: [
    QuestionnaireBasicPersonalInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(QuestionnaireBasicPersonalInfoPage),
  ],
  entryComponents: [
    QuestionnaireBasicPersonalInfoPage
  ]
})
export class QuestionnaireBasicPersonalInfoPageModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuestionnaireStockQuestionsPage } from './questionnaire-stock-questions';

@NgModule({
  declarations: [
    QuestionnaireStockQuestionsPage,
  ],
  imports: [
    IonicPageModule.forChild(QuestionnaireStockQuestionsPage),
  ],
  entryComponents: [
    QuestionnaireStockQuestionsPage
  ]
})
export class QuestionnaireStockQuestionsPageModule {}

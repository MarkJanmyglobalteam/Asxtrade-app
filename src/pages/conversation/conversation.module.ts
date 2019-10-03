import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConversationPage } from './conversation';
import { ElasticModule } from 'angular2-elastic';

@NgModule({
  declarations: [
    ConversationPage,
  ],
  imports: [
    IonicPageModule.forChild(ConversationPage),
    ElasticModule
  ],
  exports: [
    ConversationPage
  ],
  entryComponents: [
    ConversationPage
  ]
})
export class ConversationPageModule {}

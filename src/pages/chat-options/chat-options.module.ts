import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatOptionsPage } from './chat-options';

@NgModule({
  declarations: [
    ChatOptionsPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatOptionsPage),
  ],
  exports: [
    ChatOptionsPage
  ],
  entryComponents: [
    ChatOptionsPage
  ]
})
export class ChatOptionsPageModule {}

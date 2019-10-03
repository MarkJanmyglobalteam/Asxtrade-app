import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddMoreGroupChatMembersPage } from './add-more-group-chat-members';

@NgModule({
  declarations: [
    AddMoreGroupChatMembersPage,
  ],
  imports: [
    IonicPageModule.forChild(AddMoreGroupChatMembersPage),
  ],
  exports: [
    AddMoreGroupChatMembersPage
  ],
  entryComponents: [
    AddMoreGroupChatMembersPage
  ]
})
export class AddMoreGroupChatMembersPageModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchMultipleUsersChatPage } from './search-multiple-users-chat';

@NgModule({
  declarations: [
    SearchMultipleUsersChatPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchMultipleUsersChatPage),
  ],
  exports: [
    SearchMultipleUsersChatPage
  ],
  entryComponents: [
    SearchMultipleUsersChatPage
  ]
})
export class SearchMultipleUsersChatPageModule {}

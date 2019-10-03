import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchIndividualUsersChatPage } from './search-individual-users-chat';

@NgModule({
  declarations: [
    SearchIndividualUsersChatPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchIndividualUsersChatPage),
  ],
  exports: [
    SearchIndividualUsersChatPage
  ],
  entryComponents: [
    SearchIndividualUsersChatPage
  ]
})
export class SearchIndividualUsersChatPageModule {}

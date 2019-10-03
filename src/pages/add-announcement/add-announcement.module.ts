import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddAnnouncementPage } from './add-announcement';

@NgModule({
  declarations: [
    AddAnnouncementPage,
  ],
  imports: [
    IonicPageModule.forChild(AddAnnouncementPage),
  ],
})
export class AddAnnouncementPageModule {}

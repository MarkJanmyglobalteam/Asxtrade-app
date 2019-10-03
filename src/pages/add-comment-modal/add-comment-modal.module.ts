import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddCommentModalPage } from './add-comment-modal';

@NgModule({
  declarations: [
    AddCommentModalPage,
  ],
  imports: [
    IonicPageModule.forChild(AddCommentModalPage),
  ],
})
export class AddCommentModalPageModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResetPasswordPage } from './reset-password';
import { ReactiveFormsModule } from '../../../node_modules/@angular/forms';

@NgModule({
  declarations: [
    ResetPasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(ResetPasswordPage),
    ReactiveFormsModule
  ],
  exports: [
    ResetPasswordPage
  ],
  entryComponents: [
    ResetPasswordPage
  ]
})
export class ResetPasswordPageModule {}

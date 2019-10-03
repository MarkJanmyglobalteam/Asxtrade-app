import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditProfilePage } from './edit-profile';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  declarations: [
    EditProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(EditProfilePage),
    LazyLoadImageModule
  ],
  exports: [
    EditProfilePage
  ],
  entryComponents: [
    EditProfilePage
  ]
})
export class EditProfilePageModule {}

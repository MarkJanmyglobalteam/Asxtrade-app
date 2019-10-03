import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddWatchlistModalPage } from './add-watchlist-modal';

@NgModule({
  declarations: [
    AddWatchlistModalPage,
  ],
  imports: [
    IonicPageModule.forChild(AddWatchlistModalPage),
  ],
})
export class AddWatchlistModalPageModule {}

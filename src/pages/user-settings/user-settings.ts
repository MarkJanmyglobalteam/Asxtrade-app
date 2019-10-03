import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, App } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user-provider';
import * as firebase from 'firebase/app';
import { AddAnnouncementPage } from '../add-announcement/add-announcement';
import { StocksProvider } from '../../providers/stocks/stocks';
import { LoginPage } from "../login/login";
/**
 * Generated class for the UserSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-settings',
  templateUrl: 'user-settings.html',
})
export class UserSettingsPage {

  private isAdmin: boolean = false;

  constructor(
    public userProvider: UserProvider,
    public alertCtrl: AlertController,
    public stocksProvider: StocksProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
  ) {
    this.isAdmin = navParams.get('isAdmin');
  }

  goToAddAnnouncement() {
    this.navCtrl.push(AddAnnouncementPage);
  }

  signout() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Logout',
      message: 'Do you want to sign out of the application?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Okay',
          handler: () => {
           this.userProvider.unscribeAll();
            this.stocksProvider.unsubscribeStocksWatchlist();

            // TODO: Get back at this at a later time and investigate further
            // firebase.database().goOffline();
            firebase.auth().signOut();
              console.log("called");
              this.app.getRootNav().setRoot(LoginPage);
        
          }
        }
      ]
    });
    alert.present();
  }
}


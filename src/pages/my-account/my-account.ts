import { Component } from '@angular/core';
import {
  App,
  IonicPage,
  NavController,
  NavParams,
  AlertController
} from 'ionic-angular';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import * as firebase from 'firebase';
import { Subscription } from 'rxjs';

import { User } from '../../models/user';

/**
 * Generated class for the MyAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-account',
  templateUrl: 'my-account.html'
})
export class MyAccountPage {
  user: User;
  userSubscription: Subscription;
  followSubscription: Subscription;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public db: AngularFireDatabase,
    public app: App
  ) {}

  ionViewWillEnter() {
    let id$ = firebase.auth().currentUser.uid;

    this.userSubscription = this.db
      .object<User>('/userData/' + id$)
      .valueChanges()
      .subscribe(res => {
        this.user = res;
        this.followSubscription = this.db
          .list('/followData/' + id$)
          .valueChanges()
          .map(items => {
            this.user['followData$'] = true;
            this.user['followers'] = items.filter(
              item => item['type'] == 'follower'
            ).length;
            this.user['following'] = items.filter(
              item => item['type'] == 'following'
            ).length;
          })
          .subscribe();
      });
  }

  ionViewDidLoad() {
    //
  }

  editProfile() {
    this.app.getRootNav().push('EditProfilePage', this.user);
  }

  changePassword() {
    this.app.getRootNav().push('ChangePasswordPage', this.user);
  }

  signOut() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Logout',
      message: 'Do you sign out of the application?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Okay',
          handler: () => {
            if (this.userSubscription) this.userSubscription.unsubscribe();
            if (this.followSubscription) this.followSubscription.unsubscribe();

            // TODO: Get back at this at a later time and investigate further
            // firebase.database().goOffline();
            firebase.auth().signOut();
          }
        }
      ]
    });
    alert.present();
  }
}

import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { User } from '../../models/user';
import * as firebase from 'firebase/app';
import moment from 'moment';

import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { UserProvider } from '../../providers/user/user-provider';
import { StocksProvider } from '../../providers/stocks/stocks';
import { UserSettingsPage } from '../user-settings/user-settings';

export class StockQuestion {
  profileRisk: number;
  qualified708Investor: boolean;
  sharePortfolio?: string[];
  tradingBasis?: string[];
  investmentSectors?: string[];
}
@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {
  user: User;
  anotherUserId = undefined;
  isAnotherUserFollowed = false;
  currentUserId;
  stockInfo: StockQuestion;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public db: AngularFireDatabase,
    public app: App,
    public userProvider: UserProvider,
    public loadingCtrl: LoadingController,
    public stocksProvider: StocksProvider
  ) {
    this.anotherUserId = navParams.get('anotherUserId');
  }

  ionViewDidLoad() {
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter')
    this.currentUserId = firebase.auth().currentUser.uid;
    let id$ = this.anotherUserId ?
      this.anotherUserId : this.currentUserId;

    if (this.anotherUserId) {
      this.userProvider.isCurrentUserFollowing(this.anotherUserId)
        .then((result) => {
          this.isAnotherUserFollowed = result ? true : false;
        });
    }

    this.db.object('/questionnaires/' + this.currentUserId + '/stockQuestions')
      .valueChanges()
      .first()
      .toPromise()
      .then((result: StockQuestion) => {
        this.stockInfo = result;
        console.log('stock info', result);
      });


    this.userProvider.userSubscription = this.db
      .object<User>('/userData/' + id$)
      .valueChanges()
      .subscribe(res => {
        res.birthdate = moment(res.birthdate).format('DD/MMM/YYYY');
        this.user = new User(res);
        this.userProvider.followSubscription = this.db
          .object('/userFollowData/' + id$)
          .valueChanges()
          .subscribe(data => {
            this.user['followData$'] = true;
            let followers = [];
            let following = [];

            if (data) {
              if (data['followers']) {
                for (var i in data['followers']) {
                  followers.push(i);
                }
              }
              if (data['following']) {
                for (var j in data['following']) {
                  following.push(j);
                }
              }
            }

            this.user['followers'] = followers.length;
            this.user['following'] = following.length;
          })
      });
  }

  editProfile() {
    this.app.getRootNav().push('EditProfilePage', this.user);
  }

  changePassword() {
    this.app.getRootNav().push('ChangePasswordPage', this.user);
  }

  openUserSettings() {
    this.navCtrl.push(UserSettingsPage, { isAdmin: this.user.isAdmin });
  }

  toggleFollow() {
    this.userProvider.isCurrentUserFollowing(this.anotherUserId)
      .then((isFollowing) => {
        let loaderMessage = isFollowing ? 'Unfollowing user...' : 'Following user';
        let loader = this.getLoader(loaderMessage);
        loader.present();

        if (isFollowing) {
          this.userProvider.unfollowUser(this.anotherUserId)
            .then(result => {
              loader.dismiss();
              this.isAnotherUserFollowed = false;
            })
            .catch(err => {
              loader.dismiss();
            })
        }
        else {
          this.userProvider.followUser(this.anotherUserId)
            .then(result => {
              loader.dismiss();
              this.isAnotherUserFollowed = true;
            })
            .catch(err => {
              loader.dismiss();
            })
        }
      });
  }

  private getLoader(content: string, dismissOnPageChange: boolean = true) {
    return this.loadingCtrl.create({
      content: content,
      dismissOnPageChange: dismissOnPageChange
    });
  }

  private formatDate(date: string) {
    return moment(date).format('DD-MM-YYYY');
  }
}

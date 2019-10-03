import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { NotificationsProvider } from '../../providers/notifications/notifications-provider';
import { NotificationType } from '../../models/notificationTypes';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import moment from 'moment';

/**
 * Generated class for the NotificationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alert: AlertController,
    public notifProvider: NotificationsProvider,
    public db: AngularFireDatabase,
  ) {
    if (navParams.data) {
      this.openNotification(navParams.data);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationsPage');
  }

  private openNotification(notification: any) {
    if (notification.type == NotificationType.announcement) {
      this.presentAlert(notification.header, notification.body);
      this.markNotificationAsRead(notification);
    }
  }

  private presentAlert(title: string, message: string) {
    let a = this.alert.create({
      title: title,
      subTitle: message,
      buttons: ['Dismiss']
    });
    a.present();
  }

  private markNotificationAsRead(notification) {
    let notif = this.notifProvider.userNotifications
      .find(x => x.header === notification.header
        && x.body === notification.body
        && x.timestamp === x.timestamp
        && x.type === notification.type);

    if (notif) {
      notif.isRead = true;
    }

    let id$ = firebase.auth().currentUser.uid;
    this.db.object(`/userNotifications/${id$}/${notif.id}`).update({
      isRead: true,
    });
  }

  formatDate(timestamp) {
    return moment.utc(timestamp).fromNow();
  }
}

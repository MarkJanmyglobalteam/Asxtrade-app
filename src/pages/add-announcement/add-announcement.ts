import { IonicPage, NavController, App, ToastController, AlertController } from "ionic-angular";
import { Component } from "@angular/core";
import { AngularFireDatabase } from "angularfire2/database";
import { empty } from "rxjs/observable/empty";
import { UserProvider } from "../../providers/user/user-provider";
import { User } from "firebase/app";
import * as firebase from "firebase";
import { NotificationType } from "../../models/notificationTypes";
import { Http, RequestOptionsArgs } from "@angular/http";
import { PushProvider } from "../../providers/push/push";

@IonicPage()
@Component({
  selector: "page-add-announcement",
  templateUrl: "add-announcement.html"
})
export class AddAnnouncementPage {
  user: User;
  announcement : UserAnnouncementForm = {
    header: undefined,
    body: undefined,
  }

  constructor(
    public navCtrl: NavController,
    public db: AngularFireDatabase,
    public toast: ToastController,
    public app: App,
    public userProvider: UserProvider,
    private pushProvider: PushProvider,
    public alertCtrl: AlertController
  ) { }

  ionViewDidLoad() { }

  saveAnnouncement(announcement: UserAnnouncementForm) {
    //save db here
    console.log(announcement);
    let userId = firebase.auth().currentUser.uid;

    this.db
      .object("/userData")
      .valueChanges()
      .map(userData => Object.keys(userData))
      .take(1)
      .toPromise()
      .then(userIds => {
        return new Promise((resolve, reject) => {
          let data = {
            header: announcement.header,
            body: announcement.body,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            payload: {},
            type: NotificationType.announcement
          };

          userIds.forEach(id => {
            this.db.list(`/userNotifications/${id}`).push(data);
          });

          this.pushNotification(data);

          resolve(userIds);
        }).then(() => {
          this.navCtrl.pop();
          this.presentToast(
            "You have successfully broadcasted an announcement!"
          );
        });
      });
  }

  private pushNotification(announcement: any) {
    let data = {
      page: 'Announcement',
      params: announcement
    };

    this.pushProvider.sendNotification(
      announcement.header,
      announcement.body,
      data
    );
  }

  private presentToast(message: string, duration: number = 3000) {
    let t = this.toast.create({
      message: message,
      duration: duration,
      position: "top"
    });
    t.present();
  }

  test(event) {
    console.log(event)
  }
   addLink() {
    // const selected = document.getSelection();
    let alert = this.alertCtrl.create({
      // title: 'Login',
      inputs: [
        {
          name: 'url',
          placeholder: 'Url',
          value: 'https://'
        },
        {
          name: 'body',
          placeholder: 'Text',
          // value: 'https://'
        },
       
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Add',
          handler: data => {
            document.getElementById('body').innerHTML += '<a href="' + data.url + '">' + data.body + '</a>'
          }
        }
      ]
    });
    alert.present();
    // editorWindow.document.execCommand('createlink', false, linkURL);
   
}
}

export interface UserAnnouncementForm {
  header: string;
  body: string;
}

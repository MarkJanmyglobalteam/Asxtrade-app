import { Component } from "@angular/core";
import { NavController, ModalController } from "ionic-angular";
import * as firebase from "firebase";
import * as _ from "lodash";
import { AngularFireDatabase } from "angularfire2/database";
import { StocksPage } from "../stocks/stocks";
import { NotificationsPage } from "../notifications/notifications";
import { ChatPage } from "../chat/chat";
import { UserProfilePage } from "../user-profile/user-profile";

import { NotificationsProvider } from "../../providers/notifications/notifications-provider";
import { QuestionnaireProvider } from "../../providers/questionnaire/questionnaire";
import { ConversationProvider } from "../../providers/conversation/conversation";
import { Subscription } from "rxjs";
import { AngularFireAuth } from "angularfire2/auth";
import { User } from "@firebase/auth-types";
import { EmailVerificationProvider } from "../../providers/email-verification/email-verification";
import { StocksProvider } from "../../providers/stocks/stocks";

/**
 * Generated class for the TabsPage tabs.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-tabs",
  templateUrl: "tabs.html"
})
export class TabsPage {
  stocksRoot = StocksPage;
  notificationsRoot = NotificationsPage;
  chatRoot = ChatPage;
  accountRoot = UserProfilePage;

  private _subscription: Subscription = new Subscription();
  private set subscription(value: Subscription) {
    this._subscription.add(value);
  }
  symbols: any = [];
  stocks: any = {
    obs: [],
    list: [],
    preLoader: true
  };

  private watchlistBoards: string[] = [];
  private watchlist: object = {};
  private selectedBoard: string;

  constructor(
    public navCtrl: NavController,
    public db: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public notifProvider: NotificationsProvider,
    public questionnaireProvider: QuestionnaireProvider,
    private emailVerificationProvider: EmailVerificationProvider,
    private StocksProvider: StocksProvider
  ) { 
 

  }

  ionViewDidLoad() {

    var amOnline = firebase.database().ref("/.info/connected");
    var userRef = firebase
      .database()
      .ref("/presence/" + firebase.auth().currentUser.uid);

    console.log('userRef', userRef);
    amOnline.on("value", snapshot => {
      if (snapshot.val()) {
        userRef.onDisconnect().remove();
        userRef.set(true);
      }
    });

    // this.questionnaireProvider.init();
    // this.checkIfEmailVerified();
  }

  ionViewWillEnter() {
    let id$ = firebase.auth().currentUser.uid;
    this.notifProvider.notificationSubscription = this.db
      .object("/userNotifications/" + id$)
      .valueChanges()
      .subscribe(data => {
        for (var key in data) {
          var index = this.notifProvider.userNotifications.findIndex(
            n => n.id === key
          );
          if (index > -1) {
            this.notifProvider.userNotifications[index] = {
              ...data[key],
              id: key
            };
          } else {
            this.notifProvider.userNotifications.push({
              ...data[key],
              id: key
            });
          }

          console.log("userNotifs:", this.notifProvider.userNotifications);

          var unreadIndex = this.notifProvider.unreadNotifications.findIndex(
            n => n === key
          );
          if (data[key].isRead && unreadIndex > -1) {
            this.notifProvider.unreadNotifications = this.notifProvider.unreadNotifications.filter(
              notifId => {
                return notifId !== key;
              }
            );
          } else if (!data[key].isRead && unreadIndex < 0) {
            this.notifProvider.unreadNotifications.push(key);
          }
        }
      });

    this.getUnreadConversationsCount();
  }

  private unreadMessageCount: number;
  private getUnreadConversationsCount() {
    this.subscription = this.db
      .list(`/userConversations/${firebase.auth().currentUser.uid}`)
      .valueChanges()
      .subscribe((data: any[]) => {
        data = data.map(x => <boolean>x.unread).filter(x => x);
        this.unreadMessageCount = data.length;
      });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._subscription.unsubscribe();
  }

  private isEmailVerified: boolean = false;
  private emailVerifyMessage: string = "";
  private sendVerificationEmail() {
    this.emailVerificationProvider.sendEmailVerification()
      .then(message => {
        this.emailVerifyMessage = message;
      });
  }

  private async checkIfEmailVerified() {
    this.subscription = this.afAuth.authState
      .subscribe(result => {
        console.log("authState", result);
        this.isEmailVerified = result.emailVerified;
      });
  }
  
}

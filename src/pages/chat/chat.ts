import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { Component } from "@angular/core";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import firebase from "firebase";
import {
  App,
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  ToastController
} from "ionic-angular";
import * as _ from "lodash";
import moment from "moment";
import { ConversationProvider } from "../../providers/conversation/conversation";
import { UserProvider } from "../../providers/user/user-provider";
import { SearchIndividualUsersChatPage } from "../search-individual-users-chat/search-individual-users-chat";
import { SearchMultipleUsersChatPage } from "../search-multiple-users-chat/search-multiple-users-chat";
import { ConversationPage } from "../conversation/conversation";

/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-chat",
  templateUrl: "chat.html"
})
export class ChatPage {
  isInitialized: boolean = false;
  currentLoggedInUserId: string = firebase.auth().currentUser.uid;

  userConversations$: AngularFireList<any>;
  userConversations: any[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: AngularFireDatabase,
    public app: App,
    public userProvider: UserProvider,
    public conversationProvider: ConversationProvider,
    public loaderCtrl: LoadingController,
    public openNativeSettings: OpenNativeSettings,
    public toastCtrl: ToastController
  ) {}

  goToIndividualUsersSearchPage() {
    this.navCtrl.push(SearchIndividualUsersChatPage);
  }

  goToMultipleUsersSearchPage() {
    this.navCtrl.push(SearchMultipleUsersChatPage);
  }

  ionViewDidLoad() {
    console.log("chat page loaded!");
    // let toast = this.toastCtrl.create({
    //   message: 'You can configure your keyboard setting for better experience',
    //   // duration: 3000,
    //   showCloseButton: true,
    //   position: 'top',
    //   closeButtonText: 'Ok'
    // });
  
    // toast.onDidDismiss(() => {
    //   this.openNativeSettings.open('settings').then().catch( err => console.log(err));
    // });
  
    // toast.present();

    if (!this.isInitialized) {
      this.loaderCtrl
        .create({
          content: "Please wait...",
          duration: 2500
        })
        .present();
      this.isInitialized = true;
    }

    let userConversations$ = this.db.list(
      `userConversations/${this.currentLoggedInUserId}`,
      (ref: firebase.database.Reference) => ref.orderByChild("timestamp")
    );

    userConversations$
      .snapshotChanges()
      .switchMap(userConversations => {
        userConversations = userConversations.map((userConversation: any) => {
          let userConversationData = userConversation.payload.val();
          let conversationId = userConversation.key;

          let temp: any = {
            unread: userConversationData.unread,
            isCreator: false,
            conversationName: "",
            conversationId: conversationId,
            latestMessage: "",
            isGroupChat: false,
            members: [],
            timestamp: userConversationData.timestamp
          };

          this.db
            .object(`conversations/${conversationId}`)
            .valueChanges()
            .subscribe((conversationData: any) => {
              console.log('conversationData:', conversationData);
              let participantsIds = Object.keys(conversationData.participants).filter( val => conversationData.participants[val] );
              console.log('participantsIds:', participantsIds);

              

              temp.isCreator =
                conversationData.creator === this.currentLoggedInUserId;

              if (conversationData.isGroupChat) {
                temp.conversationName = conversationData.conversationName;
                temp.isGroupChat = true;
                this.conversationProvider
                  .getParticipantsData(participantsIds)
                  .then(participants => {
                    temp.members = participants;
                  });
              } else {
                let otherUserId = participantsIds.filter(
                  participantId => participantId !== this.currentLoggedInUserId
                )[0];

                this.db
                  .object(`userData/${otherUserId}`)
                  .valueChanges()
                  .subscribe((otherUserData: any) => {
                    temp.conversationName = `${otherUserData.firstname} ${
                      otherUserData.lastname
                    }`;
                    temp.members.push(otherUserData);
                  });
              }
            });

          this.db
            .list(
              `conversationMessages/${conversationId}`,
              (ref: firebase.database.Reference) => ref.limitToLast(2)
            )
            .valueChanges()
            .subscribe((messages: any) => {
              temp.latestMessage = messages[messages.length - 1];
              temp.latestMessage.time = moment(
                messages[messages.length - 1].timestamp
              ).format("hh:mm A");
            });

          return temp;
        });

        return (this.userConversations = _.orderBy(
          userConversations,
          ["timestamp"],
          ["desc"]
        ));
      })
      .subscribe();
  }

  goToConversationPage(userConversation: any) {
    console.log('goToConversationPage', userConversation)
    this.app.getRootNav().push(ConversationPage, {
      conversationId: userConversation.conversationId,
      conversationName: userConversation.conversationName,
      members: userConversation.members,
      isCreator: userConversation.isCreator,
      isGroupChatInitialized: true,
      isGroupChat: userConversation.isGroupChat
    });
  }
}

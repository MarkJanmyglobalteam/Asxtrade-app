import { Component, ViewChild } from "@angular/core";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import firebase from "firebase";
import {
  Content,
  IonicPage,
  NavController,
  NavParams,
  ToastController
} from "ionic-angular";
import moment from "moment";
import { Subscription } from "rxjs/Subscription";
import { User } from "../../models/user";
import { ConversationProvider } from "../../providers/conversation/conversation";
import { ChatOptionsPage } from "../chat-options/chat-options";
import { FirebaseStorageProvider } from "../../providers/firebase-storage/firebase-storage";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { PushProvider } from "../../providers/push/push";
import { CordovaInstance } from "../../../node_modules/@ionic-native/core";

/**
 * Generated class for the ConversationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-conversation",
  templateUrl: "conversation.html"
})
export class ConversationPage {
  @ViewChild("chatcontainer")
  chatcontainer: Content;
  currentLoggedInUserId = firebase.auth().currentUser.uid;
  message: string = "";
  messages$: AngularFireList<any>;
  messagesSubscription: Subscription;
  messages: any[];

  conversationId: string;
  participants: User[] = [];
  conversationName: string = "";
  isGroupChat: boolean = false;
  isCreator: boolean = false;
  isGroupChatInitialized: boolean = true;
  presenceSubscription: Subscription;

  currentUser: User;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: AngularFireDatabase,
    public conversationProvider: ConversationProvider,
    private dbStorage: FirebaseStorageProvider,
    private iab: InAppBrowser,
    private pushProvider: PushProvider
  ) { }

  ionViewWillEnter() {
    console.log("navParamsData:", this.navParams.data);
    let {
      conversationId,
      members,
      conversationName,
      isCreator,
      isGroupChatInitialized,
      isGroupChat
    } = this.navParams.data;
    console.log("conversationId:", conversationId);
    console.log("members:", members);
    // members = members.filter(x => x.uuid !== this.currentLoggedInUserId);

    if (conversationName) this.conversationName = conversationName;

    this.conversationId = conversationId;
    this.participants = members;
    this.isCreator = isCreator;
    this.isGroupChatInitialized = isGroupChatInitialized;

    // if 1:1 chat, get other user name as conversation name
    if (!this.navParams.data.isGroupChat) {
      let otherUser = members.filter(
        member => member.uuid !== this.currentLoggedInUserId
      )[0];
      this.conversationName = `${otherUser.firstname} ${otherUser.lastname}`;
      this.presenceSubscription = this.db
        .object(`/presence/${otherUser.uuid}`)
        .valueChanges()
        .subscribe(value => {
          this.participants[0]["active"] = value;
        });
    } else {
      this.isGroupChat = true;
    }

    if (conversationId) {
      this.messages$ = this.db.list(`conversationMessages/${conversationId}`);
      this.messagesSubscription = this.messages$
        .valueChanges()
        .map(messages => {
          return messages.map(message => {
            message["user"] = this.participants.find(
              participant => participant.uuid === message.userId
            );
            message["fromNow"] = moment(message.timestamp).fromNow();
            return message;
          });
        })
        .subscribe(messages => {
          this.messages = messages;
          setTimeout(() => {
            if (this.chatcontainer._scroll)
              this.chatcontainer.scrollToBottom(300);
            this.conversationProvider.clearUnreadCountOfCurrentLoggedInUser(
              conversationId
            );
          });
        });
    }
  }

  ionViewDidLeave() {
    if (this.messagesSubscription) this.messagesSubscription.unsubscribe();
    if (this.presenceSubscription) this.presenceSubscription.unsubscribe();
  }

  sendMessage(message: string) {
    // Clear message
    this.message = "";

    if (!message.trim()) return;

    if (!this.isGroupChatInitialized) this.isGroupChatInitialized = true;

    if (!this.conversationId) {
      let conversationData = this.conversationProvider.createConversation(
        this.participants,
        this.navParams.data.conversationName
      );
      this.conversationId = conversationData.conversationId;
      this.messages$ = this.db.list(
        `conversationMessages/${this.conversationId}`
      );
      this.messagesSubscription = this.messages$
        .valueChanges()
        .map(messages => {
          return messages.map(message => {
            message["user"] = this.participants.find(
              participant => participant.uuid === message.userId
            );
            message["fromNow"] = moment(message.timestamp).fromNow();
            return message;
          });
        })
        .subscribe(messages => {
          this.messages = messages;
          setTimeout(() => {
            if (this.chatcontainer._scroll)
              this.chatcontainer.scrollToBottom(300);
            this.conversationProvider.clearUnreadCountOfCurrentLoggedInUser(
              conversationData.conversationId
            );
          });
        });
    }

    this.sendPayload(message);
  }

  sendPayload(payload: any, file: any = {}) {
    console.log('this.participants:', this.participants);
     this.sendNotification(payload);

    let timestamp = firebase.database.ServerValue.TIMESTAMP;

    let messageData = {
      userId: this.currentLoggedInUserId,
      payload: payload,
      file: file,
      timestamp: timestamp
    };

    this.messages$.push(messageData);

    this.conversationProvider.setUnreadCountOfParticipants(
      this.participants,
      this.conversationId
    );

    this.conversationProvider.updateConversationTimestampOfParticipants(
      this.participants,
      this.conversationId,
      timestamp
    );
  }

  private async sendNotification(message: string) {
    let playerIds: string[] = [];
    this.participants
      .filter(x => x.uuid !== this.currentLoggedInUserId)
      .map(x => x.oneSignalIds)
      .forEach(x => x ? x.forEach(y => playerIds.push(y)) : '');

    let currentUser = await this.db
      .object(`/userData/${this.currentLoggedInUserId}`)
      .valueChanges()
      .first()
      .map(x => <User>x)
      .toPromise();

    let notificationHeader = this.isGroupChat
      ? this.conversationName
      : `${currentUser.firstname} ${currentUser.lastname}`;

    let data = {
      page: 'Conversation',
      params: {
        conversationId: this.conversationId,
        members: [...this.participants, currentUser],
        conversationName: this.conversationName,
        isCreator: this.isCreator,
        isGroupChatInitialized: this.isGroupChatInitialized
      }
    };
    
    return this.pushProvider.sendNotification(
      notificationHeader,
      message,
      data,
      playerIds
    );
  }

  goToChatOptions() {
    this.navCtrl.push(ChatOptionsPage, {
      isCreator: this.isCreator,
      participants: this.participants,
      conversationId: this.conversationId,
      conversationName: this.conversationName
    });
  }

  uploadImageFromCamera() {
    this.dbStorage.uploadImageFromCamera().then(fileData => {
      this.sendPayload(null, fileData);
    });
  }

  uploadImageFromGallery() {
    this.dbStorage.uploadImageFromGallery().then(fileData => {
      this.sendPayload(null, fileData);
    });
  }

  uploadFileFromExplorer() {
    this.dbStorage.uploadFileFromExplorer().then(fileData => {
      this.sendPayload(null, fileData);
    });
  }

  openUrl(url) {
    const browser = this.iab.create(url, "_system");
  }
}

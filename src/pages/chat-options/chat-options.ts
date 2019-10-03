import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import * as _ from 'lodash';
import firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Subscription } from 'rxjs';
import { ConversationProvider } from '../../providers/conversation/conversation';
import { AddMoreGroupChatMembersPage } from '../add-more-group-chat-members/add-more-group-chat-members';

/**
 * Generated class for the ChatOptionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat-options',
  templateUrl: 'chat-options.html',
})
export class ChatOptionsPage {
  currentLoggedInUserId: string = '';
  conversationData: any = {};
  loader: any;

  participantsSubscription: Subscription;

  constructor(
    public navCtrl: NavController,
    public db: AngularFireDatabase,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public conversationProvider: ConversationProvider,
    public toastCtrl: ToastController) {
  }

  presentLoading(text: string = 'Please wait...') {
    this.loader = this.loadingCtrl.create({
      content: text
    });
    this.loader.present();
  }

  presentToastError() {
    this.toastCtrl.create({
      message: 'Oops... Something went wrong!',
      duration: 3000
    }).present();
  }

  presentToastSuccess(message: string = 'Success!') {
    this.toastCtrl.create({
      message: message,
      duration: 3000
    }).present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatOptionsPage');

    this.currentLoggedInUserId = firebase.auth().currentUser.uid;
    this.conversationData = this.navParams.data;
    console.log('ionViewDidLoad ChatOptionsPage');
    console.log('this.navParams.data:', this.navParams.data);
    this.conversationData.participants = _.orderBy(this.conversationData.participants, ['fullname'], ['asc']);

    this.participantsSubscription = this.db.object(`conversations/${this.conversationData.conversationId}/participants`).valueChanges().subscribe(participants => {
      this.conversationData.participants = this.conversationData.participants.map(participant => {
        console.log('participant:', participant);
        participant['isRemoved'] = !participants[participant.uuid];
        return participant;
      });
    });
  }

  ionViewDidLeave() {
    if (this.participantsSubscription) this.participantsSubscription.unsubscribe();
  }

  goToAddMoreMembersPage() {
    this.navCtrl.push(AddMoreGroupChatMembersPage, this.conversationData);
  }

  renameConversationPrompt() {
    let prompt = this.alertCtrl.create({
      title: 'Edit group name',
      inputs: [
        {
          name: 'conversationName',
          placeholder: 'New group name',
          value: this.conversationData.conversationName
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Edit group name cancelled');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('data:', data);
            this.presentLoading();

            this.conversationProvider.renameGroupConversation(
              this.conversationData.conversationId,
              data.conversationName
            ).then(() => {
              this.loader.dismiss();
              this.presentToastSuccess('Successfully renamed group!');
            }).catch(() => {
              this.loader.dismiss();
              this.presentToastError();
            });
            // this.conversationData.conversationName = data.conversationName
          }
        }
      ]
    });
    prompt.present();
  }

  leaveGroupChatPrompt() {
    let confirm = this.alertCtrl.create({
      title: 'Leave group chat',
      message: `Are you sure you want to leave this group chat?`,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Remove participant cancelled');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            console.log('Removing participant uuid:', this.currentLoggedInUserId);
            this.presentLoading();

            this.conversationProvider.removeParticipantFromGroupConversation(
              this.conversationData.conversationId,
              this.currentLoggedInUserId
            ).then(() => {
              this.loader.dismiss();
              this.presentToastSuccess('You have left the group chat!');
              this.navCtrl.popToRoot();
            }).catch(() => {
              this.loader.dismiss();
              this.presentToastError();
            });
          }
        }
      ]
    });
    confirm.present();
  }

  removeParticipantFromGroupConversationPrompt(participant) {
    let confirm = this.alertCtrl.create({
      title: 'Remove member from group chat?',
      message: `Are you sure you want to remove ${participant.firstname} from the group chat?`,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Remove participant cancelled');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            console.log('Removing participant uuid:', participant.uuid);
            this.presentLoading();

            this.conversationProvider.removeParticipantFromGroupConversation(
              this.conversationData.conversationId,
              participant.uuid
            ).then(() => {
              this.loader.dismiss();
              this.presentToastSuccess('Successfully removed member!');
            }).catch(() => {
              this.loader.dismiss();
              this.presentToastError();
            });
          }
        }
      ]
    });
    confirm.present();
  }
}

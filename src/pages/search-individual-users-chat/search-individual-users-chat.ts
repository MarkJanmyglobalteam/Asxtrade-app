import { Component } from '@angular/core';
import { App, IonicPage, LoadingController, NavController, NavParams, ViewController } from 'ionic-angular';
import { User } from '../../models/user';
import { ConversationProvider } from '../../providers/conversation/conversation';
import { UserProvider } from '../../providers/user/user-provider';
import { ConversationPage } from '../conversation/conversation';

/**
 * Generated class for the SearchIndividualUsersChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search-individual-users-chat',
  templateUrl: 'search-individual-users-chat.html'
})
export class SearchIndividualUsersChatPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider,
    public loadingCtrl: LoadingController,
    public conversationProvider: ConversationProvider,
    public viewCtrl: ViewController,
    public appCtrl: App
  ) {}

  searchBar = { name: '', placeholder: 'Search' };
  users: User[] = [];

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchIndividualUsersChatPage');
    // TODO: Retrieve followed users here and show them
  }

  search(name) {
    if (name.length < 3) return;
    this.userProvider.getUsersByName(name).then(users => {
      this.users = users;
    });
  }

  cancel() {
    this.searchBar.name = '';
  }

  startIndividualConversation(user: User) {
    console.log('Start Individual Conversation with:', user);
    let loader = this.loadingCtrl.create({
      content: 'Loading...'
    });
    loader.present();

    Promise.all([
      this.conversationProvider.getPreviousIndividualConversation(user),
      this.conversationProvider.getParticipantsData([
        this.conversationProvider.currentLoggedInUserId,
        `${user.uuid}`
      ])
    ]).then(data => {
      let [conversationId, members] = data;
      loader.dismiss();

      this.viewCtrl.dismiss();
      this.appCtrl.getRootNav().push(ConversationPage, {
        conversationId: conversationId,
        members: members,
        conversationName: ''
      });

      // this.navCtrl.push('ConversationPage', {
      //   conversationId: conversationId,
      //   members: members
      // });
    }).catch(err => {
      loader.dismiss();
      console.error(err);
    });
  }
}

import { Component } from '@angular/core';
import { App, IonicPage, LoadingController, NavController, NavParams, ViewController } from 'ionic-angular';
import * as _ from 'lodash';
import { User } from '../../models/user';
import { ConversationProvider } from '../../providers/conversation/conversation';
import { UserProvider } from '../../providers/user/user-provider';

/**
 * Generated class for the SearchMultipleUsersChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search-multiple-users-chat',
  templateUrl: 'search-multiple-users-chat.html'
})
export class SearchMultipleUsersChatPage {
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
  groupNameBar = { name: '', placeholder: 'Group name' };
  searchResultUsers: User[] = [];
  selectedUsers: User[] = [];

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchMultipleUsersChatPage');
    // TODO: Retrieve followed users here and show them
  }

  search(name: string) {
    name = name.trim();
    if (name.length < 3) return;
    this.userProvider.getUsersByName(name).then(users => {
      users.forEach(
        user =>
          (user['selected'] =
            _.findIndex(this.selectedUsers, { uuid: user.uuid }) > -1)
      );
      this.searchResultUsers = users;
    });
  }

  cancel() {
    this.searchBar.name = '';
  }

  removeToSelectedUserList(user: User) {
    this.selectedUsers = this.selectedUsers.filter(
      selectedUser => selectedUser.uuid !== user.uuid
    );
    this.searchResultUsers.unshift(user);
  }

  includeToSelectedUserList(user: User) {
    this.searchResultUsers = this.searchResultUsers.filter(
      searchResultUser => searchResultUser.uuid !== user.uuid
    );
    this.selectedUsers.push(user);
  }

  startGroupConversation() {
    console.log('Start Group Conversation with:', this.selectedUsers);
    let loader = this.loadingCtrl.create({
      content: 'Loading...'
    });
    loader.present();

    let participantsIds = this.selectedUsers.map(user => `${user.uuid}`);
    participantsIds.push(`${this.conversationProvider.currentLoggedInUserId}`);
    this.conversationProvider
      .getParticipantsData(participantsIds)
      .then(members => {
        loader.dismiss();

        this.viewCtrl.dismiss();
        this.appCtrl.getRootNav().push('ConversationPage', {
          conversationId: null,
          members: members,
          conversationName: this.groupNameBar.name,
          isGroupChatInitialized: false
        });
      })
      .catch(err => {
        loader.dismiss();
        console.error(err);
      });
  }
}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ViewController, ToastController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user-provider';
import { ConversationProvider } from '../../providers/conversation/conversation';
import { User } from '../../models/user';
import * as _ from 'lodash';

/**
 * Generated class for the AddMoreGroupChatMembersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-more-group-chat-members',
  templateUrl: 'add-more-group-chat-members.html',
})
export class AddMoreGroupChatMembersPage {

  searchBar = { name: '', placeholder: 'Search' };
  searchResultUsers: User[] = [];
  selectedUsers: User[] = [];
  conversationData: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userProvider: UserProvider,
    public loadingCtrl: LoadingController,
    public conversationProvider: ConversationProvider,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController
  ) {}



  ionViewDidLoad() {
    console.log('ionViewDidLoad AddMoreGroupChatMembersPage');

    this.conversationData = this.navParams.data;

    console.log('conversationData:', this.conversationData);
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

  addMembers() {
    this.conversationProvider.addParticipantsToConversation(this.selectedUsers, this.conversationData.conversationId);
    this.toastCtrl.create({
      message: 'Successfully added members.',
      duration: 3000
    }).present();
    this.navCtrl.popToRoot();
  }
}

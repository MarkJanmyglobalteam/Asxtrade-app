import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import { StocksProvider } from '../../providers/stocks/stocks';
import moment, { Moment } from "moment";
import firebase from "firebase";
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseStorageProvider } from '../../providers/firebase-storage/firebase-storage';
import { User } from '../../models/user';
import { InAppBrowser } from '@ionic-native/in-app-browser';


/**
 * Generated class for the AddCommentModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-comment-modal',
  templateUrl: 'add-comment-modal.html',
})
export class AddCommentModalPage {
  message: string = '';
  comments: Array<any> = [];
  currentLoggedInUserId = firebase.auth().currentUser.uid;
    
    constructor(public viewCtrl: ViewController, 
      private stockProvider: StocksProvider, 
      public db: AngularFireDatabase,
      private navparams: NavParams,
      private dbStorage: FirebaseStorageProvider,
      private iab: InAppBrowser
      ) {
    this.stockProvider.currentPostComments.subscribe(comments => {
      console.log(comments, 'post comments');
      this.comments = comments;
    })
  }

  ionViewDidLoad() {
    this.message = '';
    console.log('ionViewDidLoad AddCommentModalPage');
  }

  dismiss(shouldSave: boolean) {
    // const data = {
    //   save: shouldSave,
    //   message: this.message.trim()
    // };
    this.viewCtrl.dismiss()
  }
  formatTimestamp(timestamp) {
   return moment(timestamp).fromNow();
  }
  sendMessage(){
    let id$ = firebase.auth().currentUser.uid;
    this.db.list("comments").push({
      user_id: id$,
      post_id: this.navparams.get('post_id'),
      message: this.message,
      created_at: Date.now()
    }).then(()=> this.message = '')
  }
  uploadImageFromCamera() {
    this.dbStorage.uploadImageFromCamera().then(fileData => {
      this.db.list("comments").push({
        user_id: this.currentLoggedInUserId,
        post_id: this.navparams.get('post_id'),
        message: '',
        created_at: Date.now(),
        file: fileData
      }).then(()=> this.message = '')
    });
  }

  uploadImageFromGallery() {
    this.dbStorage.uploadImageFromGallery().then(fileData => {
      this.db.list("comments").push({
        user_id: this.currentLoggedInUserId,
        post_id: this.navparams.get('post_id'),
        message: '',
        created_at: Date.now(),
        file: fileData
      }).then(()=> this.message = '')
    });
  }

  uploadFileFromExplorer() {
    this.dbStorage.uploadFileFromExplorer().then(fileData => {
      this.db.list("comments").push({
        user_id: this.currentLoggedInUserId,
        post_id: this.navparams.get('post_id'),
        message: '',
        created_at: Date.now(),
        file: fileData
      }).then(()=> this.message = '')
    });
  }

  openUrl(url) {
    const browser = this.iab.create(url, "_system");
  }
  
}

import { Component } from '@angular/core';
import { Platform, NavParams, ViewController, LoadingController, ActionSheetController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Camera, CameraOptions } from '@ionic-native/camera';
import firebase from 'firebase';

import { Stock } from '../../models/stock';
import { Stream } from '../../models/stream';

/**
 * Generated class for the StreamModalComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
 @Component({
   selector: 'stream-modal',
   templateUrl: 'stream-modal.html'
 })
 export class StreamModalComponent {

   title: string;
   submitTxt: string;
   post: string;
   postTemp: string;
   postId: string;
   type: string;
   stream: Stream;
   stock: Stock;
   images: Array<any>;

   concatPostAddons(post) {
     post = !post ? '' : post;
  		// return "<span class=\"atwho-inserted\" data-atwho-at-query=\"$" + this.stock.symbol + "\" contenteditable=\"false\"><strong class=\"text\" ng-click=\"symbolClick(&quot;" + this.stock.symbol + "&quot;)\">" + this.stock.symbol + "</strong></span> " + post;
  		return post;
  	}

  	posttype = {
  		create: {
  			title: 'Create Post',
  			submitTxt: 'Share',
  			submitDisabled: () => {
          return (this.post === undefined || this.post.match(/^ *$/) !== null)
        },
        submit: (data) => {
          this.createPost(data);
        }
      },
      edit: {
        title: 'Edit Post',
        submitTxt: 'Save',
        submitDisabled: () => {
          return (this.post == undefined || this.post === this.postTemp || this.post.match(/^ *$/) !== null)
        },
        submit: (data) => {
          this.editSubmit(data);
        }
      },
      repost: {
        title: 'Repost',
        submitTxt: 'Share',
        submitDisabled: () => {
          return false
        },
        submit: (data) => {
          this.repostSubmit(data);
        }
      }
    }

    constructor(
      public platform: Platform,
      public params: NavParams,
      public viewCtrl: ViewController,
      public alertCtrl: AlertController,
      public db: AngularFireDatabase,
      public loadingCtrl: LoadingController,
      private camera: Camera,
      public actionSheetCtrl: ActionSheetController
      ) {

      this.stock = this.params.get('stock');
      this.type = this.params.get('type');
      this.title = this.posttype[this.type].title;
      this.submitTxt = this.posttype[this.type].submitTxt;
      this.images = [];
      this.post = '';
      if(this.params.get('data')) {
        this.stream = this.params.get('data');

        if(this.type == 'edit') {
          this.post = this.stream.post;
          this.postTemp = this.post;
          this.postId = this.stream.post_id;

          this.stream = this.stream.sharedPost ? this.stream.sharedPost : undefined;
        }
      }
    }

    dismissConfirmation() {
      let confirm = this.alertCtrl.create({
        title: 'Discard Changes?',
        message: 'Changes will be discarded, Do you want to continue?',
        buttons: [
        {
          text: 'No',
          handler: () => {

          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.viewCtrl.dismiss();
          }
        }
        ]
      });
      confirm.present();
    }

    dismiss() {
      if(this.post != this.postTemp) {
        this.dismissConfirmation();
      } else {
        this.viewCtrl.dismiss();
      }
    }

    presentActionSheet () {
      let actionSheet = this.actionSheetCtrl.create({
        title: 'Choose destination',
        buttons: [
        {
          text: 'Gallery',
          icon: 'images',
          handler: () => {
            console.log('gallery clicked');
            this.captureImage('PHOTOLIBRARY');
          }
        },{
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            console.log('camera clicked');
            this.captureImage();
          }
        },{
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
        ]
      });
      actionSheet.present();
    }

    captureImage (destination='CAMERA') {
      const sourceType = destination === 'PHOTOLIBRARY' ? this.camera.PictureSourceType.PHOTOLIBRARY : this.camera.PictureSourceType.CAMERA
      const options: CameraOptions = {
        quality: 80,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType
      }

      this.camera.getPicture(options)
      .then((imageData) => {
        let base64Image = 'data:image/jpeg;base64,' + imageData;
        const imageElement = `<img src="${base64Image}" alt="uploaded_img" >`;
        this.post = `${this.post}\n\n[image-${this.images.length}]`;
        this.images.push(imageElement)
      }, (err) => {
       // Handle error
     })
    }

    placeholderForViewing (str) {
      const matches = str.split('[')
      .filter((v) => v.indexOf(']') > -1)
      .map((value) => value.split(']')[0])
      for (var x = 0; x < matches.length; x++) {
        const placeholder = `[${matches[x]}]`
        str = str.replace(placeholder, this.images[x])
      }
      return str
    }

    submitPost(post) {
      this.posttype[this.type].submit(post);
    }

    private repostSubmit(data) {
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      loading.present();

      let post = this.concatPostAddons(data);
      let timestamp = firebase.database.ServerValue.TIMESTAMP;
      let userid = firebase.auth().currentUser.uid;
      this.db.list('/streams')
      .push({
        attached_file: "",
        post: post,
        timestamp: timestamp,
        uid: userid
      })
      .then(response => {
        let key = response.path['pieces_'][1];

        this.db.list('/tags/' + this.stock.symbol + '/post')
        .push({
          post_id: key
        })
        .then(tagsRes => {
          this.db.list('/shares/' + this.stream.post_id)
          .push({
            sharer_id: key,
            timestamp: timestamp,
            uid: userid
          })
          .then(shareRes => {
            this.db.list('/reshares')
            .set(key, {
              timestamp: timestamp,
              post_id: this.stream.post_id
            })
            .then(reshareRes => {
              loading.dismiss();
              this.viewCtrl.dismiss();
            });
          });
        });
      });
    }

    private editSubmit(data) {
      let confirm = this.alertCtrl.create({
        title: 'Edit Post',
        message: 'Are you sure you want to edit this post?',
        buttons: [
        {
          text: 'No',
          handler: () => {

          }
        },
        {
          text: 'Yes',
          handler: () => {
            let loading = this.loadingCtrl.create({
              content: 'Please wait...'
            });

            loading.present();

            let post = this.concatPostAddons(data);
            let timestamp = firebase.database.ServerValue.TIMESTAMP;
            let userid = firebase.auth().currentUser.uid;
            this.db.object('/streams/' + this.postId)
            .set({
              attached_file: "",
              post: post,
              timestamp: timestamp,
              uid: userid
            })
            .then(response => {
              loading.dismiss();
              this.viewCtrl.dismiss();
            });
          }
        }
        ]
      });
      confirm.present();
    }

    private createPost(data) {
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      loading.present();

      let post = this.concatPostAddons(data);
      post = this.placeholderForViewing(post);
      let timestamp = firebase.database.ServerValue.TIMESTAMP;
      let userid = firebase.auth().currentUser.uid;
      this.db.list('/streams')
      .push({
        attached_file: "",
        post: post,
        timestamp: timestamp,
        uid: userid
      })
      .then(response => {
        let key = response.path['pieces_'][1];

        this.db.list('/tags/' + this.stock.symbol + '/post')
        .push({
          post_id: key,
          user_id: firebase.auth().currentUser.uid
        })
        .then(tagsRes => {
          loading.dismiss();
          this.viewCtrl.dismiss();
        });
      });
    }
  }

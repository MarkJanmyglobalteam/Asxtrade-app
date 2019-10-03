import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ActionSheetController } from 'ionic-angular';
import { User } from '../../models/user';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';
import { Subscription } from 'rxjs';
import { FirebaseStorageProvider } from '../../providers/firebase-storage/firebase-storage';
import moment from 'moment';
import { EmailVerificationProvider } from '../../providers/email-verification/email-verification';

/**
 * Generated class for the EditProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {
  user: User;
  user$: User; // dump
  defaultPhotoUrl: string = 'assets/dp-placeholder.png';
  offset: number = 100;
  userSubscription: Subscription;

  maxDate: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: AngularFireDatabase,
    public toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController,
    public dbStorage: FirebaseStorageProvider,
    private emailVerificationProvider: EmailVerificationProvider
  ) {
    this.user = new User({});
    this.user$ = new User({});
  }

  ionViewWillEnter() {
    this.userSubscription = this.db.object(`userData/${firebase.auth().currentUser.uid}`)
      .valueChanges()
      .subscribe(user => {
        this.user = new User(user);
        this.user$ = new User(user);
      });
  }

  ionViewDidLoad() {
    let maxDate = new Date((new Date().getFullYear() - 5), new Date().getMonth(), new Date().getDate());
    this.maxDate = moment(maxDate).format("YYYY-MM-DD");
  }

  ionViewDidLeave() {
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }

  showUploadImageOptions() {
    this.actionSheetCtrl.create({
      title: 'Upload new profile picture',
      buttons: [
        {
          text: 'Upload from image',
          icon: 'camera',
          handler: () => {
            this.dbStorage.uploadImageFromCamera().then(fileData => {
              this.user$.photoUrl = fileData.downloadUrl;
            });
          }
        },
        {
          text: 'Upload from gallery',
          icon: 'image',
          handler: () => {
            this.dbStorage.uploadImageFromGallery().then(fileData => {
              this.user$.photoUrl = fileData.downloadUrl;
            });
          }
        }
      ]
    }).present();
  }

  private password: string;
  async update() {
    firebase.auth().signInWithEmailAndPassword(this.user.email, this.password)
      .then(async user => {
        if (this.user.email.toUpperCase() !== this.user$.email.toUpperCase()) {
          await user.updateEmail(this.user$.email)
            .then(result => {
              this.emailVerificationProvider.sendEmailVerification();
              return result;
            })
            .catch(error => {
              this.user$.email = this.user.email;
              return error;
            });
        }

        console.log('update user:', this.user$);
        this.db.object(`userData/${firebase.auth().currentUser.uid}`).update({
          email: this.user$.email,
          firstname: this.user$.firstname,
          lastname: this.user$.lastname,
          address: this.user$.address,
          fullname: `${this.user$.firstname.toLowerCase()} ${this.user$.lastname.toLowerCase()}`,
          photoUrl: this.user$.photoUrl,
          birthdate: this.user$.birthdate,
          postCode: this.user$.postCode,
          mobileNumber: this.user$.mobileNumber,
          username: this.user$.username
        }).then(() => {
          this.toastCtrl.create({
            duration: 2000,
            position: 'top',
            message: 'Successfully updated profile!'
          }).present();

          this.user = new User(this.user$);
        }).catch(() => {
          this.toastCtrl.create({
            duration: 2000,
            position: 'top',
            message: 'Oops! Something went wrong.'
          }).present();
        });
      })
      .catch(error => {
        this.toastCtrl.create({
          duration: 2000,
          position: 'top',
          message: 'Incorrect password.'
        }).present();
      });
  }

  revert() {
    this.user$ = { ...this.user };
  }
}

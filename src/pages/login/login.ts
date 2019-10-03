import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, Platform, ModalController } from 'ionic-angular';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { UserCredential, Error } from '@firebase/auth-types';
import { AngularFireDatabase } from 'angularfire2/database';

import { UserProvider } from '../../providers/user/user-provider';
import { StocksPage } from '../stocks/stocks';
import { CreateAccountPage } from '../create-account/create-account';
import { TermsAgreementPage } from '../terms-agreement/terms-agreement';
import { ResetPasswordPage } from '../reset-password/reset-password';
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  user = { email: '', password: '' };

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public navParams: NavParams,
    public afAuth: AngularFireAuth,
    public platform: Platform,
    private ref: ChangeDetectorRef,
    public db: AngularFireDatabase,
    public userProvider: UserProvider,
    private modalCtrl: ModalController
  ) {
    this.user.email = window.localStorage.getItem('email');
  }

  signIn(method: String, user: Object) {
    let loader = this.getLoader('Logging in...');
    loader.present();
    let provider = this.getAuthProvider(method);
    if (!provider) {
      this.afAuth.auth
        .signInAndRetrieveDataWithEmailAndPassword(this.user.email, this.user.password)
        .then((userCredential: UserCredential) => {
          window.localStorage.setItem('email', this.user.email);

          console.log('%c signInWithEmailAndPassword success:', 'background: #343434; color: #23aae1', userCredential);
          this.navCtrl.setRoot(HomePage);
          if (userCredential.additionalUserInfo.isNewUser) {
            this.presentToast(`Welcome ${userCredential.user.displayName}!`, 3000);
          }
          else {
            this.presentToast('Welcome back!', 3000);
          }
        })
        .catch((error: Error) => {
          console.log('%c SIGNIN ERROR:', 'background: black; color: red', error);
          loader.dismiss();
          this.presentToast(`User authentication failed! [${error.code}]`);
        });
    }
    else {
      this.afAuth.auth
        .signInWithPopup(provider)
        .then((userCredential: UserCredential) => {
          console.log('login method:', method);
          console.log('%c signInWithPopup result:', 'background: #343434; color: #23aae1', userCredential);
          if (userCredential.additionalUserInfo.isNewUser) {
            this.userProvider.saveUserData(userCredential, method).then(() => {
              this.navCtrl.setRoot(StocksPage);
              this.presentToast(`Welcome ${userCredential.user.displayName}!`, 3000);
              this.modalCtrl.create(TermsAgreementPage, null, {enableBackdropDismiss: false, cssClass: 'terms-agreement-modal'}).present();
            });
          }
          else {
            this.navCtrl.setRoot(StocksPage);
            this.presentToast('Welcome back!', 3000);
          }

          this.ref.detectChanges(); //A fix taken from: https://stackoverflow.com/questions/46479930/signinwithpopup-promise-doesnt-execute-the-catch-until-i-click-the-ui-angular
        })
        .catch((error: Error) => {
          loader.dismiss();
          console.log('signin error', error);
          if(error.code == 'auth/account-exists-with-different-credential') {
            this.presentToast('The email bound to this account is already being used.', 6000);
          }
          else {
            this.presentToast('User authentication failed!');
          }
          this.ref.detectChanges(); //A fix taken from: https://stackoverflow.com/questions/46479930/signinwithpopup-promise-doesnt-execute-the-catch-until-i-click-the-ui-angular
        });
    }
  }

  register() {
    this.navCtrl.push(CreateAccountPage);
  }

  onClickResetPassword() {
    this.navCtrl.push(ResetPasswordPage);
  }

  private getAuthProvider(method: String) {
    switch (method) {
      case 'facebook':
        return new firebase.auth.FacebookAuthProvider();
      case 'twitter':
        return new firebase.auth.TwitterAuthProvider();
      case 'google':
        return new firebase.auth.GoogleAuthProvider();
      default:
        return null;
    }
  }

  private getLoader(content: string, dismissOnPageChange: boolean = true) {
    return this.loadingCtrl.create({
      content: content,
      dismissOnPageChange: dismissOnPageChange
    });
  }

  private presentToast(message: string, duration: number = 3000) {
    let t = this.toastCtrl.create({
      message: message,
      duration: duration,
      position: 'bottom'
    });

    t.present();
  }
}

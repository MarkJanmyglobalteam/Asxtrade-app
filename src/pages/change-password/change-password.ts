import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import * as firebase from 'firebase';

/**
 * Generated class for the ChangePasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-change-password',
    templateUrl: 'change-password.html',
})
export class ChangePasswordPage {
    credential: any = { email: firebase.auth().currentUser.email, password: '' };
    password: any = { current: '', new: '', confirm: '' };

    constructor(
        public navCtrl: NavController,
        public toastCtrl: ToastController,
        public navParams: NavParams
    ) {}

    ionViewDidLoad() {
        // 
    }

    changePassword(password) {
        let user$ = firebase.auth().currentUser;
        console.log(user$.email);
        console.log(password);

        user$
        .reauthenticateWithCredential(
            firebase.auth.EmailAuthProvider.credential(user$.email, password.current)
        ).then(() => {
            if(password.new == '' || password.confirm == '') {
                return this.onError("Passwords must not be empty.");
            }

            if(password.new !== password.confirm) {
                return this.onError("Passwords did not match.");
            }

            user$.updatePassword(password.new)
            .then(() => {
                this.onSuccess();
            }).catch(() => {
                this.onError("Change password transaction failed.");
            });
        }).catch(error => {
            this.onError("Change password transaction failed.");
        });
    }

    onError(message: string) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000,
            position: 'bottom'
        });

        toast.present();
    }

    onSuccess() {
        let toast = this.toastCtrl.create({
            message: 'Your new password has been set.',
            duration: 3000,
            position: 'bottom'
        });

        toast.present();
    }

}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { UserProvider } from '../../providers/user/user-provider';
import { LoginPage } from '../login/login';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';


/**
 * Generated class for the ResetPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {

  public resetpwdForm;
  submitAttempt: boolean = false;
  loading: any;
  email: string;

  constructor(
    public navCtrl: NavController,
    public userService: UserProvider,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController
  ) {
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.resetpwdForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])]
    });
  }


  resetPwd() {
    this.submitAttempt = true;

    if (this.resetpwdForm.valid) {
      let loading = this.loadingCtrl.create({
        content: 'Submitting request...'
      });
      loading.present();

      this.afAuth.auth.sendPasswordResetEmail(this.email).then(res => {
        this.navCtrl.pop();
        this.presentToast('A recovery email has been sent');
        loading.dismiss();
      },
        err => {
          this.presentToast('This email is not registered in the application.');
          loading.dismiss();
        });
    }
  }

  presentToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 3000
    }).present();
  }
}

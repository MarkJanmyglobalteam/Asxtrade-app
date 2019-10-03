import { Component } from '@angular/core';
import { Error, UserCredential } from '@firebase/auth-types';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AlertController, NavController, ToastController, ModalController } from 'ionic-angular';
import { TermsAgreementPage } from '../terms-agreement/terms-agreement';
import { EmailVerificationProvider } from '../../providers/email-verification/email-verification';
import { QuestionnaireBasicPersonalInfoPage } from '../questionnaire-basic-personal-info/questionnaire-basic-personal-info';

/**
 * Generated class for the CreateAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-create-account',
  templateUrl: 'create-account.html'
})
export class CreateAccountPage {
  DEFAULT_STOCKS_PER_USER = [
    'AVZ', 'AMP', 'SCT', 'BIT', 'GXY', 'RAP', 'SUP', 'NST','BHP','CBA','CSL','WPL','NCZ','QBE','RHC','HVN','EUC','TNT','GPX'
  ];


  constructor(
    public nav: NavController,
    public toast: ToastController,
    private alert: AlertController,
    public afAuth: AngularFireAuth,
    public db: AngularFireDatabase,
    private modalCtrl: ModalController,
    private emailVerificationProvider: EmailVerificationProvider) {

    
  }

  submitRegistration(user: UserRegistrationForm) {
    this.afAuth.auth.createUserAndRetrieveDataWithEmailAndPassword(user.email, user.password)
      .then((credentials: UserCredential) => {
        let userId = credentials.user.uid;
        this.db.object(`/userData/${userId}`).set(
          {
            uuid: userId,
            firstname: user.firstName,
            lastname: user.lastName,
            fullname: `${user.firstName} ${user.lastName}`.trim().toLowerCase(),
            email: user.email
          }).then(() => {
            // this.nav.pop();
            // this.presentToast('You have successfully registered!');
            // this.modalCtrl.create(TermsAgreementPage, null, { enableBackdropDismiss: false, cssClass: 'terms-agreement-modal' }).present();

            this.emailVerificationProvider.sendEmailVerification()
              .then(message => {
                this.presentToast(message);
              })

            this.nav.setRoot(QuestionnaireBasicPersonalInfoPage);

          });

        // this.DEFAULT_STOCKS_PER_USER.forEach(stockSymbol => {
        //   this.db.list('/watchlists/' + userId).push({ stock: stockSymbol });
        // });
      })
      .catch((error: Error) => {
        this.presentAlert(error.code, error.message);
      });
    // this.modalCtrl.create(TermsAgreementPage, null, { enableBackdropDismiss: false, cssClass: 'terms-agreement-modal' }).present();

  }

  private presentToast(message: string, duration: number = 3000) {
    let t = this.toast.create({
      message: message,
      duration: duration,
      position: 'top'
    });
    t.present();
  }

  private presentAlert(title: string, message: string) {
    let a = this.alert.create({
      title: title,
      subTitle: message,
      buttons: ['Dismiss']
    });
    a.present();
  }
}

export interface UserRegistrationForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

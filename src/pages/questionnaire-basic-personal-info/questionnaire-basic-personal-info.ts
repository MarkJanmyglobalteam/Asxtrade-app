import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import moment from 'moment';
import { QuestionnaireProvider } from '../../providers/questionnaire/questionnaire';
import { QuestionnaireStockQuestionsPage } from '../questionnaire-stock-questions/questionnaire-stock-questions';
import { AngularFireAuth } from 'angularfire2/auth';
import { EmailVerificationProvider } from '../../providers/email-verification/email-verification';

/**
 * Generated class for the QuestionnaireBasicPersonalInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-questionnaire-basic-personal-info',
  templateUrl: 'questionnaire-basic-personal-info.html'
})
export class QuestionnaireBasicPersonalInfoPage {
  form: BasicPersonalInfoForm = {
    postCode: '',
    birthdate: '',
    mobileNumber: ''
  };
  email:String = this.afAuth.auth.currentUser.email;
  isEmailVerified: boolean = this.afAuth.auth.currentUser.emailVerified;


  maxDate: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public questionProvider: QuestionnaireProvider,
    public afAuth: AngularFireAuth,
    public emailVerificationProvider: EmailVerificationProvider,
    public toast: ToastController
    ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuestionnaireBasicPersonalInfoPage' , this.isEmailVerified);

    let maxDate = new Date((new Date().getFullYear() - 5),new Date().getMonth(), new Date().getDate());
    this.maxDate = moment(maxDate).format("YYYY-MM-DD");
  }

  checkIfEmailVerified(){
    this.afAuth.auth.currentUser.reload().then(() => {
      this.isEmailVerified = this.afAuth.auth.currentUser.emailVerified;
      if(this.isEmailVerified === false) {
        let toas = this.toast.create({
          message: 'Please verify your email to continue.',
          duration: 3000,
          position: 'top'
        })
        toas.present();
      }
    })
    // this.afAuth.authState.subscribe((res) => {
    //   this.isEmailVerified = res.emailVerified;
    //  console.log('ionViewDidLoad QuestionnaireBasicPersonalInfoPage' , res);

    // })

  }
  submitForm() {
    this.questionProvider.submitBasicPersonalInfoAnswers(this.form).then( () => {
      console.log('Questionnare Answered');
      this.navCtrl.setRoot(QuestionnaireStockQuestionsPage);
    }).catch(err => {
      console.error('Questiommare Failed', err);
    })
  }
  resendEmail(){
    this.emailVerificationProvider.sendEmailVerification()
    .then(message => {
      let toast = this.toast.create({
        message: message,
        duration: 3000,
        position: 'top'
      })
      toast.present();
    })
  }
}

interface BasicPersonalInfoForm {
  mobileNumber: string;
  birthdate: string;
  postCode: string;
}

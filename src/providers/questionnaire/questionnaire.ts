import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { ModalController } from 'ionic-angular';
// import { QuestionnaireBasicPersonalInfoPage } from '../../pages/questionnaire-basic-personal-info/questionnaire-basic-personal-info';
// import { QuestionnaireStockQuestionsPage } from '../../pages/questionnaire-stock-questions/questionnaire-stock-questions';
import { AngularFireDatabase } from 'angularfire2/database';

/*
  Generated class for the QuestionnaireProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class QuestionnaireProvider {
  private dbPath = `questionnaires`;  
  private basicPersonalInfoPath = 'basicPersonalInfo';
  private stockQuestionsPath = 'stockQuestions'

  constructor(private db: AngularFireDatabase, private modalCtrl: ModalController) {
    console.log('Hello QuestionnaireProvider Provider');
  }

  // init() {
  //   const currentLoggedInUserId = firebase.auth().currentUser.uid;
  //   let ref = firebase.database().ref(`${this.dbPath}/${currentLoggedInUserId}/`);

  //   ref.child(this.stockQuestionsPath).once('value').then(questionnaire => {
  //     if (!questionnaire.exists()) {
  //       this.openStockQuestionsModal();
  //     }
  //   });

  //   ref.child(this.basicPersonalInfoPath).once('value').then(questionnaire => {
  //     if (!questionnaire.exists()) {
  //       this.openBasicPersonalInfoModal();
  //     }
  //   });
  // }

   async submitBasicPersonalInfoAnswers(answers) {
    const currentLoggedInUserId = firebase.auth().currentUser.uid;
    await this.db.object(`${this.dbPath}/${currentLoggedInUserId}/${this.basicPersonalInfoPath}`).set(answers);
    return this.db.object(`userData/${currentLoggedInUserId}`).update(answers);
  }

  submitStockQuestionsAnswers(answers) {
    const currentLoggedInUserId = firebase.auth().currentUser.uid;
    return this.db.object(`${this.dbPath}/${currentLoggedInUserId}/${this.stockQuestionsPath}`).set(answers);
  }

  // private openBasicPersonalInfoModal() {
  //   let modal = this.modalCtrl.create(QuestionnaireBasicPersonalInfoPage);
  //   modal.onDidDismiss(data => {
  //     this.submitBasicPersonalInfoAnswers(data);
  //   });
  //   modal.present();
  // }

  // private openStockQuestionsModal() {
  //   let modal = this.modalCtrl.create(QuestionnaireStockQuestionsPage);
  //   modal.onDidDismiss(data => {
  //     this.submitStockQuestionsAnswers(data);
  //   });
  //   modal.present();
  // }

}

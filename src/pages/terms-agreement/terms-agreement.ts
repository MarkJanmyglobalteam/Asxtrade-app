import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from 'ionic-angular';
import { HomePage } from '../home/home';

/**
 * Generated class for the TermsAgreementPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-terms-agreement',
  templateUrl: 'terms-agreement.html'
})
export class TermsAgreementPage {
  private isFromMenu = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    if (typeof this.navParams.data === 'boolean') {
      this.isFromMenu = this.navParams.data;
    }

    console.log('IS TERMS ACCEPTED', this.isFromMenu);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TermsAgreementPage');
  }

  gotoHome() {
    this.navCtrl.setRoot(HomePage);
  }
}

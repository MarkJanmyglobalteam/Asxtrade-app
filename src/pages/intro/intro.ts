import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { LoginPage } from '../login/login';

/**
 * Generated class for the IntroPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage {
	@ViewChild(Slides) slides: Slides;
	skipMsg: string = "Skip";

	constructor(public navCtrl: NavController, public navParams: NavParams) {
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad IntroPage');
	}

	skip() {
	    this.navCtrl.setRoot(LoginPage);
	}

	slideChanged() {
	    if (this.slides.isEnd())
	      this.skipMsg = "Alright, I got it";
	}
}

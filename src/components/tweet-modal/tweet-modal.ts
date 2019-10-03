import { Http, Response } from '@angular/http';
import { Component } from '@angular/core';
import { NavParams , ViewController, LoadingController } from 'ionic-angular';
import { ISubscription } from 'rxjs/Subscription';
import { User } from '../../models/user';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { Subscription } from 'rxjs';
import 'rxjs/operator/map';
import { env } from '../../app/app.env';

@Component({
	selector: 'tweet-modal',
	templateUrl: 'tweet-modal.html'
})
export class TweetModalComponent {

	message?: string;
	private subscription: ISubscription;
	userSubscription: Subscription;
	loader: any;
	user: User;

	constructor(
		private view: ViewController,
		public _http: Http,
		public params: NavParams,
		public loadingCtrl: LoadingController,
		public db: AngularFireDatabase,
		) {
		this.userSubscription = this.db.object<User>('/userData/' + firebase.auth().currentUser.uid)
        .valueChanges().subscribe(res => {
            this.user = res;
        });
	}

	closeModal() {
		this.view.dismiss(null);
	}

	tweet () {
		const finalMessage = `${this.user.firstname} ${this.user.lastname}: ${this.message}`;
		const url = `${env.URL.dev}/api/twitter-post?msg=${finalMessage}`;
		return this._http.get(url)
		.map((response: Response) => response.json());
	}

	postTweet () {
		if (!this.message) {
			return;
		} else {
			this.presentLoading();
			const symbol = this.params.data.symbol;
			if (this.message.includes(`$${symbol}`)) {
				this.subscription = this.tweet().subscribe((response: any) => {
					this.loader.dismiss();
					this.view.dismiss(response);
					this.message = '';
					this.subscription.unsubscribe();
				})
			} else {
				if(this.message.includes(symbol)) {
					this.message = this.message.replace(symbol, `$${symbol}`)
				} else {
					this.message = `${this.message} $${symbol}`;
				}
				this.subscription = this.tweet().subscribe((response: any) => {
					this.loader.dismiss();
					this.view.dismiss(response);
					this.message = '';
					this.subscription.unsubscribe();
				})
			}
			this.userSubscription.unsubscribe();
		}
	}

	presentLoading() {
		this.loader = this.loadingCtrl.create({
			content: "Please wait..."
		});
		this.loader.present();
	}
}

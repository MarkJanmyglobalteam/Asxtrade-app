import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';

import { ISubscription } from 'rxjs/Subscription';

import 'rxjs/operator/map';
import moment from 'moment';
import { env } from '../../app/app.env';

@Injectable()
export class TwitterProvider {

	symbol: string;
	limit: number = 0;
	sinceId: number;
	maxId: number = 0;
	tweets: Array<any>;
	private subscription: ISubscription;
	private timelineSubscription: ISubscription;

	constructor(public _http: Http) {}

	initializeTweets () {
		const url = `${env.URL.dev}/api/twitter-search?q=${this.symbol}&count=${this.limit}&max_id=${this.maxId}`;
		console.log(url)
		return this._http.get(url)
		.map((response: Response) => response.json());
	}

	setMaxId (maxId=null) {
		this.maxId = maxId;
	}

	fetchTweets(symbol: string, tweetLimit: number = 0, maxId = null) {
	    this.symbol = symbol;
	    return new Promise((resolve, reject) => {
	        this.subscription = this.initializeTweets().subscribe((response: any) => {
	            let streams = [];
              streams.length = 0;
              if (response.statuses.length > 0) {
                this.setMaxId(response.statuses.slice(-1)[0].id);
                streams = response.statuses.map((status) => {
	                // console.log(status)
	                // hack for counting likes and shares
	                const likes = [];
	                const retweets = [];
	                likes.length = status.favorite_count;
	                retweets.length = status.retweet_count;
	                // hack for counting likes and shares
	                let post = (status.hasOwnProperty('retweeted_status')) ? `${status.full_text.substr(0, status.full_text.indexOf(':'))}: ${status.retweeted_status.full_text}` : status.full_text;
	                if (status.entities.hasOwnProperty('media')) {
	                    for (let x = 0; x < status.entities.media.length; x++) {
	                        post += `<br><br><img src="${status.entities.media[x].media_url}">`
	                    }
	                }
	                return {
	                    timestamp: status.created_at,
	                    post,
	                    likes,
	                    retweets,
	                    user: {
	                        id: status.user.id,
	                        photoUrl: status.user.profile_image_url,
	                        firstname: status.user.name,
	                        lastname: null
	                    },
	                    uid: status.id,
	                    tweet: true,
	                    timeago: moment(status.created_at).startOf('hour').fromNow()
	                }
	              })
              }
	            this.subscription.unsubscribe();
	            resolve(streams)
	        })
	    })
	}


	ngOnDestroy() {
	  this.subscription.unsubscribe();
	  this.timelineSubscription.unsubscribe();
	  this.maxId = null;
	}

	unsubscribeFromTweets () {
		this.subscription.unsubscribe();
		this.timelineSubscription.unsubscribe();
	}

	getParameterByName (name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	initializeTimelineTweets (symbol) {
		const url = `${env.URL.dev}/api/statuses/${symbol}`;
		console.log(url)
		return this._http.get(url)
		.map((response: Response) => response.json() );
	}

	fetchTimelineTweets(symbol: string, tweetLimit: number = 0, maxId = null) {
	    return new Promise((resolve, reject) => {
	        this.timelineSubscription = this.initializeTimelineTweets(symbol).subscribe((response: any) => {
	            let streams = response.map((status) => {
	                // console.log(status)
	                // hack for counting likes and shares
	                const likes = [];
	                const retweets = [];
	                likes.length = status.favorite_count;
	                retweets.length = status.retweet_count;
	                // hack for counting likes and shares
	                let post = (status.hasOwnProperty('retweeted_status')) ? `${status.full_text.substr(0, status.full_text.indexOf(':'))}: ${status.retweeted_status.full_text}` : status.full_text;
	                if (status.entities.hasOwnProperty('media')) {
	                    for (let x = 0; x < status.entities.media.length; x++) {
	                        post += `<br><br><img src="${status.entities.media[x].media_url}">`
	                    }
	                }
	                return {
	                    timestamp: status.created_at,
	                    post,
	                    likes,
	                    retweets,
	                    user: {
	                        id: status.user.id,
	                        photoUrl: status.user.profile_image_url,
	                        firstname: status.user.name,
	                        lastname: null
	                    },
	                    uid: status.id,
	                    tweet: true,
	                    timeago: moment(status.created_at).startOf('hour').fromNow()
	                }
	            });
	            this.timelineSubscription.unsubscribe();
	            resolve(streams);
	        })
	    })
	}



}

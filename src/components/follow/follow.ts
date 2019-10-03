import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';
import * as _ from 'underscore/underscore';

import { StocksProvider } from '../../providers/stocks/stocks';

/**
 * Generated class for the FollowComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'follow',
  templateUrl: 'follow.html'
})
export class FollowComponent {

    users: any = {
    	obs: [],
        list: [],
        totalPage: 0,
        offset: 0,
        limit: 10,
        preLoader: true
    };

    getFollowingUser() {
        this.users.obs = this.db.list('/followData/' + firebase.auth().currentUser.uid).valueChanges();
        this.users.obs.subscribe(res => {
        	this.users.list = [];
        	 _.where(res, { type: 'following' })
	    		.map(following => {
	        		this.StocksProvider.getUserData(following)
		        		.then(response => {
		        			this.users.list.push(response);
		        		});
	        	})
        })
    }

  	constructor(
        public StocksProvider: StocksProvider,
        public db: AngularFireDatabase
    ) {
  		this.getFollowingUser();
  	}

}

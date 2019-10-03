import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';

import { ISubscription } from 'rxjs/Subscription';

import 'rxjs/operator/map';
import { env } from '../../app/app.env';

/*
  Generated class for the AsxScrapesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AsxScrapesProvider {
  private announcementsSubscription: ISubscription;
  private moversSubscription: ISubscription;
  private gainersSubscription: ISubscription;
  private losersSubscription: ISubscription;
  readonly ROOT_URL: string = env.URL.dev;

  constructor(public _http: Http) {
    console.log('Hello AsxScrapesProvider Provider');
  }

  private initializeAnnouncements(companyTicker) {
    const url = `${this.ROOT_URL}/api/company-asx-announcements/${companyTicker}`;
    return this._http.get(url).map((response: Response) => response.json());
  }

  fetchAnnouncements(companyTicker) {
    return new Promise((resolve, reject) => {
      this.announcementsSubscription = this.initializeAnnouncements(companyTicker).subscribe(
        (response: any) => {
          resolve(response);
        }
      );
    });
  }

  private initializeMovers() {
    const url = this.ROOT_URL + '/api/top-movers';
    return this._http.get(url).map((response: Response) => response.json());
  }

  fetchMovers() {
    return new Promise((resolve, reject) => {
      this.moversSubscription = this.initializeMovers().subscribe(
        (response: any) => {
          resolve(response);
        }
      );
    });
  }

  private initializeGainers() {
    const url = this.ROOT_URL + '/api/top-gainers';
    return this._http.get(url).map((response: Response) => response.json());
  }

  fetchGainers() {
    return new Promise((resolve, reject) => {
      this.gainersSubscription = this.initializeGainers().subscribe(
        (response: any) => {
          resolve(response);
        }
      );
    });
  }

  private initializeLosers() {
    const url = this.ROOT_URL + '/api/top-losers';
    return this._http.get(url).map((response: Response) => response.json());
  }

  fetchLosers() {
    return new Promise((resolve, reject) => {
      this.losersSubscription = this.initializeLosers().subscribe(
        (response: any) => {
          resolve(response);
        }
      );
    });
  }

  destroySubscriptions() {
    if (this.moversSubscription) this.moversSubscription.unsubscribe();
    if (this.gainersSubscription) this.gainersSubscription.unsubscribe();
    if (this.losersSubscription) this.losersSubscription.unsubscribe();
  }
}

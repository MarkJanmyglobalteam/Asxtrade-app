import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';

import { StockviewPage } from '../../pages/stockview/stockview';
import { StocksProvider } from '../../providers/stocks/stocks';
import { AsxScrapesProvider } from '../../providers/asx-scrapes/asx-scrapes';
import { Subscription } from 'rxjs';

/**
 * Generated class for the TopMoversComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'top-movers',
  templateUrl: 'top-movers.html'
})
export class TopMoversComponent {
  stockPage = StockviewPage;
  stocks: any = {
    obs: [],
    list: [],
    preLoader: true
  };
  $subscription: Subscription;
  moversList: any;
  movers = {
    gainers: [],
    losers: []
  };

  RealtimeStockSymobolsToString: string = '';
  RealtimeStockPrices: Array<any> = [];

  constructor(
    public StocksProvider: StocksProvider,
    public db: AngularFireDatabase,
    private _asxScrapesProvider: AsxScrapesProvider
  ) {
    this.moversList = 'gainers';
   this.$subscription = this.StocksProvider.topMoverStocksStorage.subscribe(res => {
      if(Object.keys(res).length) {
        res = this.paginateArray(res, 15, 1);
        this.movers.gainers = res;
        this.stocks.list = res;
        console.log(res , 'gainers')
        // this.stocks.preLoader = false;
      }
    })
  this.$subscription.add(  this.StocksProvider.topLoserStocksStorage.subscribe(res => {
    console.log(res,'losers subscriber')
    if(Object.keys(res).length) {
      console.log(res,'losers subscriber')
      res = this.paginateArray(res, 15, 1);
      this.movers.losers = res;
      this.stocks.preLoader = false;
    }
  }))
    // this.getGainers();
  }

  ionViewWillLeave() {
    // this._asxScrapesProvider.destroySubscriptions();
    this.$subscription.unsubscribe();

  }

  getMovers() {
    this._asxScrapesProvider.fetchMovers().then(response => {
      this.StocksProvider.getSymbolByCode(response, 'top-movers').then(res => {
        this.stocks.list = res;
        this.stocks.preLoader = false;
      });
    });
  }

  async getGainers() {
    try {
      const response = await this._asxScrapesProvider.fetchGainers();
      console.log(response, 'gainers');
      const companies = await this.StocksProvider.getCompanyDataByName(
        response
      );
      console.log(companies, 'gainers');
      this.RealtimeStockSymobolsToString = '';
      for ( const trend of companies as Array<any>) {
      this.RealtimeStockSymobolsToString += `,${trend.stock}.AU`;
      }
      console.log(this.RealtimeStockSymobolsToString, 'gainers');
      this.StocksProvider.RealtimeStockPrices = await this.StocksProvider
      .loadRealtimeStockPrices(this.RealtimeStockSymobolsToString.substr(1)).toPromise();
      console.log(this.StocksProvider.RealtimeStockPrices, 'gainer Realtime')
      const stocks = await this.StocksProvider.getSymbolByCode(
        companies,
        'top-gainers'
      );
      console.log(stocks, 'gainers');
      this.stocks.list = stocks;
      console.log('stocks list:', this.stocks.list);
      this.stocks.preLoader = false;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getLosers() {
    try {
      const response = await this._asxScrapesProvider.fetchLosers();
      const companies = await this.StocksProvider.getCompanyDataByName(
        response
      );
      const stocks = await this.StocksProvider.getSymbolByCode(
        companies,
        'top-losers'
      );
      this.stocks.list = stocks;
      this.stocks.preLoader = false;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  onSegmentChanged($event) {
    // this.stocks.preLoader = true;
    // this._asxScrapesProvider.destroySubscriptions();
    // this.stocks.list.length = 0;
    // if ($event.value === 'all') {
    //     this.getMovers();
    // }
    console.log($event);
    if ($event.value === 'gainers') {
      // this.getGainers();
      this.stocks.list = this.movers.gainers;
    } else if ($event.value === 'losers') {
      // this.getLosers();
      this.stocks.list = this.movers.losers;

    }
  }

  formatVolume(volume) {
    volume = +volume;
    if (isNaN(volume)) {
      return 'NA';
    }

    if (volume >= 1000000) {
      volume = volume / 1000000;
      volume = `${volume.toFixed(0)}M`;
    } else {
      volume = volume / 1000;
      volume = `${volume.toFixed(0)}K`
    }

    return volume;
  }

  formatMove(value, descPlace) {
    if(descPlace){
      return this.StocksProvider.abbrNum(value, descPlace);
    } else {
      return value;
    }
  }

  navigateToStockPage(stock) {
    this.StocksProvider.navigateToStockPage(this.stockPage, stock);
  }
  paginateArray (array, page_size, page_number) {
    --page_number; // because pages logically start with 1, but technically with 0
    return array.slice(page_number * page_size, (page_number + 1) * page_size);
  }
}

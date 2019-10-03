import { Component, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';
import * as _ from 'lodash';

import { StockviewPage } from '../../pages/stockview/stockview';
import { StocksProvider } from '../../providers/stocks/stocks';
import { Subscription } from 'rxjs';
import { Stock, ShareValue, Portfolio } from '../../models/stock';
import { PortfolioViewPage } from '../../pages/portfolio-view/portfolio-view';
import { RankingComponent } from '../ranking/ranking';
import { UserProvider } from '../../providers/user/user-provider';

/**
 * Generated class for the PortfolioComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'portfolio',
  templateUrl: 'portfolio.html'
})
export class PortfolioComponent implements OnDestroy {
  private portfolioBoards = ['Main', 'SMSF', 'Trading'];
  private portfolios: object = {};
  private selectedBoard: string;
  stockModel : ShareValue = new ShareValue;
  stockPortfolioModel : Portfolio = new Portfolio();
  portfolioStocks: Array<any>;
  stockPage = StockviewPage;
  symbols: any = [];
  stocks: any = {
    obs: [],
    list: [],
    preLoader: true
  };

  stocksSubscription: Subscription;
  portfolioSubscription: Subscription;
  rankingSubscription: Subscription;
  $subscription: Subscription;

  rankingText: string;
  watchlistRealtimeStockSymobolsToString: string = '';
  private userId: string = firebase.auth().currentUser.uid;

  constructor(
    public StocksProvider: StocksProvider,
    public db: AngularFireDatabase,
    private userProvider: UserProvider
  ) { 
  }

  ngOnInit() {
    this.portfolioBoards =  ['Main', 'SMSF', 'Trading'];
    this.$subscription = this.StocksProvider.portfolioStocksStorage.subscribe(res => {
      console.log(res,'res por')
      if(Object.keys(res).length){
          this.portfolios = res;
          this.onBoardChanged("Main");
          // this.getRanking();
      } 
    })
    this.$subscription.add(
      this.StocksProvider.isPortfolioLoader.subscribe((isloading) => {
        console.log(isloading, 'isloading')
        if(!isloading){
          this.stocks.preLoader = false;
        } else {
          this.stocks.preLoader = true;
        }
      })
    )
    // this.getUserPortfolios();
  }

  private initialize() {
    // this.StocksProvider.getSymbols().then(result => {
      // this.symbols = result;
      // this.getPortfolio().then(() => {
      //   this.stocks.preLoader = false;
      //   console.log(this.stocks ,'stocks initialize');
      // });
    // });
  }

  ionViewDidLeave() {
    this.ngOnDestroy();
  }

  ngOnDestroy() {
    this.$subscription.unsubscribe();
    if (this.stocksSubscription) {
      this.stocksSubscription.unsubscribe();
      console.log('stocksSubscription unsubscribe   ')
    }

    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }

    if (this.rankingSubscription) {
      this.rankingSubscription.unsubscribe();
    }
  }
  getUserPortfolios() {
    this.db.object('/portfolios/'+this.userId)
    .valueChanges()
    .subscribe(async userPortfolios => {
      console.log(userPortfolios);
      for(let portfolio in userPortfolios) {
        // console.log(userPortfolios[portfolio]);
          this.stocks.list.push(userPortfolios[portfolio]);
      }
      this.onBoardChanged(this.portfolioBoards[0]);
      this.stocks.preLoader = false;
    });
  }

  // /// Edit ya pa bukas
  // getPortfolio() {
  //   return new Promise((resolve, reject) => {
  //     this.stocks.obs = this.db
  //       .list('/portfolios/' + this.userId)
  //       .valueChanges();
  //      this.stocksSubscription = this.stocks.obs.subscribe(async res => {
  //       const defaultBoard = this.portfolioBoards[0];
  //       console.log('portfolios', res);
  //       if(res.length) {
  //         for (let portfolio of res) {
  //           this.watchlistRealtimeStockSymobolsToString = '';
  //           this.watchlistRealtimeStockSymobolsToString += `,${portfolio.stock}.AU`;
  //           let board = portfolio.portfolio || defaultBoard;
  
  //           this.portfolios[board] = this.portfolios[board] || [];
  //           this.portfolios[board].push(portfolio);
  //         }
  //         this.StocksProvider.watchlistRealtimeStockPrices = await this.StocksProvider
  //             .loadRealtimeStockPrices(this.watchlistRealtimeStockSymobolsToString.substr(1)).toPromise();
  //             console.log(this.portfolios,' ')
  //         for (let board in this.portfolios) {
  //           let response = await this.StocksProvider.getSymbolByCode(
  //             this.portfolios[board],
  //             "portfolio"
  //           );
  //           this.portfolios[board] = _.sortBy(response, ["symbol"]);
  //         }
  //         console.log(this.portfolios , 'response');
  //         this.StocksProvider.portfolioStocksStorageSource.next(this.portfolios);
  //         this.onBoardChanged(defaultBoard);
  //         this.getRanking();
  //         resolve();
  //       } else {
  //         resolve();
  //       }
       
  //     }, reject);
  //   });
  // }

  private onBoardChanged(board) {
    console.log("onBoardChanged", board);
    this.selectedBoard = board;
    // this.portfolioStocks = this.stocks.list.filter( res => {
    //   console.log(res);
    //   return res.portfolio === board;
    // } )
    // console.log(this.portfolios, 'this.portfolios');
    this.stocks.list = this.portfolios[board] || [];
    // console.log( this.stocks , ' this.stocks')
  }

  formatNumber(value: number, decimalCount?) {
    let isNegative = false;
    value = isNaN(value) ? 0 : value;
    if(decimalCount) {
     if(value < 0) {
       value = Math.abs(value);
       isNegative = true;
     } else {
       value = value;
     }
     value = this.abbrNum(value, decimalCount).toLocaleString('en', { maximumFractionDigits: decimalCount, minimumFractionDigits: decimalCount });
      return isNegative ? '-' + value : value ;
    } else {
      return value.toLocaleString('en', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
    }
  }

  navigateToStockPage(stock) {
    this.StocksProvider.navigateToStockPage(this.stockPage, stock);
  }

  navigateToPortfolioViewPage(stock) {
    console.log(stock, 'stock.portfolioData')
    if (stock.portfolioData) {
      this.StocksProvider.navigateToStockPage(PortfolioViewPage, stock);
    }
    // if (data) {
    //   console.log(data , 'data');
    //   this.StocksProvider.navigateToStockPage(PortfolioViewPage, data);
    // }
  }
  get totalMarketValue() {
    let calculated = 0;

    (<Stock[]>this.stocks.list).filter(x => !!x.portfolioData)
      .forEach(x => calculated += x.portfolioData.calculateMarketValue(x.close));

    return calculated;
  }

  get totalProfit() {
    let calculated = 0;

    (<Stock[]>this.stocks.list).filter(x => !!x.portfolioData)
      .forEach(x => calculated += x.portfolioData.calculateProfit(x.close));

    return `$${this.formatNumber(calculated, 1)}`;
  }

  get profitStatus() {
    let value = parseFloat(this.totalProfit.slice(1));
    return value > 0 ? 'up' : value < 0 ? 'down' : '';
  }

  private getPortfolioProfitStatus(stock: Stock) {
    if (stock && stock.portfolioData) {
      let value = stock.portfolioData.calculateProfit(stock.close);
      return value > 0 ? 'up' : value < 0 ? 'down' : '';
    }

    return '';
  }

  get totalProfitPercent() {
    let marketValue = this.totalMarketValue;
    let invested = this.totalInvested;
    let calculated = ((marketValue / invested) - 1) * 100;
    calculated = isNaN(calculated) ? 0 : calculated;

    return `${this.formatNumber(calculated)}%`;
  }

  get totalInvested() {
    let calculated = 0;

    (<Stock[]>this.stocks.list).filter(x => !!x.portfolioData)
      .forEach(x => calculated += x.portfolioData.calcuteAcqPrice());

    return calculated;
  }

  private getRanking() {
    let rankingComponent = new RankingComponent(this.db, this.userProvider, this.StocksProvider);
    this.rankingSubscription = rankingComponent.getRankingValues()
      .subscribe(rankValues => {
        let rank = rankValues.find(x => !!x.userIds.find(y => y === this.userId));

        if (rank) {
          this.rankingText = `Top ${this.formatNumber(rank.percentage)}% (${rank.rank}/${rank.max})`;
        }
      });
  }

  getTotalShares( shares: Array<any> ) {
    // console.log(shares , 'shares')
    let a = 0;
    shares.forEach(share => {
      a+=share.shareCount;
    });

    return a;
  }
  abbrNum(number, decPlaces) {
    const orig = number;
    const dec = decPlaces;
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10, decPlaces);

    // Enumerate number abbreviations
    const abbrev = ["k", "m", "b", "t"];

    // Go through the array backwards, so we do the largest first
    for (var i = abbrev.length - 1; i >= 0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10, (i + 1) * 3);

        // If the number is bigger or equal do the abbreviation
        if (size <= number) {
            // Here, we multiply by decPlaces, round, and then divide by decPlaces.
            // This gives us nice rounding to a particular decimal place.
             number = Math.round(number * decPlaces / size) / decPlaces;

            // Handle special case where we round up to the next abbreviation
            if((number == 1000) && (i < abbrev.length - 1)) {
                number = 1;
                i++;
            }

            // console.log(number);
            // Add the letter for the abbreviation
            number += abbrev[i];

            // We are done... stop
            break;
        }
    }

    // console.log('abbrNum('+ orig + ', ' + dec + ') = ' + number);
    return number;
}
 

}

import { ActionSheetController, ModalController, AlertController, NavController, App } from 'ionic-angular';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as _ from 'underscore/underscore';
import firebase from "firebase";
import * as l from "lodash";
import { Stock, Portfolio } from '../../models/stock';
import { Stream } from '../../models/stream';
import { BehaviorSubject } from 'rxjs';
import { env } from '../../app/app.env';
import { AsxScrapesProvider } from '../asx-scrapes/asx-scrapes';
import { map } from "rxjs/operators";
import { ConversationPageModule } from '../../pages/conversation/conversation.module';



/*
  Generated class for the StocksProvider provider.
67
  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StocksProvider {

    static readonly BASE_URL: String = 'https://cors-anywhere.herokuapp.com/https://eodhistoricaldata.com/api/real-time/'
    static readonly API_TOKEN: String = '5a4c5a8b13c90';
    defaultWatchlist = [ 
    {stock: "AVZ" , list: 'List'},
    {stock: "AMP" , list: 'List'},
    {stock: "SCT" , list: 'List'},
    {stock: "BIT" , list: 'List'},
    {stock: "GXY" , list: 'List'},
    {stock: "RAP" , list: 'List'},
    {stock: "SUP" , list: 'List'},
    {stock: "NST" , list: 'List'},
    {stock: "BHP" , list: 'List'},
    {stock: "CBA" , list: 'List'},
    {stock: "CSL" , list: 'List'},
    {stock: "WPL" , list: 'List'},
    {stock: "NCZ" , list: 'List'},
    {stock: "QBE" , list: 'List'},
    {stock: "RHC" , list: 'List'},
    {stock: "HVN", list: 'List'},
    {stock: "EUC" , list: 'List'},
    {stock: "TNT" , list: 'List'},
    {stock: "GPX" , list: 'List'},
    {stock: "MZZ" , list: 'List'}

    ];
    defaultWatchlistToString = 'GGX.AU,DTR.AU,RNY.AU,LKO.AU,TKM.AU,GLA.AU,AUQ.AU,PCL.AU,EQE.AU,9SP.AU,RD1.AU,GML.AU,TNP.AU,DSE.AU,CAV.AU,RIM.AU,OGX.AU,SF1.AU,AHQ.AU,E2E.AU,MSR.AU,UTR.AU,QFY.AU,BNL.AU,MCT.AU,CDY.AU,IAM.AU,SUR.AU,MOQ.AU,PRZ.AU,AMB.AU,PWN.AU,B2Y.AU,RLC.AU,MEB.AU,TGM.AU,XF1.AU,BSX.AU,IXU.AU,LCK.AU,CMC.AU';
    stocksStorage: Array<Stock> = [];
    watchlistBoards;
    stocks: Array<Stock> = [];
    streams: Array<Stream> = [];
    private watchlist: Array<Stock> = [];
    private trending: Array<Stock> = [];
    watchlistStocksStorageSource = new BehaviorSubject({});
    watchlistStocksStorage = this.watchlistStocksStorageSource.asObservable();
    portfolioStocksStorageSource = new BehaviorSubject({});
    portfolioStocksStorage = this.portfolioStocksStorageSource.asObservable();
    trendingStocksStorageSource = new BehaviorSubject({});
    trendingStocksStorage = this.trendingStocksStorageSource.asObservable();
    topMoverStocksStorageSource = new BehaviorSubject([]);
    topMoverStocksStorage = this.topMoverStocksStorageSource.asObservable();
    topLoserStocksStorageSource = new BehaviorSubject([]);
    topLoserStocksStorage = this.topLoserStocksStorageSource.asObservable();
    isWatchlistLoaderSource = new BehaviorSubject(true);
    isWatchlistLoader = this.isWatchlistLoaderSource.asObservable();
    isPortfolioLoaderSource = new BehaviorSubject(true);
    isPortfolioLoader = this.isPortfolioLoaderSource.asObservable();
    RealtimeStockPrices: Array<any> = [];
    watchlistStocks: Object;
    portfolioStocks: Object;
    trendingStocks: Object;
    symbols: any = [];
    response: any = {
        offset: 0,
        symbols: []
    }

   //global
   RealtimeStockSymobolsToString: string = '';

  //portfolio
  private portfolios: object = {};

  //watchlist
  isWatchlisAlreadyUpdating:boolean;
    watchedList: Array<any> = [];
    watchedListKeys: Array<any> = [];
  
  //postComments
  currentPostCommentsSource = new BehaviorSubject([]);
  currentPostComments = this.currentPostCommentsSource.asObservable();
  
  //ranking 
  userPortfolios: Object = {};
  private rankingValuesMainSource = new BehaviorSubject<RankValue[]>([]);
  private rankingValuesMain = this.rankingValuesMainSource.asObservable();
  
  private rankingValuesSMSFSource = new BehaviorSubject<RankValue[]>([]);
  private rankingValuesSMSF = this.rankingValuesSMSFSource.asObservable();

  private rankingValuesTradingSource = new BehaviorSubject<RankValue[]>([]);
  private rankingValuesTrading = this.rankingValuesTradingSource.asObservable();



    constructor(
        public http: Http,
        public db: AngularFireDatabase,
        public ActionSheetController: ActionSheetController,
        public ModalController: ModalController,
        public alertCtrl: AlertController,
        private app: App,
        private _asxScrapesProvider: AsxScrapesProvider
    ) {
    }

    loadSymbols() {
        return new Promise(resolve => {
            const url = env.URL.dev + '/api/companies';
            this.http.get(url)
                .map(res => res.json())
                    .subscribe(data => {
                        this.symbols = data;
                        resolve(data);
                    });
        })
    }

    getSymbols() {
        return new Promise(resolve => {
            if (this.symbols.length === 0) {
              this.loadSymbols().then(() => {
                resolve(this.symbols);
              });
            } else {
              resolve(this.symbols);
            }
        });
    }

    getSymbolsByOffset(offset, limit) {
        return new Promise(resolve => {
            for (let i = 0; i < limit; i++) {

                var stockStorage = _.findWhere(this.stocks, { symbol: this.symbols[offset] });
                if(!stockStorage){
                    var stockInstance = new Stock(this.symbols[offset], this.http, this.db, this, this.ActionSheetController, this.ModalController, this.alertCtrl);
                    this.stocks.push(stockInstance);
                    this.stocksStorage.push(stockInstance);
                } else {
                    this.stocks.push(stockStorage);
                }

                offset++;
                if(i >= (limit - 1)) {
                    resolve(this.stocks);
                }
            }
        });
    }

    unsubscribeStocksWatchlist() {
      console.log('starting unsubscribe', this.stocksStorage);
      this.stocksStorage.forEach(item => { console.log('unsubscribing stock subscriptions'); item.unsubscribeSubscriptions(); });
    }

    getSymbolByCode(stocks, type, userId? ) {
        return new Promise( async resolve => {
            this[type] = [];
            console.log(this);

           for( const stock of stocks ) {
                var stockStorage = _.findWhere(this.stocksStorage, { symbol: stock.stock, portfolio: stock.portfolio});

                if(!stockStorage){
                  if (stocks.length<5) {
                    this.RealtimeStockSymobolsToString = '';
                    this.RealtimeStockSymobolsToString += `,${stock.stock}.AU`;

                    console.log(this.RealtimeStockSymobolsToString.substr(1), 'watchlistRealtimeStockSymobolsToString')
                    this.RealtimeStockPrices = await this
                      .loadRealtimeStockPrices(this.RealtimeStockSymobolsToString.substr(1)).toPromise();
                  }
                  
                    var symbolStorage = _.findWhere(this.symbols, { symbol: stock.stock || stock.symbol });
                    // var symbolStorage = stock;
                    if (symbolStorage) {
                      var stockInstance = new Stock(symbolStorage, this.http, this.db, this, this.ActionSheetController, this.ModalController, this.alertCtrl, userId, stock.portfolio, this.RealtimeStockPrices);
                    await stockInstance.setValue(symbolStorage);
                    this[type].push(stockInstance);
                    this.stocksStorage.push(stockInstance);
                  
                    //  stockInstance.setValue().then((res)=> {
                    //      console.log(res,'then')
                        
                    //  }).catch(err => {
                    //      console.log(err, 'error')
                    //  });
                     
                    } else {
                      console.error('Stock info not found for:', stock);
                    }
                } else {
                    console.log('already')
                    this[type].push(stockStorage);
                }
           
            }
            this[type] = this[type].filter(stock => !!stock);
            resolve(this[type]);
        });
    }

    getCompanyDataByName(stocks) {
        return new Promise((resolve) => {
            let symbols = [];
            console.log(this.symbols,'this.symbols')
            stocks.forEach((stock) => {
                const companyIndex = this.symbols.findIndex((company) => {
                   let companyName = company.name.toLowerCase().replace(' ltd', '');
                   companyName = company.name.toLowerCase().replace(' limited', '');
                   return companyName === stock.name;
                });
                if (companyIndex >= 0) {
                    symbols.push(this.symbols[companyIndex]);
                }
            });
            symbols = symbols.map((symbol) => {
                const data = {
                    stock: symbol.symbol,
                    name: symbol.name
                };
                return data;
            });
            resolve(symbols);
        });
    }

    getUserData(following) {
        return new Promise(resolve => {
            this.db.object('/userData/' + following.uid).valueChanges()
                .subscribe(res => {
                    resolve(res);
                });
        });
    }

    // TODO: Change this as this is bad practice
    navigateToStockPage(stockPage, stock) {
      console.log(stockPage);
      console.log(stock);
      this.app.getActiveNav().push(stockPage, stock);
    }

    loadRealtimeStockPrices(symbols){
        console.log(symbols,'json')
        let url =  StocksProvider.BASE_URL + "AVZ.AU?api_token=" + StocksProvider.API_TOKEN + "&fmt=json&s=" + symbols;
        console.log(url, 'json')
        // return new Promise( (resolve,reject) => {
        return (this.http.get(url).map(res => res.json()));
        // })
    }
    getWatchlist() {
        return new Promise( async (resolve, reject) => {
            let watchlist: Array<any> = [];
            let watchlistBoards;
            console.log(firebase.auth().currentUser.uid, 'obs id')
            let res = await this.db.list("/watchlists/" + firebase.auth().currentUser.uid)  .snapshotChanges()
            .pipe(map(items => {            // <== new way of chaining
              return items.map(a => {
                const data = a.payload.val();
                const key = a.payload.key;
                return {board: key, data};           // or {key, ...data} in case data is Obj
              });
            }))
            .subscribe(async (res: Array<any>) => {
            // res = res.map( (val, index) => ({ data: Object.keys(val.data).map(key => res[index].data[key])[0], key: Object.keys(val.data)[0]}) );
            console.log(res, 'obs')
            res = res.map((val,index) => ( { data: Object.keys(val.data).map(key => ({ data: res[index].data[key] , key: key}) ) }))
            let newRes: Array<any> = [];
            res.forEach(val => {
              newRes = newRes.concat(val.data);
            })
            console.log(newRes, 'obs origin2')
            this.isWatchlisAlreadyUpdating = true;
            console.log(res.map((val) => (val.data)), 'obs data')
            console.log(this.defaultWatchlist, 'obs data')
            this.watchedList = this.defaultWatchlist.concat(newRes.map((val) => (val.data)));
            this.watchedListKeys = newRes;
            this.isWatchlistLoaderSource.next(true);
            console.log(this.watchedListKeys ,'obs')
            console.log(this.watchedList, 'obs')
            });
            // if( isAlreadyUpdating) {
            //   boards  = await new Promise((resolve, reject) => {
            //     this.db.list(`watchlistBoards/${firebase.auth().currentUser.uid}`)
            //     .valueChanges().subscribe( boards => {
            //       resolve(boards)
            //     }, reject );
            //   })
              
            // } else {
            const boards = await this.db
              .list(`watchlistBoards/${firebase.auth().currentUser.uid}`)
              .valueChanges().first().toPromise() as any;
            //   .subscribe(async boards => {
                 this.isWatchlistLoaderSource.next(true);
                 watchlistBoards = boards;

                const defaultBoard = "List";
               
                watchlistBoards.push(defaultBoard);
                this.RealtimeStockSymobolsToString = '';

                for (let watched of this.watchedList) {
                  this.RealtimeStockSymobolsToString += `,${watched.stock}.AU`;
                  let board = watched.list;
    
                  watchlist[board] = watchlist[board] || [];
                  watchlist[board].push(watched);
                }
                
                // this.StocksProvider.loadRealtimeStockPrices(this.watchlistRealtimeStockSymobolsToString.substr(1)).subscribe(async res => {
                //   if(res) {
                  
                  console.log(this.RealtimeStockSymobolsToString.substr(1), 'watchlistRealtimeStockSymobolsToString')
                  this.RealtimeStockPrices = await this
                .loadRealtimeStockPrices(this.RealtimeStockSymobolsToString.substr(1)).toPromise();
                
                for (let board in watchlist) {
                  let response  = await this.getSymbolByCode(
                   watchlist[board],
                    "watchlist"
                  ) as Array<any>;
                  console.log(response, 'RES')
                 watchlist[board] = _.sortBy(response, "symbol"); 
                //  response.sort((a, b) => a.symbol.localeCompare(b.last_nom));
                }
                  console.log(watchlist, 'this.watchlist')
                  this.watchlistBoards = watchlistBoards;
                  this.watchlistStocksStorageSource.next(watchlist);
                  this.isWatchlistLoaderSource.next(false);
                  resolve(watchlist);
                  // }
              // })
    
              
                
            //   }, reject);
            // }
        //   });
        });
      }
    getPortfolio() {
        return new Promise( async (resolve, reject) => {
          this.isPortfolioLoaderSource.next(false);
          let res: any = await this.db
          .list(`/portfolios/${firebase.auth().currentUser.uid}`)
          .valueChanges().first().toPromise();
          
          //  this.stocks.obs.subscribe(async res => {
            const defaultBoard = "Main";
            console.log('portfolios', res);
            
            if(res.length) {
            this.RealtimeStockSymobolsToString = '';
              for (let portfolio of res) {
                this.RealtimeStockSymobolsToString += `,${portfolio.stock}.AU`;
                let board = portfolio.portfolio || defaultBoard;
      
                this.portfolios[board] = this.portfolios[board] || [];
                this.portfolios[board].push(portfolio);
              }
              this.RealtimeStockPrices = await this
                  .loadRealtimeStockPrices(this.RealtimeStockSymobolsToString.substr(1)).toPromise();
                  console.log(this.portfolios,' ')
              for (let board in this.portfolios) {
                let response = await this.getSymbolByCode(
                  this.portfolios[board],
                  "portfolio"
                );
                this.portfolios[board] = _.sortBy(response, ["symbol"]);
              }
              console.log(this.portfolios , 'portfolios response');
              this.portfolioStocksStorageSource.next(this.portfolios);
              this.isPortfolioLoaderSource.next(false);
              resolve();
            } else {
              this.portfolios = {};
              this.portfolioStocksStorageSource.next(this.portfolios);
              this.isPortfolioLoaderSource.next(false);
              resolve();
            }
           
          // }, reject);
        });
      }

      getTrending() {
        this.db.object('/tags').valueChanges().subscribe(res => {
          this.db.object('/streams').valueChanges().subscribe(streams => {
            this.db.object('/comments').valueChanges().subscribe(comments => {
              this.getPostCommentCount(res, streams, comments).then(async res => {
                const trending:any = res;
                this.RealtimeStockSymobolsToString = '';
                for ( const trend of trending) {
                this.RealtimeStockSymobolsToString += `,${trend.stock}.AU`;
                }
                this.RealtimeStockPrices = await this
                .loadRealtimeStockPrices(this.RealtimeStockSymobolsToString.substr(1)).toPromise();
                this.getSymbolByCode(_.sortBy(trending, 'count').reverse(), 'trending').then(response => {
                  this.trendingStocksStorageSource.next(response);
                //   this.trending = [];
                //   this.stocks.list = response;
                //   this.stocks.preLoader = false;
                });
              });
            })
          });
        });
      }

      
  getPostCommentCount(tags, streams, comments) {
    return new Promise(resolve => {
      let trending: any = [];
      Object.keys(tags).forEach(companySymbol => {

        let postCount = 0;
        let commentCount = 0;

        if (tags[companySymbol].hasOwnProperty('post')) {
          let posts = Object.keys(tags[companySymbol].post);
          let postIds = posts.map(key => tags[companySymbol].post[key].post_id);
          posts = postIds.map(postId => streams[postId]);
          let postComments = postIds.map(postId => {
            return _.where(comments, { post_id: postId });
          });

          // Get only posts and comments from recent 24 hours
          let oneDayAgo: any = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          oneDayAgo = oneDayAgo.getTime();

          posts = _.filter(posts, post => post.timestamp >= oneDayAgo);
          postComments = postComments.map(comments => _.filter(comments, comment => comment.created_at >= oneDayAgo));

          postCount = posts.length;
          commentCount = postComments.reduce((sum, comments) => {
            return sum + comments.length;
          }, 0);
        }

        let count = postCount + commentCount;

        trending.push({ stock: companySymbol, count: count });
      });

      resolve(trending);
    });
  }

  async getGainers() {
    try {
      const response = await this._asxScrapesProvider.fetchGainers();
      console.log(response, 'gainers');
      const companies = await this.getCompanyDataByName(
        response
      );
      console.log(companies, 'gainers');
      this.RealtimeStockSymobolsToString = '';
      for ( const trend of companies as Array<any>) {
      this.RealtimeStockSymobolsToString += `,${trend.stock}.AU`;
      }
      console.log(this.RealtimeStockSymobolsToString, 'gainers');
      this.RealtimeStockPrices = await this
      .loadRealtimeStockPrices(this.RealtimeStockSymobolsToString.substr(1)).toPromise();
      console.log(this.RealtimeStockPrices, 'gainer Realtime')
      const stocks = await this.getSymbolByCode(
        companies,
        'top-gainers'
      );
      console.log(stocks, 'gainers');
      this.topMoverStocksStorageSource.next(stocks as any);
    //   this.stocks.list = stocks;
    //   console.log('stocks list:', this.stocks.list);
    //   this.stocks.preLoader = false;

    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getLosers() {
    try {
      const response = await this._asxScrapesProvider.fetchLosers();
      console.log(response, 'losers');
      const companies = await this.getCompanyDataByName(
        response
      );
      console.log(companies, 'losers');
      this.RealtimeStockSymobolsToString = '';
      for ( const trend of companies as Array<any>) {
      this.RealtimeStockSymobolsToString += `,${trend.stock}.AU`;
      }
      console.log(this.RealtimeStockSymobolsToString, 'losers');
      this.RealtimeStockPrices = await this
      .loadRealtimeStockPrices(this.RealtimeStockSymobolsToString.substr(1)).toPromise();
      const stocks = await this.getSymbolByCode(
        companies,
        'top-losers'
      );
      console.log(stocks, 'losers');
      this.topLoserStocksStorageSource.next(stocks as any);
    //   this.stocks.list = stocks;
    //   console.log('stocks list:', this.stocks.list);
    //   this.stocks.preLoader = false;

    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  abbrNum(number, decPlaces) {``
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

formatNumber(value: number, decimalCount: number = 2) {
  return value.toLocaleString('en', { maximumFractionDigits: decimalCount, minimumFractionDigits: decimalCount });
}

 calculateRanking(board) {
  const rankingSource = `rankingValues${board}Source`;
  this.userPortfolios = {};
  this.db.object('/portfolios/')
    .valueChanges()
    .subscribe(async userPortfolios => {

      console.log('userPortfolios' , userPortfolios)
      let userIds = Object.keys(userPortfolios);
      // console.log('userIds' , userIds)

      for (let userId of userIds) {
        // console.log(userId)
        let portfolioStocks = userPortfolios[userId] as Portfolio[];
        // console.log('portfolioStocks' , portfolioStocks)
        let portfolioList = Object.keys(portfolioStocks)       
        .map(x => { 

          let portfolio = portfolioStocks[x] as Portfolio;
          portfolio.portfolio = portfolio.portfolio || 'Main';
          return new Portfolio(portfolio);
    
          // if(portfolioStocks[x].portfolio == this.selectedSub){
          //   console.log(portfolioStocks[x])
          //     return portfolioList.push(new Portfolio(portfolioStocks[x]));
          // }

        })
        .filter(x => x.portfolio === board);

        

        // console.log('portfolioList' , portfolioList)

        if(portfolioList && portfolioList.length > 0){
          console.log(portfolioList)
          console.log(portfolioList.length)
        let stockList: Stock[] = await this.getSymbolByCode(portfolioList, 'portfolio', userId) as Stock[];
        stockList = _.sortBy(stockList, ['symbol']);
        // console.log('stockList' , stockList)
        stockList.forEach(x => {
          x.onDataChange().subscribe(dataChanged => {

            this.groupPortfolios(rankingSource);
          });
        });

        this.userPortfolios[userId] = stockList;
      }
       
      }
    });
}

private groupPortfolios(rankingSource) {
  let userIds = Object.keys(this.userPortfolios);
  let rankGroup: Object = {};

  for (let userId of userIds) {
    let stockList: Stock[] = this.userPortfolios[userId];

    let invested = 0;
    let marketValue = 0;
    stockList.filter(x => !!x.portfolioData).forEach(x => {
      invested += x.portfolioData.calcuteAcqPrice();
      marketValue += x.portfolioData.calculateMarketValue(x.close);  
    });

    let calculated = ((marketValue / invested) - 1) * 100;
    calculated = isNaN(calculated) ? 0 : calculated;
    let movement = `${this.formatNumber(calculated, 2)}%`;

    rankGroup[movement] = rankGroup[movement] || [];
    rankGroup[movement].push(userId);
  }

  let growthValues = Object.keys(rankGroup).sort((a, b) => parseFloat(a) - parseFloat(b)).reverse();
  let rankValues: RankValue[] = growthValues.map(x => {
    let rank = growthValues.indexOf(x) + 1;
    let rankPercent = (rank / growthValues.length) * 100;

    return new RankValue({
      percentage: rankPercent,
      rank: rank,
      max: growthValues.length,
      movement: x,
      userIds: rankGroup[x]
    });
  });
  console.log('rankValues = '  , rankingSource)
  this[rankingSource].next(rankValues);
}
}

export class RankValue {
  rank: number;
  percentage: number;
  max: number;
  movement: string;
  userIds: string[];

  get status() {
    let movement = parseFloat(this.movement);
    return movement > 0 ? 'up' :
      movement < 0 ? 'down' : '';
  }

  constructor(init?: Partial<RankValue>) {
    Object.assign(this, init);
  } 
}
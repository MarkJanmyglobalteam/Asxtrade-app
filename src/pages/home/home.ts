import { Component, Injector } from "@angular/core";
import { NavController, App, ToastController } from "ionic-angular";

import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
import * as _ from "lodash";


import { IntroPage } from "../intro/intro";
import { TabsPage } from "../tabs/tabs";
import { LoginPage } from "../login/login";
import { isCordovaAvailable } from "../../common/is-cordova-avaliable";
import { OSNotificationPayload, OneSignal } from "@ionic-native/onesignal";
import { PushProvider } from "../../providers/push/push";
import { OneSignalEnv } from "../../common/one-signal-env";
import { ConversationPage } from "../conversation/conversation";
import { NotificationsPage } from "../notifications/notifications";
import { AngularFireDatabase, } from "angularfire2/database";

import { StocksProvider } from "../../providers/stocks/stocks";
import { Subscription } from "rxjs";
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {

  //watchlist
  private watchlistBoards: string[] = [];
  private watchlist: object = {};
  private watchedList: Array<any> = [];
  private selectedBoard: string;


  //portfolio
  private portfolios: object = {};


  private _subscription: Subscription = new Subscription();
  private set subscription(value: Subscription) {
    this._subscription.add(value);
  }

  symbols: any = [];
  stocks: any = {
    obs: [],
    list: [],
    preLoader: true
  };
  watchlistRealtimeStockSymobolsToString: string = '';
  isAlreadyUpdating:boolean;
  constructor(
    public navCtrl: NavController,
    public afAuth: AngularFireAuth,
    private oneSignal: OneSignal,
    private pushProvider: PushProvider,
    private app: App,
    public db: AngularFireDatabase,
    private StocksProvider: StocksProvider,
    private storage: Storage,
    private toastCtrl: ToastController
  ) { }

  ionViewDidLoad() {
 
    this.afAuth.authState.first().toPromise().then(user => {
      if (user) {
        this.loadOneSignal();
        console.log('init');
        this.storage.get('watchlist').then(res => {
          console.log(res);
          if(res) {
            this.StocksProvider.watchlistStocksStorageSource.next(res);
          }
        }).catch(err => {
          console.log(err,'error')
        })
       this.StocksProvider.getSymbols().then(result => {
        this.StocksProvider.getWatchlist().then(() => {
      
          this.navCtrl.setRoot(TabsPage);
          // this.storage.set('watchlist', this.watchlist).then((res) => {
          //   console.log('watchlistLocalStorageSaved!', res);
          // });
        });
        this.StocksProvider.getPortfolio().then(() => {

        });
        this.StocksProvider.getTrending();
        this.StocksProvider.getGainers();
        this.StocksProvider.getLosers();
        // this.StocksProvider.calculateRanking('Main');
        // this.StocksProvider.calculateRanking('SMSF');
        // this.StocksProvider.calculateRanking('Trading');

      });
      } else {
        this.navCtrl.setRoot(LoginPage);
      }
    })
    // this.afAuth.authState.subscribe((user: firebase.User) => {
    //   if (user) {
    //     this.loadOneSignal();
    //     console.log('init');
    //     this.storage.get('watchlist').then(res => {
    //       console.log(res);
    //       if(res) {
    //         this.StocksProvider.watchlistStocksStorageSource.next(res);
    //       }
    //     }).catch(err => {
    //       console.log(err,'error')
    //     })
    //    this.StocksProvider.getSymbols().then(result => {
    //     this.StocksProvider.getWatchlist().then(() => {
      
    //       this.navCtrl.setRoot(TabsPage);
    //       // this.storage.set('watchlist', this.watchlist).then((res) => {
    //       //   console.log('watchlistLocalStorageSaved!', res);
    //       // });
    //     });
    //     this.StocksProvider.getPortfolio().then(() => {

    //     });
    //     this.StocksProvider.getTrending();
    //     this.StocksProvider.getGainers();
    //     this.StocksProvider.getLosers();
    //     // this.StocksProvider.calculateRanking('Main');
    //     // this.StocksProvider.calculateRanking('SMSF');
    //     // this.StocksProvider.calculateRanking('Trading');

    //   });
    //   } else {
    //     this.navCtrl.setRoot(LoginPage);
    //   }
    //   // setTimeout(() => {
    //   //   this.navCtrl.setRoot(user ? TabsPage : LoginPage);
    //   // }, 3000);
 
    // });
  }

  private loadOneSignal() {
    if (isCordovaAvailable()) {
      this.oneSignal.startInit(OneSignalEnv.appId, OneSignalEnv.senderId);

      this.oneSignal.inFocusDisplaying(
        this.oneSignal.OSInFocusDisplayOption.Notification
      );

      this.oneSignal
        .handleNotificationReceived()
        .subscribe(data => this.onPushReceived(data.payload));

      this.oneSignal
        .handleNotificationOpened()
        .subscribe(data => this.onPushOpened(data.notification.payload));

      this.oneSignal.endInit();

      this.oneSignal.getIds().then(id => {
        console.log("player id", id);
        this.pushProvider.saveId(id.userId);
      });
    }
  }

  private onPushReceived(payload: OSNotificationPayload) {
    console.log(
      "Push recevied:",
      JSON.parse(JSON.parse(payload.rawPayload).custom)
    );
  }

  private onPushOpened(payload: OSNotificationPayload) {
    let rawPayload = JSON.parse(payload.rawPayload);
    let data = JSON.parse(rawPayload.custom).a;
    console.log("Push opened:", data);

    let page: any;
    console.log('data', data.page)
    switch (data.page) {
      case 'Conversation':
        page = ConversationPage;
        break;
      case 'Announcement':
        page = NotificationsPage;
        break
    }

    if (page) {
      this.app.getRootNav().push(page, data.params);
    }
  }
  // getWatchlist() {
  //   return new Promise((resolve, reject) => {
      
  //     this.stocks.obs = this.db
  //       .list("/watchlists/" + firebase.auth().currentUser.uid)
  //       .valueChanges();
  //     this.subscription = this.stocks.obs.subscribe(async res => {
  //       this.isAlreadyUpdating = true;
  //       this.watchedList = res;
  //       this.StocksProvider.isWatchlistLoaderSource.next(true);
  //       console.log(this.watchedList, 'obs')
  //       // if( isAlreadyUpdating) {
  //       //   boards  = await new Promise((resolve, reject) => {
  //       //     this.db.list(`watchlistBoards/${firebase.auth().currentUser.uid}`)
  //       //     .valueChanges().subscribe( boards => {
  //       //       resolve(boards)
  //       //     }, reject );
  //       //   })
          
  //       // } else {
  //         this.subscription = this.db
  //         .list(`watchlistBoards/${firebase.auth().currentUser.uid}`)
  //         .valueChanges()
  //         .subscribe(async boards => {
  //            this.StocksProvider.isWatchlistLoaderSource.next(true);
  //           const defaultBoard = "Default";
  //           this.watchlistBoards = boards as string[];
  //           this.watchlistBoards.unshift(defaultBoard);
  //           this.watchlistRealtimeStockSymobolsToString = '';
  //           for (let watched of this.watchedList) {
  //             this.watchlistRealtimeStockSymobolsToString += `,${watched.stock}.AU`;
  //             let board = watched.list || defaultBoard;

  //             this.watchlist[board] = this.watchlist[board] || [];
  //             this.watchlist[board].push(watched);
  //           }
            
  //           // this.StocksProvider.loadRealtimeStockPrices(this.watchlistRealtimeStockSymobolsToString.substr(1)).subscribe(async res => {
  //           //   if(res) {
              
  //           if(this.isAlreadyUpdating) {
  //             console.log(this.watchlistRealtimeStockSymobolsToString.substr(1), 'watchlistRealtimeStockSymobolsToString')
  //             this.StocksProvider.watchlistRealtimeStockPrices = await this.StocksProvider
  //           .loadRealtimeStockPrices(this.watchlistRealtimeStockSymobolsToString.substr(1)).toPromise();
  //           this.isAlreadyUpdating = false;
  //           }
  //           for (let board in this.watchlist) {
  //             let response  = await this.StocksProvider.getSymbolByCode(
  //               this.watchlist[board],
  //               "watchlist"
  //             ) 
  //             console.log(response, 'RES')
  //             this.watchlist[board] = _.sortBy(response, ["symbol"]);
  //           }
  //             console.log(this.watchlist, 'this.watchlist')
  //             this.StocksProvider.watchlistBoards = this.watchlistBoards;
  //             this.StocksProvider.watchlistStocksStorageSource.next(this.watchlist);
  //             this.StocksProvider.isWatchlistLoaderSource.next(false);
  //             resolve(this.watchlist);
  //             // }
  //         // })

          
            
  //         }, reject);
  //       // }
  //     });
  //   });
  // }
  // getPortfolio() {
  //   return new Promise( async (resolve, reject) => {
  //     this.stocks.obs = this.db
  //       .list(`/portfolios/${firebase.auth().currentUser.uid}`)
  //       .valueChanges();

  //     const res = await this.stocks.obs.first().toPromise();
      
  //     console.log(res,'topromise');
  //     //  this.stocks.obs.subscribe(async res => {
  //       const defaultBoard = "Main";
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
  //         resolve();
  //       } else {
  //         resolve();
  //       }
       
  //     // }, reject);
  //   });
  // }
}

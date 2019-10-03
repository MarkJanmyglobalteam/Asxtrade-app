import { Component, OnDestroy } from "@angular/core";
import { AngularFireDatabase } from "angularfire2/database";
import firebase from "firebase";
import * as _ from "lodash";
import * as circularJson from  "circular-json";

import { StockviewPage } from "../../pages/stockview/stockview";
import { StocksProvider } from "../../providers/stocks/stocks";
import { Subscription } from "rxjs";
import { ToastController } from "ionic-angular";

/**
 * Generated class for the WatchlistComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "watchlist",
  templateUrl: "watchlist.html"
})
export class WatchlistComponent implements OnDestroy {
  stockPage = StockviewPage;
  symbols: any = [];
  stocks: any = {
    obs: [],
    list: [],
    preLoader: true
  };

  private watchlistBoards: string[] = [];
  private watchlist: object = {};
  private selectedBoard: string;

  private _subscription: Subscription = new Subscription();
  private set subscription(value) {
    this._subscription.add(value);
  }

  constructor(
    public StocksProvider: StocksProvider,
    public db: AngularFireDatabase,
    private toastCtrl: ToastController,
  ) {
    // this.StocksProvider.getSymbols().then(result => {
    //   this.symbols = result;
    //   this.getWatchlist().then(() => {
    //     console.log(this.watchlist, 'this.watchlist')
    //     this.stocks.preLoader = false;
    //   });
    // });
    this.subscription = this.StocksProvider.watchlistStocksStorage.subscribe(res => {
      console.log(res , 'reswatchlist')
      console.log(Object.keys(res).length,'reswatchlist')
      if(Object.keys(res).length) {
        this.watchlist = res;
        this.watchlistBoards = this.StocksProvider.watchlistBoards;
        if( this.watchlistBoards.length > 1) {
           this.onBoardChanged(this.watchlistBoards[0]) 
        } else {
          this.onBoardChanged('List');
        }
       
      }
    })
    this.subscription = this.StocksProvider.isWatchlistLoader.subscribe(isloading => {
      console.log(isloading,'isloading');
      if(!isloading){
        this.stocks.preLoader = false;
      } else {
        this.stocks.preLoader = true;
      }
    })
    
  }

  ngOnDestroy() {
    this._subscription.unsubscribe(); 
  }

  ionViewWillLeave() {
    this.ngOnDestroy();
  }
  // get getWatchlistData() {
  //   this.watchlist = this.StocksProvider.watchlistStocksStorage;
  //   if(this.watchlist) {
  //     this.onBoardChanged('Default');
  //     this.watchlistBoards =  this.StocksProvider.watchlistBoards;
  //   }
  //   return this.watchlist;
    
  // }

  getWatchlist() {
    return new Promise((resolve, reject) => {
      this.stocks.obs = this.db
        .list("/watchlists/" + firebase.auth().currentUser.uid)
        .valueChanges();

      this.subscription = this.stocks.obs.subscribe(res => {
        console.log(res, 'obs')
        this.subscription = this.db
          .list(`watchlistBoards/${firebase.auth().currentUser.uid}`)
          .valueChanges()
          .subscribe(async boards => {
            const defaultBoard = "List";
            this.watchlistBoards = boards as string[];
            this.watchlistBoards.unshift(defaultBoard);

            for (let watched of res) {
              let board = watched.list || defaultBoard;

              this.watchlist[board] = this.watchlist[board] || [];
              this.watchlist[board].push(watched);
            }
            // this.watchlist['Default'] =  [{ stock: "NCZ" }];

            for (let board in this.watchlist) {
              let response  = await this.StocksProvider.getSymbolByCode(
                this.watchlist[board],
                "watchlist"
              ) as Array<any>;
              console.log(response, 'RES')
              this.watchlist[board] = _.sortBy(response, ["symbol"]);
            }

            this.onBoardChanged(defaultBoard);
            resolve();
          }, reject);
      });
    });
  }

  private onBoardChanged(board) {
    console.log("onBoardChanged", board);
    this.selectedBoard = board;
    this.stocks.list = this.watchlist[board] || [];
  }

  navigateToStockPage(stock) {
    this.StocksProvider.navigateToStockPage(this.stockPage, stock);
  }

  formatVolume(volume) {
    volume = +volume;
    if (isNaN(volume)) {
      return "NA";
    }

    if (volume >= 1000000) {
      volume = volume / 1000000;
      volume = `${volume.toFixed(0)}M`;
    } else {
      volume = volume / 1000;
      volume = `${volume.toFixed(0)}K`;
    }

    return volume;
  }


}

import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController,
  ToastController,
  LoadingController
} from "ionic-angular";
import { Stock } from "../../models/stock";
import { AngularFireDatabase } from "angularfire2/database";
import firebase from "firebase";
import { Subscription } from "rxjs";
import { StocksProvider } from "../../providers/stocks/stocks";
import { map } from "rxjs/operators";
import * as _ from "lodash";


/**
 * Generated class for the AddWatchlistModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-add-watchlist-modal",
  templateUrl: "add-watchlist-modal.html"
})
export class AddWatchlistModalPage {
  private readonly url = `watchlistBoards/${firebase.auth().currentUser.uid}`;

  // stock: Stock;
  // watchlists: string[] = [];
  // stockUserWatchlists: Array<string> = [];
  // userWatchlists : Array<any>;
  // private isCreating: boolean = false;\


  //
  hasChanges: boolean;
  userWatchListBoards: Array<any> = [];  
  userWatchList: Array<any> = [];  
  objectKeys = Object.keys;
  private isCreating: boolean = false;


  private _subscription: Subscription = new Subscription();
  private set subscription(value) {
    this._subscription.add(value);
  }
  checkedWatchlist : Array<any> = [];

  constructor(
    private navParams: NavParams,
    private navCtrl: NavController,
    private viewCtrl: ViewController,
    private db: AngularFireDatabase,
    private toastCtrl: ToastController,
    private stocksProvider: StocksProvider,
    private loadingCtrl: LoadingController,
  ) {
    this.stocksProvider.watchlistStocksStorage.subscribe((res) => {
      // const watchlist = res as any;
      // delete watchlist.Default;
      // this.userWatchList = watchlist;
      console.log(this.navParams.get('symbol'));
      this.userWatchList = this.stocksProvider.watchedList.filter((val) => {
        return  val.list && val.stock === this.navParams.get('symbol');
      });
      this.userWatchListBoards = this.stocksProvider.watchlistBoards.filter(val => val !== "Default");
      // this.userWatchListBoards = this.userWatchListBoards.shift();
      console.log(res ,'watchlistsubscriber');
      console.log(this.userWatchListBoards ,'watchlistsubscriber boards');

      console.log(this.stocksProvider.watchedList ,this.userWatchList )
      console.log(this.stocksProvider.watchedListKeys , 'watchlistsubscriber withkeys')
    })
  //   if (navParams.get('stock')) {
 
  //     this.stock = navParams.get('stock');
  //     // this.stockUserWatchlists = navParams.get('userWatchlists');
  //     // console.log(navParams.get('userWatchlists' ) , 'stockuserWatchlists');
  //     this.getWatchlists();
  //     // console.log(navParams.get('userWatchlistsData') , 'userwatchlists data')
  //     // this.userWatchlists = navParams.get('userWatchlistsData');
 
  
  //     this.subscription =  this.getUserWatchlist().subscribe(
  //       res =>{
  //         console.log(res , 'watchlistsubscription');
  //         this.userWatchlists = res;
  //         this.stockUserWatchlists =  (_.map(_.map(res,"data") , "list"));
  //       }
  //     );
  // }  
  //   console.log(this.url);
  }

  // ionViewDidLoad() {
  //   console.log("stock", this.stock);
  // }

  // private getWatchlists() {
  //   // let loader = this.loadingCtrl.create({
  //   //   content: 'Loading please wait..'
  //   // });
  //   // loader.present();
  //   this.subscription = this.db
  //     .list(this.url)
  //     .valueChanges()
  //     .subscribe(list => {
  //       this.watchlists = list as string[];
  //       // loader.dismiss();
  //     });
  // }

  private createWatchlist() {
    this.isCreating = true;
  }

  private async create(value: string) {
    this.userWatchListBoards.push(value);
    await this.saveList();
    this.hasChanges = true;
  }

  private async remove(watchlist: string) {
    let index = this.userWatchListBoards.indexOf(watchlist);
    this.userWatchListBoards.splice(index,1);
    await this.saveList();
    let toast = this.toastCtrl.create({
      message: `Successfully ${watchlist} deleted`,
      duration: 2000,
      position: "top",
    })
    this.db.list(`watchlists/${firebase.auth().currentUser.uid}/${watchlist}`).remove().then(res => {
      toast.present();
      this.hasChanges = true;
    });
    
  }

  // private removeWatchlistBoard(board: string): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.subscription = this.db
  //       .list("/watchlists/" + firebase.auth().currentUser.uid)
  //       .valueChanges()
  //       .subscribe(res => {
  //         res = res.filter(x => x["list"] === board);
  //         console.log(`watchlist to remove`, res);
  //         this.stocksProvider
  //           .getSymbolByCode(res, "watchlist")
  //           .then(response => {
  //             let stocks = response as Stock[];
  //             console.log(`stocks to remove`, stocks)
  //             stocks.forEach(x => x.removeWatchlist());
  //             resolve();
  //           }, reject);
  //       });
  //   });
  // }
  // private removeWatchlistByBoard(board: string): Promise<void> {
  //   console.log(board);
  //   return new Promise((resolve, reject) => {
  //     let watchlistId = this.userWatchlists.filter( p => p.data.list === board )
  //     console.log(watchlistId , 'watchlist keys filtered')
    
  //     if(watchlistId.length > 0){
  //     console.log(watchlistId[0].key , 'watchlist key to delete');
  //     this.subscription = this.db.list('/watchlists/'+firebase.auth().currentUser.uid + '/'+watchlistId[0].key )
  //     .remove()
  //     .then( ( res)  => resolve()
  //     ,reject);
  //     }

  //     else{
  //       resolve()
  //     }

  //     reject
  //   });
  // }
 

  private saveList() {
      this.db
      .object(this.url)
      .set(this.userWatchListBoards);
  }

  private closeCreate() {
    this.isCreating = false;
  }

  private dismiss() {
    this._subscription.unsubscribe();
    if(this.hasChanges) {
      this.stocksProvider.getWatchlist();
    }
    this.viewCtrl.dismiss();
  }

  private addToWatchlist(board: string , index) {
    // let loaderMessage = `Adding ${stock.symbol} to watchlist...`;

    // this.presentLoading(loaderMessage);
    this.db.list('/watchlists/' + firebase.auth().currentUser.uid + '/' + board)
    .push({ stock: this.navParams.get('symbol'), list: board }).then(()=> {
      let toastMessage = `Successfully added ${
        this.navParams.get('symbol')
      } to ${board} watchlist.`;
      this.toastCtrl
      .create({
        duration: 2000,
        position: "top",
        message: toastMessage
      })
      .present();
      this.userWatchList.push({ stock: this.navParams.get('symbol'), list: board });
      this.hasChanges = true;
      this.hasChanges = true;
    })
  }

  private removeToWatchlist(board: string) {
    console.log(board);
    // let loaderMessage = `Adding ${stock.symbol} to watchlist...`;

    // this.presentLoading(loaderMessage);
    const key = this.stocksProvider.watchedListKeys.filter((val) => {
      const type = val.data.list || null;
      if(type){
        return type === board && val.data.stock === this.navParams.get('symbol')
      } else {
        return false;
      }
      
    })
    console.log(key)
    // this.db.list('/watchlists/' + firebase.auth().currentUser.uid + '/' + key[0].key, )
    this.db.list(`watchlists/${firebase.auth().currentUser.uid}/${board}/${key[0].key}`)
    .remove().then(()=> {
      let toastMessage = `Successfully romoved ${
        this.navParams.get('symbol')
      } to ${board} watchlist.`;
      this.toastCtrl
      .create({
        duration: 2000,
        position: "top",
        message: toastMessage
      })
      .present();
      const index = this.userWatchList.findIndex((val) => {
        return val.stock === this.navParams.get('symbol') && val.list === board;
      });
      console.log( this.userWatchList, 'watchlistsubscriber usesrwatchlist');
      console.log(index, 'watchlistsubscriber index to delete');
      this.userWatchList.splice(index, 1);
      this.hasChanges = true;

    })

  }
    
  

    // this.stock.addtoWatchlist(value).then(() => {
    //   // this.loader.dismiss();
    //   this.checkedWatchlist[index] = true;
    //   this.toastCtrl
    //     .create({
    //       duration: 2000,
    //       position: "top",
    //       message: toastMessage
    //     })
    //     .present();

    //   // this.dismiss();
    // });
  // }

  // getUserWatchlist(){
  //   return this.db.list('/watchlists/'+firebase.auth().currentUser.uid, ref => ref.orderByChild('stock').equalTo(this.stock.symbol) )
  //   .snapshotChanges()
  //   .pipe(map(items => {            // <== new way of chaining
  //     return items.map(a => {
  //       const data = a.payload.val();
  //       const key = a.payload.key;
  //       return {key, data};           // or {key, ...data} in case data is Obj
  //     });
  //   }));
  // }

  //
  isAdded(watchlist) {
    return this.userWatchList.findIndex( i => i.list === watchlist) > -1
  }
}

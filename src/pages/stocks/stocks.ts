import { Component, ViewChild, Injector } from '@angular/core';
import { IonicPage, MenuController, ModalController, Nav, NavController, NavParams, ToastController } from 'ionic-angular';
import { AutoCompleteService } from 'ionic2-auto-complete';
import { SearchStockProvider } from '../../providers/search-stock/search-stock';
import { StocksProvider } from '../../providers/stocks/stocks';
import { StockviewPage } from '../stockview/stockview';
import { HomePage } from '../home/home';
import { WatchlistComponent } from '../../components/watchlist/watchlist';


@IonicPage()
@Component({
    selector: 'page-stocks',
    templateUrl: 'stocks.html',
})

export class StocksPage {
    @ViewChild(Nav) nav: Nav;
    @ViewChild('searchbar') searchbar: AutoCompleteService;
    segments:any = [
        // { title: 'All', key: 'all' },
        { title: 'Watchlist', key: 'watchlist' },
        { title: 'Portfolio', key: 'portfolio' },
        { title: 'Trending', key: 'trending' },
        // { title: 'Follow', key: 'follow' },
        { title: 'Top Movers', key: 'topmovers' },
        { title: 'Ranking', key: 'ranking' }
    ];

    activeSegment: string = '';
    showTransparentPage: boolean = false;
    searchValue: any = null;
    hideSearchbar: boolean = true;

    init() {
        this.activeSegment = this.segments[0].key;
    }

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public StocksProvider: StocksProvider,
        menu: MenuController,
        public modalCtrl: ModalController,
        public autoCompleteService: SearchStockProvider,
        private injector: Injector,
        private toastCtrl: ToastController
        ) {
        let toast = this.toastCtrl.create({
        message: 'You can pull down the page to refresh.',
        // duration: 3000,
        closeButtonText: 'Ok',
        showCloseButton: true,
        position: 'top'
        });
    
        toast.onDidDismiss(() => {
        console.log('Dismissed toast');
        });
    
        toast.present();
        menu.enable(true);
        this.init();
    }

    ionViewWillLoad () {
        this.showTransparentPage = false;
        this.StocksProvider.loadSymbols();
    }

    showHideSearchbar () {
        if (this.hideSearchbar) {
            this.hideSearchbar = false;
            this.searchValue = null;
            // this.searchbar.setFocus();
        } else {
            this.hideSearchbar = true;
        }
    }

    focusoutAutocomplete () {
        this.showTransparentPage = false;
        this.hideSearchbar = true;
    }

    searchValueChange (e) {
        if(e && e.hasOwnProperty('symbol')) {
            var stocker = [{ stock: e.symbol }];
            this.StocksProvider.getSymbolByCode(stocker, "watchlist")
            .then((response: Array<any>) => {
                console.log(response);
                if (response.length > 0) {
                    console.log(response[1]);
                    setTimeout(() => this.navCtrl.push(StockviewPage, response[0]), 150);
                }
            });
        }
    }
    doRefresh(refresher) {
        console.log('Begin async operation', refresher);
        // const homePage = this.injector.get(HomePage);
        // const watchlistPage = this.injector.get(WatchlistComponent);
        // watchlistPage.stocks.preloader = true;
        // homePage.getWatchlist().then(() => {
        // watchlistPage.stocks.preloader = false;
        // });
        setTimeout(() => {
          console.log('Async operation has ended');
          refresher.complete();
        }, 3000);
      }
 
}

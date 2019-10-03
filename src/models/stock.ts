import { ActionSheetController, ModalController, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { AngularFireDatabase } from 'angularfire2/database';
import { Subscription, BehaviorSubject, Observable } from 'rxjs/Rx';
import * as lodash from 'lodash';
import * as _ from 'underscore/underscore';
import firebase from 'firebase';

import { StreamModalComponent } from '../components/stream-modal/stream-modal';
import { StocksProvider } from '../providers/stocks/stocks';
import { Stream } from './stream';
import moment from 'moment';

export class Stock {

    // static readonly BASE_URL: String = 'https://cors-anywhere.herokuapp.com/https://eodhistoricaldata.com/api/real-time/';
    // http://210.16.120.39:8080/https://eodhistoricaldata.com/api/real-time/
    static readonly BASE_URL: String = 'https://cors-anywhere.herokuapp.com/https://eodhistoricaldata.com/api/real-time/'
    static readonly API_TOKEN: String = '5a4c5a8b13c90';
    private http: Http;
    private db: AngularFireDatabase;
    private StocksProvider: StocksProvider;
    private ActionSheetController: ActionSheetController;
    private modalCtrl: ModalController;
    private alertCtrl: AlertController;
    streams: Array<Stream> = [];
    name: string;
    symbol: string;
    sector: string;
    code: string;
    percentage: string;
    status: string;
    change: number;
    close: number;
    gmtoffset: number;
    high: number;
    low: number;
    open: number;
    previousClose: number;
    timestamp: number;
    volume: number;
    watched: string;
    portfolioId: string;
    portfolioData: Portfolio;
    portfolioType: string

    streamLimit: number = 3;
    streamCount: number = 5;
    streamTotal: number = 0;
    streamSubscriber: any;
    streamScrollStatus = true;
    watchlistRealtimeStockPrices: Array<any> = [];

    private watchlistSubscription: Subscription;
    private portfolioSubscription: Subscription;

    private dataChangeValue = new BehaviorSubject<string>('');
    public onDataChange(): Observable<string> {
        return this.dataChangeValue.asObservable();
    }
 
    private fetchFromAPI(stock) {
        // let url = Stock.BASE_URL + stock.stock + ".AU?api_token=" + Stock.API_TOKEN + "&fmt=json";
        return new Promise(resolve => {
            // this.http.get(url)
            //     .map(res => res.json())
            //     .subscribe(data => {
                    let data = _.findWhere(this.watchlistRealtimeStockPrices, { code: stock.symbol + '.AU' })
                   if(data) {
                    let change = data.change.toString();
                    let percentage: any = 0;

                    if (change != 'NA' && change != '0') {
                        let negativeChange = change.indexOf('-') >= 0;
                        percentage = ((data.previousClose - data.close) / data.previousClose) * 100;
                        percentage = Math.abs(percentage).toFixed(1);
                        if (negativeChange) {
                            data.percentage = `-${percentage}%`;
                            data.status = 'down';
                        } else {
                            data.percentage = `${percentage}%`;
                            data.status = 'up';
                        }
                    } else {
                        data.change = '0';
                        data.percentage = '0%';
                    }
                   }

                    lodash.merge(stock, data);
                
                    resolve(stock);
                // });
        });
    }

    private setAPIValue(stock) {
        this.change = stock.change;
        this.close = stock.close;
        this.code = stock.code;
        this.gmtoffset = stock.gmtoffset;
        this.high = stock.high;
        this.low = stock.low;
        this.open = stock.open;
        this.percentage = stock.percentage;
        this.previousClose = stock.previousClose;
        this.timestamp = stock.timestamp;
        this.volume = stock.volume;
        this.status = stock.status || ' ';
        this.portfolioId = stock.portfolioId = ' ';

        // this.watchlistSubscription = this.db.object('/watchlists/' + this.userId).valueChanges()
        //     .subscribe(res => {
        //         this.watched = _.findKey(res, { stock: this.symbol, });
        //         const filteredIds = _.filter(_.keys(res),  (key) => {
        //           return true;
        //         });
        //     });

        this.portfolioSubscription = this.db.object('/portfolios/' + this.userId).valueChanges()
            .subscribe(res => {
                this.portfolioId = _.findKey(res, { stock: this.symbol, portfolio: this.portfolioType});
                if (this.portfolioId) {
                    this.portfolioData = new Portfolio(res[this.portfolioId]);

                    if (this.portfolioData.shares) {
                        
                        this.portfolioData.shares = this.portfolioData.shares.map(x => new ShareValue(x));
                    }

                    if (this.portfolioData.soldShares) {
                        this.portfolioData.soldShares = this.portfolioData.soldShares.map(x => new SoldShareValue(x));
                    }

                    this.dataChangeValue.next('portfolioData')
                } else {
                    console.log(this.portfolioId);
                }
            });
    }

    unsubscribeSubscriptions() {
        if (this.watchlistSubscription) this.watchlistSubscription.unsubscribe();
        if (this.portfolioSubscription) this.portfolioSubscription.unsubscribe();
    }

     setValue(stock) {
        return new Promise( (resolve, reject) => {
            let stockName = stock.name;

            stockName = stockName.split(' ').filter((word: string) => {
                word = word.toLowerCase();
                const condition1 = word.includes('limited');
                const condition2 = word.includes('ltd');
                if (condition1 || condition2) {
                    return false;
                } else {
                    return true;
                }
            }).join(' ').trim();
    
            this.name = stockName;
            this.symbol = stock.symbol;

            this.sector = stock.sector;
            this.fetchFromAPI(stock)
                .then(response => {
                    this.setAPIValue(response);
                    resolve();
                });
        })
     
    }

    constructor(
        private stock,
        Http,
        AngularFireDatabase,
        StocksProvider,
        ActionSheetController,
        ModalController,
        AlertController,
        private userId = firebase.auth().currentUser.uid,
        portfolioType?,
        watchlistRealtimeStockPrices?
    ) {
        this.http = Http;
        this.db = AngularFireDatabase;
        this.StocksProvider = StocksProvider;
        this.ActionSheetController = ActionSheetController;
        this.modalCtrl = ModalController;
        this.alertCtrl = AlertController;

        userId = userId || firebase.auth().currentUser.uid;
        // this.setValue(stock);
        this.portfolioType = portfolioType;
        this.watchlistRealtimeStockPrices = watchlistRealtimeStockPrices;
        
    }

    getStreamsTotal() {
        this.db.list('/tags/' + this.symbol + "/post").valueChanges()
            .subscribe(res => {
                this.streamTotal = res.length;
            });
    }

    getStreamsQuery() {
        return new Promise(resolve => {
            this.streamSubscriber = this.db.list(
                '/tags/' + this.symbol + "/post",
                ref => ref.limitToLast(this.streamCount).orderByKey()
            )
                .valueChanges()
                .map(streams => {
                    streams.reverse();
                    return streams.map((stream, key) => {
                        let streamFind = _.findWhere(this.streams, { post_id: stream['post_id'] });

                        if (!streamFind) {
                            let streamTemp = {
                                userid: stream['user_id'],
                                post_id: stream['post_id'],
                                comments: [],
                                stock: this
                            }
                            return new Stream(streamTemp, this.StocksProvider, this.db, this.ActionSheetController, this.modalCtrl, this.alertCtrl);
                        } else {
                            return streamFind;
                        }
                    });
                })
                .subscribe(streams => {
                    this.streams = _.sortBy(streams, '-timestamp');
                    resolve();
                });
        });
    }

    getStreams() {
        this.getStreamsTotal();
        this.getStreamsQuery();
    }

    addtoWatchlist(list: string) {
        return this.db.list('/watchlists/' + this.userId)
            .push({ stock: this.symbol, list: list });
    }

    removeWatchlist() {
        return this.db.list('/watchlists/' + this.userId, ref => ref.orderByChild('stock')
            .equalTo(this.symbol))
            .remove(this.watched);
    }

    addtoPortfolio(portfolio: string) {
        return this.db.list('/portfolios/' + this.userId)
            .push({ stock: this.symbol, portfolio: portfolio });
    }

    removetoPortfolio(portfolios , portfolioType) {
        let portfolioId = portfolios.filter( p => p.data.portfolio === portfolioType )[0].key;
        return this.db.list('/portfolios/' + this.userId)
            .remove(portfolioId);  
    }

    loadMoreStreams(infiniteScroll) {
        this.streamSubscriber.unsubscribe();
        this.streamCount = this.streamCount + this.streamLimit;
        this.getStreamsQuery()
            .then(streams => {
                infiniteScroll.complete();
            })
    }

    addStream() {
        let modal = this.modalCtrl.create(StreamModalComponent, { type: 'create', data: null, stock: this });
        modal.present();
    }

    updateShares(shareData: ShareValue, isSelling: boolean, index: number = -1) {
        if (isSelling) {
            return this.sellShares(shareData, index);
        } else {
            return this.buyShares(shareData);
        }
    }

    private buyShares(shareData: ShareValue) {
        shareData = new ShareValue(shareData);

        if (shareData.shareCount > 0) {
            if (!this.portfolioData.shares) {
                this.portfolioData.shares = [];
            }

            return this.http.get(this.getCloseValueOnDate(shareData.tradeDate))
                .map(response => response.json())
                .toPromise()
                .then(marketValue => {
                    shareData.closeValue = marketValue;
                    this.portfolioData.shares.push(shareData);

                    return this.db.object(`portfolios/${this.userId}/${this.portfolioId}`)
                        .update({ shares: this.portfolioData.shares })
                        .then(() => { return true; })
                        .catch(() => { return false; });
                });
        } else {
            return new Promise<boolean>(() => { return false; });
        }
    }

    private sellShares(shareData: ShareValue, index: number) {
        let shareSold = new ShareValue(this.portfolioData.shares[index]);
        shareData = new ShareValue(shareData);

        if (shareData.shareCount <= shareSold.shareCount && shareData.shareCount > 0) {
            if (!this.portfolioData.soldShares) {
                this.portfolioData.soldShares = [];
            }

            return this.http.get(this.getCloseValueOnDate(shareData.tradeDate))
                .map(response => response.json())
                .toPromise()
                .then(marketValue => {
                    let soldShareData = new SoldShareValue({
                        shareSold: shareData,
                        dateSold: shareData.tradeDate,
                        closeValueWhenSold: marketValue,
                        marketValue: shareData.calculateProfit(marketValue),
                        profit: shareData.calculateProfit(marketValue),
                        profitPercentage: shareData.calculateProfitPercent(marketValue)
                    });

                    soldShareData.shareSold.tradeDate = shareSold.tradeDate;
                    this.portfolioData.soldShares.push(soldShareData);


                    shareSold.shareCount -= shareData.shareCount;
                    this.portfolioData.shares[index] = shareSold;

                    if (shareSold.shareCount == 0) {
                        this.portfolioData.shares.splice(index, 1);
                    }

                    return this.db.object(`portfolios/${this.userId}/${this.portfolioId}`)
                        .update({
                            shares: this.portfolioData.shares,
                            soldShares: this.portfolioData.soldShares
                        })
                        .then(() => { return true; })
                        .catch(() => { return false; });
                });
        } else {
            return new Promise<boolean>(() => { return false; });
        }
    }

    private getCloseValueOnDate(date: string) {
        if (date === moment().format('YYYY-MM-DD')) {
            return `${Stock.BASE_URL}${this.symbol}.AU?api_token=${Stock.API_TOKEN}&fmt=json&filter=close`;
        }

        return `https://cors-anywhere.herokuapp.com/https://eodhistoricaldata.com/api/eod/${this.symbol}.AU?from=${date}&to=${date}&api_token=${Stock.API_TOKEN}&fmt=json&filter=last_close`;
    }
}

export class SoldShareValue {
    shareSold: ShareValue;

    dateSold: string;
    closeValueWhenSold: number;
    profit: number;
    profitPercentage: number;
    marketValue: number;

    constructor(init?: Partial<SoldShareValue>) {
        if (init) {
            Object.assign(this, init);
            this.shareSold = new ShareValue(init.shareSold);
        }
    }
}

export class ShareValue {
    shareCount: number;
    tradeDate: string;
    closeValue: number;
    notes?: string;

    constructor(init?: Partial<ShareValue>) {

        if (init) {
            Object.assign(this, init);
            this.shareCount = Number(this.shareCount);
            this.closeValue = Number(this.closeValue);
        }
    }

    calculateAcqValue() {
        // console.log(this.shareCount , this.closeValue);

        return this.shareCount * this.closeValue;
    }

    calculateMarketValue(currentCloseValue: number): number {
        return this.shareCount * currentCloseValue;
    }

    calculateProfit(currentCloseValue: number): number {
        let marketValueOnDate = this.calculateAcqValue();
        let currentMarketValue = this.calculateMarketValue(currentCloseValue);

        return currentMarketValue - marketValueOnDate;
    }

    calculateProfitPercent(currentCloseValue: number): number {
        let marketValue = this.calculateMarketValue(currentCloseValue);
        let profit = this.calculateProfit(currentCloseValue);

        return (profit / marketValue) * 100;
    }
}

export class Portfolio {
    stock: string;
    shares?: ShareValue[];
    soldShares?: SoldShareValue[];
    portfolio?: string;

    get totalShares() {
        let totalShares = 0;

        if (this.shares) {
            this.shares.forEach(x => totalShares += +x.shareCount);
        }

        return totalShares;
    }

    constructor(init?: Partial<Portfolio>) {
        Object.assign(this, init);
    }

    calculateMarketValue(currentCloseValue: number ): number {
        return this.totalShares * currentCloseValue;
    }
    
    // calculateMarketValue(totalShares, currentCloseValue: number ): number {
    //     // console.log(totalShares * currentCloseValue , 'market');
    //     return totalShares * currentCloseValue;
    // }

    calculateProfit(currentCloseValue: number): number {
        let total = 0;

        if (this.shares && this.shares.length > 0) {
            this.shares.forEach(x => {
                return total += x.calculateProfit(currentCloseValue);
            });
        }

        return total;
    }

    calculateProfitPercent(currentCloseValue: number): number {
        let marketValue = this.calculateMarketValue(currentCloseValue);
        let profit = this.calculateProfit(currentCloseValue);

        return (marketValue / (marketValue - profit)) - 1;
    }
    // calculateProfitPercent(totalShares, currentCloseValue: number): number {
    //     let marketValue = this.calculateMarketValue(totalShares, currentCloseValue);
    //     let profit = this.calculateProfit(currentCloseValue);

    //     return (profit / marketValue) * 100;
    // }

    calcuteAcqPrice(): number {
        let total = 0;

        if (this.shares && this.shares.length > 0) {
            this.shares.forEach(x => total += x.calculateAcqValue());
        }

        return total;
    }
}

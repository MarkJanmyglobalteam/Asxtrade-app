import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as _ from 'underscore/underscore';

import { StockviewPage } from '../../pages/stockview/stockview';
import { StocksProvider } from '../../providers/stocks/stocks';

/**
 * Generated class for the TrendingComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'trending',
  templateUrl: 'trending.html'
})
export class TrendingComponent {
  stockPage = StockviewPage;
  trending: any = [];
  stocks: any = {
    obs: [],
    list: [],
    preLoader: true
  };
  portfolioStocks: Array<any>;
  watchlistRealtimeStockSymobolsToString: string = '';

  constructor(
    public StocksProvider: StocksProvider,
    public db: AngularFireDatabase
  ) {
    this.StocksProvider.trendingStocksStorage.subscribe(res => {
      console.log(res,'res trending')
      if(Object.keys(res).length){
          this.stocks.list = res;
          this.stocks.preLoader = false;
      }
    })
  }

  getPostCommentCount(tags, streams, comments) {
    return new Promise(resolve => {
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

        this.trending.push({ stock: companySymbol, count: count });
      });

      resolve(this.trending);
    });
  }

  // getTrending() {
  //   this.stocks.obs = this.db.object('/tags').valueChanges();
  //   this.stocks.obs.subscribe(res => {
  //     this.db.object('/streams').valueChanges().subscribe(streams => {
  //       this.db.object('/comments').valueChanges().subscribe(comments => {
  //         this.getPostCommentCount(res, streams, comments).then(async trending => {
  //           console.log(this.trending, 'trending')
  //           for ( const trend of this.trending) {
  //           this.watchlistRealtimeStockSymobolsToString += `,${trend.stock}.AU`;
  //           }
  //           this.StocksProvider.watchlistRealtimeStockPrices = await this.StocksProvider
  //           .loadRealtimeStockPrices(this.watchlistRealtimeStockSymobolsToString.substr(1)).toPromise();
  //           this.StocksProvider.getSymbolByCode(_.sortBy(trending, 'count').reverse(), 'trending').then(response => {
  //             this.StocksProvider.trendingStocksStorageSource.next(response);
  //             this.trending = [];
  //             this.stocks.list = response;
  //             this.stocks.preLoader = false;
  //           });
  //         });
  //       })
  //     });
  //   });
  // }

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

  navigateToStockPage(stock) {
    this.StocksProvider.navigateToStockPage(this.stockPage, stock);
  }
}

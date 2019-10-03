import { Component, Input } from '@angular/core';
import * as lodash from 'lodash';

import { StockviewPage } from '../../pages/stockview/stockview';
import { StocksProvider } from '../../providers/stocks/stocks';

/**
 * Generated class for the StockAllComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'ion-stock-all',
  templateUrl: 'stock-all.html'
})
export class StockAllComponent {

  	// @Input() stock: String;
    stockPage = StockviewPage;
    offset: number = 0;
    limit: number = 10;

    stocks: any = {
        list: [],
        totalPage: 0,
    };

  	constructor(
        public StocksProvider: StocksProvider
    ) {
        if(!this.StocksProvider.stocks.length) {
            this.StocksProvider.loadSymbols()
                .then(response => {
                    var responseLength = response instanceof Array ? response.length : 0;
                    this.stocks.totalPage = responseLength / this.limit;

                    this.StocksProvider.getSymbolsByOffset(this.offset, this.limit)
                        .then(result => {
                            this.offset = this.offset + this.limit;
                            lodash.merge(this.stocks.list, result)
                        });
                });
        }
        else {
            this.stocks.list = this.StocksProvider.stocks;
            this.offset = this.stocks.list.length;
            this.stocks.totalPage = this.StocksProvider.symbols.length / this.limit;
        }
    }

    loadMore(infiniteScroll) {
        this.StocksProvider.getSymbolsByOffset(this.offset, this.limit)
            .then(result => {
                this.offset = this.offset + this.limit;
                lodash.merge(this.stocks.list, result)
                infiniteScroll.complete();
            });
    }
}

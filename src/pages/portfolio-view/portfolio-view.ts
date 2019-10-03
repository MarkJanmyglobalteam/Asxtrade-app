import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Stock, ShareValue } from '../../models/stock';
import { PortfolioAddSharesComponent } from '../../components/portfolio-add-shares/portfolio-add-shares';
import moment from 'moment';
import { StocksProvider } from '../../providers/stocks/stocks';
import { StockviewPage } from '../stockview/stockview';
/**
 * Generated class for the PortfolioViewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-portfolio-view',
  templateUrl: 'portfolio-view.html',
})
export class PortfolioViewPage {
  stock: Stock;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public stocksProvider: StocksProvider,
  ) {
    this.stock = this.navParams.data;``
    console.log(this.stock , 'this.stock');
    console.log(this.stock.name , 'this.stock');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PortfolioViewPage');
  }

  presentBuySellShareModal(isSelling: boolean, index: number = -1) {
    let profileModal = this.modalCtrl.create(PortfolioAddSharesComponent,
      { stock: this.stock, isSelling: isSelling, shareIndex: index });
    profileModal.present();
  }


  get overallProfitStatus() {
    let totalProfit = this.stock.portfolioData.calculateProfit(this.stock.close);
    return totalProfit > 0 ? 'up' : totalProfit < 0 ? 'down' : '';
  }

  getProfitStatus(share: ShareValue) {
    let profit = share.calculateProfit(this.stock.close);
    return profit > 0 ? 'up' : profit < 0 ? 'down' : '';
  }

  private formatNumber(value: number, digits) {
    let isNegative = false;
    // value = isNaN(value) ? 0 : value;
    // if(decimalCount) {
    //  if(value < 0) {
    //    value = Math.abs(value);
    //    isNegative = true;
    //  } else {
    //    value = value;
    //  }
    //  value = this.abbrNum(value, decimalCount).toLocaleString('en', { maximumFractionDigits: decimalCount, minimumFractionDigits: decimalCount });
    //   return isNegative ? '-' + value : value ;
    // } else {
    //   return value.toLocaleString('en', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
    // }


    if(digits) {
      if(value < 0) {
        value = Math.abs(value);
        isNegative = true;
      } else {
        value = value;
      }
      value =  this.stocksProvider.abbrNum(value, digits).toLocaleString('en', { maximumFractionDigits: digits, minimumFractionDigits: digits });
      return isNegative ? '-' + value : value ;
    } else {
      return value.toLocaleString('en', { maximumFractionDigits: digits, minimumFractionDigits: digits });
    }
  }


  private formatDate(date: string) {
    return moment(date).format('DD-MM-YYYY');
  }

  private navigateToStockPage() {
    this.stocksProvider.navigateToStockPage(StockviewPage, this.stock);
  }
}

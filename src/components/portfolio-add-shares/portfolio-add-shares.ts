import { Component, Input } from '@angular/core';
import { ShareValue, Stock } from '../../models/stock';
import moment from '../../../node_modules/moment';
import { NavParams, ViewController, LoadingController } from 'ionic-angular';

/**
 * Generated class for the PortfolioAddSharesComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'portfolio-add-shares',
  templateUrl: 'portfolio-add-shares.html'
})
export class PortfolioAddSharesComponent {
  share: ShareValue;
  stock: Stock;

  isSelling: boolean = false;
  shareIndex: number = -1;

  currentDate: string;
  soldShare: ShareValue;

  constructor(params: NavParams,
    public viewCtrl: ViewController,
    public loadingCtrl: LoadingController
    ) {
    this.stock = params.get('stock');
    this.isSelling = params.get('isSelling');
    this.shareIndex = params.get('shareIndex');

    this.currentDate = moment().format('YYYY-MM-DD');

    if (this.isSelling) {
      let share = this.stock.portfolioData.shares[this.shareIndex];
      this.soldShare = new ShareValue(share);

      this.share = new ShareValue(share);
      this.share.tradeDate = this.currentDate
    } else {
      this.share = new ShareValue({
        tradeDate: this.currentDate,
        shareCount: 0
      });
    }
  }

  ngOnInit() {
    if (this.isSelling) {
      let maxShareCount = this.stock.portfolioData.shares[this.shareIndex].shareCount;
      document.getElementById('shareCount').setAttribute('max', maxShareCount.toString());
    }
  }

  saveShares() {
    let loader = this.loadingCtrl.create({
      content: 'Loading...',
    })
    loader.present();
    this.stock.updateShares(this.share, this.isSelling, this.shareIndex)
      .then(isSuccess => {
        if (isSuccess) {
          loader.dismiss();
          this.dismiss();
        }
      });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  private get isValidShareCount() {
    if (this.share) {
      let hasValue = +this.share.shareCount > 0;
      let notOverMax = this.isSelling ?
        +this.share.shareCount <= this.stock.portfolioData.shares[this.shareIndex].shareCount :
        true;

      return hasValue && notOverMax;
    }

    return false;
  }

  private formatNumber(value: number, decimalCount: number = 2) {
    return value.toLocaleString('en', { maximumFractionDigits: decimalCount, minimumFractionDigits: decimalCount });
  }

  private formatDate(date: string) {
    const d = new Date(date);
    return `${d.getDate()}-${d.toLocaleString("en-us", { month: "long" })}-${d.getFullYear()}`;
  }

}

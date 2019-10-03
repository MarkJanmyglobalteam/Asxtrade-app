import { Component } from '@angular/core';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2/database';
import { UserProvider } from '../../providers/user/user-provider';
import { StocksProvider } from '../../providers/stocks/stocks';
import { Stock, Portfolio } from '../../models/stock';
import * as _ from 'lodash';
import { User } from '../../models/user';

/**
 * Generated class for the RankingComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */


@Component({
  selector: 'ranking',
  templateUrl: 'ranking.html'
})
export class RankingComponent {
  users : object;
  preLoader: boolean = true;
  groupedPortfolio: object = {};
  private rankingSubs = ['Main' , 'SMSF' , 'Trading']; 
  private selectedSub = 'Main';
  // ranks = [];
  selectedBoard : string = 'Main'

  private userPortfolios: object = {};

  private _subscription: Subscription = new Subscription();
  set subscription(value: Subscription) {
    this._subscription.add(value);
  }

  constructor(private db: AngularFireDatabase,
    private userProvider: UserProvider,
    private stockProvider: StocksProvider) {
  
    // this.getUsers();
    // this.getPortfolios();
    
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.onSubActive('Main')
 
  }

  // getPortfolios(){
  //       this.subscription = this.db.object('/portfolios/')
  //         .valueChanges()
  //         .subscribe(async userPortfolios => {

  //             console.log('userPortfolios',userPortfolios);
  //             let userIds = Object.keys(userPortfolios);
  //             console.log('userIds',userIds);
             
  //             for (let userId of userIds) {
  //               let userPortfolio = userPortfolios[userId];
  //               console.log('userPortfolio' ,userPortfolio)
  //               let portfolioKeys = Object.keys(userPortfolio);
  //               console.log(portfolioKeys);
  //               for  (let portfolioKey of portfolioKeys){
  //                 if(userPortfolio[portfolioKey].portfolio == this.selectedSub && !(this.ranks.findIndex(x => x.userID === userId) > -1)   ){

  //                      let rank = {userID : userId , userData: this.users[userId] , portfolio : userPortfolio[portfolioKey] }
              
                      
  //                        this.ranks.push(rank);
                      
  //                      console.log('subRanks' , this.ranks);
  //                 }
  //               }
  //             }
              

  //          }
  //         );
  // }

  // getUsers(){
  //    this.subscription = this.db.object('/userData/')
  //         .valueChanges()
  //         .subscribe(async userData => {
  //           this.users = userData;
  //           console.log('users',this.users);
  //    });
  // }


  // onSubActive(sub) {
  //   console.log("onSubActive", sub);
  //   this.ranks = [];
  //   this.selectedSub = sub;
  //   this.getUsers();
  //   this.getPortfolios();
  // }

//end of mine

  private onSubActive(sub){
    console.log('onSubActive' , sub);
    this.userPortfolios = {};
    this.selectedBoard = sub;
    this.getRanking(sub)
  }

  private get ranks() {
    // console.log(Object.keys(this.groupedPortfolio));
    return Object.keys(this.groupedPortfolio);

  }

  formatNumber(value: number, decimalCount: number = 2) {
    return value.toLocaleString('en', { maximumFractionDigits: decimalCount, minimumFractionDigits: decimalCount });
  }

  private calculateRanking(rankingSource) {
    this.userPortfolios = {};
    this.subscription = this.db.object('/portfolios/')
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
            portfolio.portfolio = portfolio.portfolio || this.rankingSubs[0];
            return new Portfolio(portfolio);
      
            // if(portfolioStocks[x].portfolio == this.selectedSub){
            //   console.log(portfolioStocks[x])
            //     return portfolioList.push(new Portfolio(portfolioStocks[x]));
            // }

          })
          .filter(x => x.portfolio === this.selectedBoard);

          

          // console.log('portfolioList' , portfolioList)

          if(portfolioList && portfolioList.length > 0){
            console.log(portfolioList)
            console.log(portfolioList.length)
          let stockList: Stock[] = await this.stockProvider.getSymbolByCode(portfolioList, 'portfolio', userId) as Stock[];
          stockList = _.sortBy(stockList, ['symbol']);
          // console.log('stockList' , stockList)
          stockList.forEach(x => {
            this.subscription = x.onDataChange().subscribe(dataChanged => {

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

    this.stockProvider[rankingSource].next(rankValues);
  }

  private getRanking(sub) {
    // this.calculateRanking();
    this.subscription = this.stockProvider[`rankingValues${sub}`]
      .subscribe(rankValues => {
        console.log('rankValues' + sub , rankValues)
        if(rankValues.length === 0) {
          // this.preLoader = true;
          this.calculateRanking(`rankingValues${sub}Source`);
        } else {
          this.groupedPortfolio = {};

        for (let rankData of rankValues) {
          let value = rankData.rank;
          let groupedValue = this.groupedPortfolio[value] || {};

          for (let userId of rankData.userIds) {
            this.subscription = this.userProvider.getById(userId)
              .subscribe(user => {
                user = new User(user);

                if (groupedValue.otherUsers) {
                  groupedValue.otherUsers = groupedValue.otherUsers;
                  groupedValue.otherUsers.push(user.username);
                } else {
                  groupedValue.otherUsers = [];
                  groupedValue.name = user.username;
                }

                groupedValue.movement = rankData.movement;
                groupedValue.status = rankData.status;

                this.groupedPortfolio[value] = groupedValue;
                this.preLoader = false;
              });
          }
        }
        this.preLoader = false;

        }

        console.log(this.groupedPortfolio);
      });
  }


  private rankingValuesMainSource = new BehaviorSubject<RankValue[]>([]);
  private rankingValuesMain = this.rankingValuesMainSource.asObservable();
  
  private rankingValuesSMSFSource = new BehaviorSubject<RankValue[]>([]);
  private rankingValuesSMSF = this.rankingValuesSMSFSource.asObservable();

  private rankingValuesTradingSource = new BehaviorSubject<RankValue[]>([]);
  private rankingValuesTrading = this.rankingValuesTradingSource.asObservable();

  getRankingValues()  {
   return this.rankingValuesMainSource.asObservable();
  }



  ionViewDidLeave() {
    this._subscription.unsubscribe();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    
    this._subscription.unsubscribe();
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

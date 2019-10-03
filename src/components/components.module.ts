import { NgModule } from '@angular/core';
import { StockAllComponent } from './stock-all/stock-all';
import { WatchlistComponent } from './watchlist/watchlist';
import { TrendingComponent } from './trending/trending';
import { FollowComponent } from './follow/follow';
import { StreamModalComponent } from './stream-modal/stream-modal';
import { TweetModalComponent } from './tweet-modal/tweet-modal';
import { TopMoversComponent } from './top-movers/top-movers';
import { LosersComponent } from './losers/losers';
import { PortfolioComponent } from './portfolio/portfolio';
import { IonicModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { TermsOfUseAndPrivacyPolicyComponent } from './terms-of-use-and-privacy-policy/terms-of-use-and-privacy-policy';
import { PortfolioAddSharesComponent } from './portfolio-add-shares/portfolio-add-shares';
import { RankingComponent } from './ranking/ranking';

@NgModule({
  declarations: [
    StockAllComponent,
    WatchlistComponent,
    TrendingComponent,
    FollowComponent,
    StreamModalComponent,
    TweetModalComponent,
    TopMoversComponent,
    LosersComponent,
    PortfolioComponent,
    TermsOfUseAndPrivacyPolicyComponent,
    PortfolioAddSharesComponent,
    RankingComponent
  ],
  imports: [
    IonicModule,
    CommonModule
  ],
  exports: [
    StockAllComponent,
    WatchlistComponent,
    TrendingComponent,
    FollowComponent,
    StreamModalComponent,
    TweetModalComponent,
    TopMoversComponent,
    LosersComponent,
    PortfolioComponent,
    TermsOfUseAndPrivacyPolicyComponent,
    PortfolioAddSharesComponent,
    RankingComponent
  ],
  entryComponents: [
    StreamModalComponent,
    TweetModalComponent
  ]
})
export class ComponentsModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PortfolioViewPage } from './portfolio-view';
import { PortfolioAddSharesComponent } from '../../components/portfolio-add-shares/portfolio-add-shares';

@NgModule({
  declarations: [
    PortfolioViewPage,
  ],
  imports: [
    IonicPageModule.forChild(PortfolioViewPage),
  ],
  entryComponents: [PortfolioAddSharesComponent]
})
export class PortfolioViewPageModule { }

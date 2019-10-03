import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { QuestionnaireProvider } from '../../providers/questionnaire/questionnaire';
import { TermsAgreementPage } from '../terms-agreement/terms-agreement';

/**
 * Generated class for the QuestionnaireStockQuestionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-questionnaire-stock-questions',
  templateUrl: 'questionnaire-stock-questions.html',
})
export class QuestionnaireStockQuestionsPage {
  riskProfileOptions: number[] = [1,2,3,4,5];

  sharePortfolioOptions: string[] = [
    'Personnel',
    'Company',
    'SMSF'
  ];

  tradingBasisOptions: string[] = [
    'Fundamental analysis',
    'Technical',
    'Broker research',
    'Gossip / chat forums'
  ];

  investmentSectorOptions: string[] = [
    'Mining',
    'Energy',
    'Tech',
    'Bio - tech',
    'Industrials',
    'ASX 200',
    'Speculative'
  ];

  form: SurveyForm = {
    profileRisk: 3,
    sharePortfolio: [],
    tradingBasis: [],
    investmentSectors: [],
    qualified708Investor: false
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public questionProvider: QuestionnaireProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuestionnaireStockQuestionsPage');
  }

  updateSharePortfolio(shouldAddToList, option) {
    if (shouldAddToList) {
      this.form.sharePortfolio.push(option);
    } else {
      this.form.sharePortfolio = this.form.sharePortfolio.filter(opt => opt !== option);
    }
  }

  updateTradingBasis(shouldAddToList, option) {
    if (shouldAddToList) {
      this.form.tradingBasis.push(option);
    } else {
      this.form.tradingBasis = this.form.tradingBasis.filter(opt => opt !== option);
    }
  }

  updateInvestmentSectors(shouldAddToList, option) {
    if (shouldAddToList) {
      this.form.investmentSectors.push(option);
    } else {
      this.form.investmentSectors = this.form.investmentSectors.filter(opt => opt !== option);
    }
  }

  submitForm() {
    this.questionProvider.submitStockQuestionsAnswers(this.form).then( () => {
      console.log('Questionnare Answered');
      this.navCtrl.setRoot(TermsAgreementPage);
    }).catch(err => {
      console.error('Questiommare Failed', err);
    })
  }
}

class SurveyForm {
  profileRisk: number;
  sharePortfolio: string[];
  tradingBasis: string[];
  investmentSectors: string[];
  qualified708Investor: boolean;
}

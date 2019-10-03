import { Component, ViewChild } from "@angular/core";
import { Nav, Platform, App } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";

import { HomePage } from "../pages/home/home";
import { TermsAgreementPage } from "../pages/terms-agreement/terms-agreement";

import { OneSignal, OSNotificationPayload } from "@ionic-native/onesignal";
import { isCordovaAvailable } from "../common/is-cordova-avaliable";
import { PushProvider } from "../providers/push/push";
import { Subscription } from "rxjs";
import { AngularFireDatabase } from "angularfire2/database";
import { StocksProvider } from "../providers/stocks/stocks";
import * as firebase from "firebase";
import * as _ from "lodash";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  @ViewChild(Nav)
  nav: Nav;
  rootPage: any = HomePage;
 

 

  pages: Array<{ title: string; component: any; params?: any }>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private app: App,
    public db: AngularFireDatabase,
    private StocksProvider: StocksProvider
  ) {
  
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: "Home", component: HomePage },
      {
        title: "Terms of use and privacy policy",
        component: TermsAgreementPage,
        params: true
      }
    ];
  }
 

  initializeApp() {
    
    this.platform.ready().then(() => {
      
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component, page.params);
  }
  
}

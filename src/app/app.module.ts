import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Keyboard } from '@ionic-native/keyboard';
import { HttpModule } from '@angular/http';
import { ElasticModule } from 'angular2-elastic';
import { HttpClientModule } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Camera } from '@ionic-native/camera';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

// AngularFire
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

// 3rd Party
import { NgPipesModule } from 'ngx-pipes';
import { AutoCompleteModule } from 'ionic2-auto-complete';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { OneSignal } from '@ionic-native/onesignal';  

// Components
import { MyApp } from './app.component';

// Environment
import { env } from './app.env';

// Common app modules
import { ComponentsModule } from '../components/components.module';
import { DirectivesModule } from '../directives/directives.module';
import { PipesModule } from '../pipes/pipes.module';

// Page Modules
import { AddMoreGroupChatMembersPageModule } from '../pages/add-more-group-chat-members/add-more-group-chat-members.module';
import { ChangePasswordPageModule } from '../pages/change-password/change-password.module';
import { ChatPageModule } from '../pages/chat/chat.module';
import { ChatOptionsPageModule } from '../pages/chat-options/chat-options.module';
import { ConversationPageModule } from '../pages/conversation/conversation.module';
import { EditProfilePageModule } from '../pages/edit-profile/edit-profile.module';
import { IntroPageModule } from '../pages/intro/intro.module';
import { LoginPageModule } from '../pages/login/login.module';
import { MyAccountPageModule } from '../pages/my-account/my-account.module';
import { NotificationsPageModule } from '../pages/notifications/notifications.module';
import { SearchIndividualUsersChatPageModule } from '../pages/search-individual-users-chat/search-individual-users-chat.module';
import { SearchMultipleUsersChatPageModule } from '../pages/search-multiple-users-chat/search-multiple-users-chat.module';
import { StocksPageModule } from '../pages/stocks/stocks.module';
import { StockviewPageModule } from '../pages/stockview/stockview.module';
import { UserProfilePageModule } from '../pages/user-profile/user-profile.module';

// Pages without Module
import { CreateAccountPage } from '../pages/create-account/create-account';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

// Providers
import { QuestionnaireProvider } from '../providers/questionnaire/questionnaire';
import { StocksProvider } from '../providers/stocks/stocks';
import { HelpersProvider } from '../providers/helpers/helpers';
import { TwitterProvider } from '../providers/twitter/twitter';
import { SearchStockProvider } from '../providers/search-stock/search-stock';
import { AsxScrapesProvider } from '../providers/asx-scrapes/asx-scrapes';
import { UserProvider } from '../providers/user/user-provider';
import { ConversationProvider } from '../providers/conversation/conversation';
import { FirebaseStorageProvider } from '../providers/firebase-storage/firebase-storage';
import { UserSettingsPageModule } from '../pages/user-settings/user-settings.module';
import { AddAnnouncementPageModule } from '../pages/add-announcement/add-announcement.module';
import { NotificationsProvider } from '../providers/notifications/notifications-provider';
import { AddCommentModalPageModule } from '../pages/add-comment-modal/add-comment-modal.module';
import { AddCommentModalPage } from '../pages/add-comment-modal/add-comment-modal';
import { QuestionnaireBasicPersonalInfoPageModule } from '../pages/questionnaire-basic-personal-info/questionnaire-basic-personal-info.module';
import { QuestionnaireStockQuestionsPageModule } from '../pages/questionnaire-stock-questions/questionnaire-stock-questions.module';
import { TermsAgreementPageModule } from '../pages/terms-agreement/terms-agreement.module';
import { PortfolioViewPageModule } from '../pages/portfolio-view/portfolio-view.module';
import { PushProvider } from '../providers/push/push';
import { EmailVerificationProvider } from '../providers/email-verification/email-verification';
import { ResetPasswordPageModule } from '../pages/reset-password/reset-password.module';
import { AddWatchlistModalPageModule } from '../pages/add-watchlist-modal/add-watchlist-modal.module';

import { IonicStorageModule } from '@ionic/storage';


@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    HomePage,
    CreateAccountPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, { scrollAssist: false, autoFocusAssist: false }),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(env.FIREBASE),
    PipesModule,
    DirectivesModule,
    ComponentsModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,

    TermsAgreementPageModule,

    QuestionnaireBasicPersonalInfoPageModule,
    QuestionnaireStockQuestionsPageModule,

    NotificationsPageModule,
    EditProfilePageModule,
    ChangePasswordPageModule,
    StocksPageModule,
    StockviewPageModule,
    MyAccountPageModule,
    LoginPageModule,
    UserProfilePageModule,
    IntroPageModule,
    ChatPageModule,
    SearchIndividualUsersChatPageModule,
    SearchMultipleUsersChatPageModule,
    ChatOptionsPageModule,
    ConversationPageModule,
    AddMoreGroupChatMembersPageModule,
    HttpModule,
    ElasticModule,
    NgPipesModule,
    HttpClientModule,
    AutoCompleteModule,
    LazyLoadImageModule,
    UserProfilePageModule,
    UserSettingsPageModule,
    AddAnnouncementPageModule,
    AddCommentModalPageModule,
    AddWatchlistModalPageModule,
    PortfolioViewPageModule,
    ResetPasswordPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    HomePage,
    CreateAccountPage,
    AddCommentModalPage
  ],
  providers: [
    Keyboard,
    StatusBar,
    SplashScreen,
    AngularFireDatabase,
    OneSignal,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    StocksProvider,
    HelpersProvider,
    TwitterProvider,
    InAppBrowser,
    OpenNativeSettings,
    SearchStockProvider,
    Camera,
    AsxScrapesProvider,
    UserProvider,
    ConversationProvider,
    FirebaseStorageProvider,
    FileChooser,
    FilePath,
    NotificationsProvider,
    QuestionnaireProvider,
    PushProvider,
    EmailVerificationProvider
  ]
})
export class AppModule {}

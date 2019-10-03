import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  Content,
  ModalController,
  AlertController,
  App,
  ToastController
} from "ionic-angular";
import { InAppBrowser } from "@ionic-native/in-app-browser";

import { AngularFireDatabase } from "angularfire2/database";
import * as firebase from "firebase";
import * as _ from "lodash";
import moment from "moment";

import { Stock } from "../../models/stock";
import { User } from "../../models/user";
import { StocksProvider } from "../../providers/stocks/stocks";
import { HelpersProvider } from "../../providers/helpers/helpers";
import { TwitterProvider } from "../../providers/twitter/twitter";
import { AsxScrapesProvider } from "../../providers/asx-scrapes/asx-scrapes";
import { TweetModalComponent } from "../../components/tweet-modal/tweet-modal";
import { AddCommentModalPage } from "../add-comment-modal/add-comment-modal";
import { AddWatchlistModalPage } from "../add-watchlist-modal/add-watchlist-modal";
import { Subscription, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RankingComponent } from "../../components/ranking/ranking";
import { UserProvider } from "../../providers/user/user-provider";



@IonicPage()
@Component({
  selector: "page-stockview",
  templateUrl: "stockview.html"
})
export class StockviewPage {
  @ViewChild(Content)
  content: Content;

  stock: Stock;
  selectedSegment: string;
  tweets: Array<any>;
  timelineTweets: Array<any>;
  announcements: any;
  loader: any;
  commentsLoader: any;
  tweetLimit: 30;
  hasMoreTweets: boolean;
  defaultPhotoUrl = "assets/dp-placeholder.png";
  offset = 100;
  isRetrievingData = true;
  subscription : Subscription;
  subscriptionWatchlist : Subscription;
  userPortfoliosSubcription : Observable<{}[]>;
  userPortfolios : Array<any> = [];
  userWatchlists : Array<any> = []
  portfolios: Array<{}>;
  watchlists: Array<any> ;
  watchlistSubscription: Observable<{}[]>;
  watched;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public StocksProvider: StocksProvider,
    private _helpersProvider: HelpersProvider,
    private _twitterProvider: TwitterProvider,
    private iab: InAppBrowser,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public db: AngularFireDatabase,
    private _asxScrapesProvider: AsxScrapesProvider,
    public app: App,
    public toastCtrl: ToastController,
    public userProvider: UserProvider    
  ) {
    this.stock = this.navParams.data;
    console.log(this.navParams.data, 'this.navParams.data');
    
    this.stock.getStreams();
    this.selectedSegment = this._helpersProvider.getStockSegment();
    this.tweets = [];
    this.timelineTweets = [];
    this.announcements = [];
    this.subscription ;
    this.userPortfoliosSubcription = this.getUserPortfolios()
    .snapshotChanges()
  .pipe(map(items => {            // <== new way of chaining
    return items.map(a => {
      const data = a.payload.val();
      const key = a.payload.key;
      return {key, data};           // or {key, ...data} in case data is Obj
    });
  }));
  this.subscription = this.userPortfoliosSubcription.subscribe(
    res =>{
      this.portfolios = res;
      this.userPortfolios = (_.map(_.map(res,"data") , "portfolio"));
    
    }
  );
  // this.watchlistSubscription = this.getUserWatchlist()
  //   .snapshotChanges()
  // .pipe(map(items => {            // <== new way of chaining
  //   return items.map(a => {
  //     const data = a.payload.val();
  //     const key = a.payload.key;
  //     return {key, data};           // or {key, ...data} in case data is Obj
  //   });
  // }));
  // this.subscriptionWatchlist = this.watchlistSubscription.subscribe(
  //   res =>{
  //     console.log(res , 'watchlistsubscription');
  //     const data = res as Array<any>;
  //     this.watchlists = data.filter(val=>{ val.data});
  //     this.userWatchlists =  (_.map(_.map(res,"data") , "list"));
  //   }
  // )

  
  


    // .valueChanges()
    // .subscribe(res=>{
    //   console.log(res);
    //   // this.userPortfolios = _.map(res, 'portfolio' );
    //   // this.subscription.unsubscribe();
    // })

 
  }

  ionViewDidLeave() {
    this._helpersProvider.setStockSegment("asm");
    this._twitterProvider.setMaxId();
    // this._twitterProvider.unsubscribeFromTweets();
  }

  viewLink(url) {
    event.preventDefault();
    this.iab.create(url, "_blank");
  }

  openPdf(url) {
    this.iab.create(url, "_system");
  }

  onSegmentChanged(e) {
    this.content.scrollToTop();
    this._helpersProvider.setStockSegment(this.selectedSegment);
    this.isRetrievingData = true;
    switch (this.selectedSegment) {
      case "asm":
        this._twitterProvider.setMaxId();
        this.tweets.length = 0;
        break;
      case "twitter":
        this.presentLoading("Searching for tweets...");
        this.fetchTweets().then(() => {
          this.isRetrievingData = false;
        });
        break;
      case "company":
        this.presentLoading("Fetching timeline tweets...");
        this.timelineTweets.length = 0;
        this._twitterProvider.setMaxId();
        this.fetchTimelineTweets().then(() => {
          console.log("isRetrievingData", this.isRetrievingData);
          this._twitterProvider.unsubscribeFromTweets();
          this.isRetrievingData = false;
        });
        break;
      case "announcements":
        this.presentLoading("Fetching ASX announcements...");
        this.announcements.length = 0;
        this.fetchAnnouncements(this.stock.symbol).then(() => {
          this.isRetrievingData = false;
        });
        break;
      default:
        this.navCtrl.pop();
    }
  }

  fetchAnnouncements(companyTicker: string) {
    return new Promise((resolve, reject) => {
      const promise = this._asxScrapesProvider.fetchAnnouncements(
        this.stock.symbol
      );
      promise.then((response: any[]) => {
        // Group announcements by dates
        this.announcements = _.chain(response)
          .groupBy("date")
          .map((announcements, date) => ({ announcements, date }))
          .value();
        // console.log('announcements:', this.announcements);
        this.loader.dismiss();
        resolve(response);
      });
      promise.catch((error: any) => {
        console.error(error);
        reject(false);
      });
    });
  }

  fetchTweets(concat: boolean = false) {
    return new Promise((resolve, reject) => {
      const promise = this._twitterProvider.fetchTweets(
        `$${this.stock.symbol}`
      );
      promise.then((response: Array<any>) => {
        if (concat) {
          response.shift();
          if (response.length > 0) {
            response.forEach(r => {
              const checkIndex = this.tweets.findIndex(
                tweet => tweet.uid === r.uid
              );
              if (checkIndex < 1) {
                this.tweets.push(r);
              }
              console.log(checkIndex);
            });
            // this.tweets = Array.from(new Set(this.tweets.concat(response)));
          } else {
            this.hasMoreTweets = false;
          }
        } else {
          this.hasMoreTweets = true;
          this.tweets = response;
          this.loader.dismiss();
        }
        resolve(true);
      });
      promise.catch((error: any) => {
        console.error(error);
        reject(error);
      });
    });
  }

  fetchTimelineTweets() {
    return new Promise((resolve, reject) => {
      const promise = this._twitterProvider.fetchTimelineTweets(
        this.stock.symbol
      );
      promise
        .then((response: Array<any>) => {
          this.timelineTweets = response;
          this.loader.dismiss();
          resolve(response);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  }

  presentLoading(content = "Connecting to twitter...") {
    this.loader = this.loadingCtrl.create({
      content
    });
    this.loader.present();
  }

  presentCommentsLoading() {
    this.commentsLoader = this.loadingCtrl.create({
      content: "Loading comments..."
    });
    this.commentsLoader.present();
  }

  loadMoreTweets(infiniteScroll) {
    if (this.hasMoreTweets) {
      this.fetchTweets(true).then((done: boolean) => {
        if (done) infiniteScroll.complete();
      });
    }
  }

  openTweetModal() {
    let modal = this.modalCtrl.create(TweetModalComponent, {
      symbol: this.stock.symbol
    });
    modal.present();
    modal.onDidDismiss(data => {
      if (!data) {
        console.log(data);
      } else {
        // hack for counting likes and shares
        const likes = [];
        const retweets = [];
        likes.length = data.favorite_count;
        retweets.length = data.retweet_count;
        // hack for counting likes and shares
        let post = data.hasOwnProperty("retweeted_status")
          ? `${data.full_text.substr(0, data.full_text.indexOf(":"))}: ${
          data.retweeted_status.full_text
          }`
          : data.full_text;
        if (data.entities.hasOwnProperty("media")) {
          for (let x = 0; x < data.entities.media.length; x++) {
            post += `<br><br><img src="${data.entities.media[x].media_url}">`;
          }
        }
        const newTweet = {
          timestamp: data.created_at,
          post,
          likes,
          retweets,
          user: {
            id: data.user.id,
            photoUrl: data.user.profile_image_url,
            firstname: data.user.name,
            lastname: null
          },
          uid: data.id,
          tweet: true,
          timeago: moment(data.created_at)
            .startOf("hour")
            .fromNow()
        };
        const newArr = [...this.tweets];
        newArr.unshift(newTweet);
        this.tweets = newArr;
      }
    });
  }

  showCommentPrompt(post) {
    this.fetchComments(post);
    let modal = this.modalCtrl.create(AddCommentModalPage, post);
    modal.present();
    // modal.onDidDismiss(data => {
    //   if (!data.save) return false;

    //   if (!data.message) return false;
    //   // let id$ = firebase.auth().currentUser.uid;
    //   // const commentsRef = this.db.list("comments").push({
    //   //   user_id: id$,
    //   //   post_id: post.post_id,
    //   //   message: data.message,
    //   //   created_at: Date.now()
    //   // });
    //   // commentsRef.then(() => {
    //     this.fetchComments(post);
    //   // });
    // });
    // modal.present();
  }

  /*
	* Get comments
	*/
  getComments(post_id) {
    return new Promise(resolve => {
      const commentsRef = this.db
        .list("comments", ref => ref.orderByChild("post_id").equalTo(post_id))
        .valueChanges();
      commentsRef.subscribe(comments => {
        resolve(comments);
      });
    });
  }

  /*
	* Get user data
	*/
  getUserData(uuid) {
    return new Promise(resolve => {
      const userDataRef = this.db
        .list("userData", ref => ref.orderByChild("uuid").equalTo(uuid))
        .valueChanges();
      userDataRef.subscribe(user => {
        resolve(user);
      });
    });
  }

  loadComments(post) {
  this.db
    .list("comments", ref => ref.orderByChild("post_id").equalTo(post.post_id))
    .valueChanges().subscribe(async commentsSnapshot => {
      const newComments: Array<any> = [];
      let comments = commentsSnapshot as any;
      for(const commentData of comments) {
        const userData = await this.getUserData(commentData.user_id);
        newComments.push(
          commentData
        );
      }
     });

    // const commentsPromise = this.getComments(post.post_id);
    // return commentsPromise.then((commentsSnapshot: Array<any>) => {
    //   const comments = [];
    //   commentsSnapshot.forEach(commentData => {
    //     comments.push(
    //       this.getUserData(commentData.user_id).then((userData: any) => {
    //         commentData.user = Object.assign({}, userData[0]);
    //         return commentData;
    //       })
    //     );
    //   });
    //   return Promise.all(comments);
    // });
  }

  fetchComments(post) {
    console.log(post);
    this.presentCommentsLoading();

      this.db
    .list("comments", ref => ref.orderByChild("post_id").equalTo(post.post_id))
    .valueChanges().subscribe(async commentsSnapshot => {
      const newComments: Array<any> = [];
      let comments = commentsSnapshot as any;
      for(const commentData of comments) {
        const userData = await this.getUserData(commentData.user_id);
        commentData.user = Object.assign({}, userData[0]);
        newComments.push(
          commentData
        );
      }
      // this.loadComments(post).then((newComments: Array<any>) => {
        console.log(this.stock.streams);
        const i = this.stock.streams.findIndex(
          stockPost => stockPost.post_id === post.post_id
        );
        if (i >= 0) {
          console.log(i);
          this.stock.streams[i].param.comments = newComments.map(comment => {
            comment.created_at_formatted = moment(comment.created_at).format(
              "MMMM D, YYYY h:mm a"
            );
            return comment;
        });
        this.StocksProvider.currentPostCommentsSource.next( this.stock.streams[i].param.comments );
        }
        this.commentsLoader.dismiss();
      // });
     });

    
  }

  addtoWatchlist(symbol: String) {
    // let loaderMessage = `Adding ${stock.symbol} to watchlist...`;
    // let toastMessage = `Successfully added ${stock.symbol} to watchlist.`;

    // this.presentLoading(loaderMessage);
    // stock.addtoWatchlist().then(() => {
    //   this.loader.dismiss();
    //   this.toastCtrl
    //     .create({
    //       duration: 2000,
    //       position: "top",
    //       message: toastMessage
    //     })
    //     .present();
    // });

    let watchlistModal = this.modalCtrl.create(AddWatchlistModalPage, { symbol: symbol});
    // let watchlistModal = this.modalCtrl.create(AddWatchlistModalPage, { stock : stock , userWatchlists : this.userWatchlists , userWatchlistsData : this.watchlists});
    watchlistModal.onDidDismiss(data => {
      console.log('dismiss add to watchlist', data);
    });
    watchlistModal.present();

  }

  // removetoWatchlist(stock: Stock) {
  //   let loaderMessage = `Removing ${stock.symbol} from watchlist...`;
  //   let toastMessage = `Removed ${stock.symbol} from watchlist.`;

  //   this.presentLoading(loaderMessage);
  //   stock.removeWatchlist().then(() => {
  //     this.loader.dismiss();
  //     this.toastCtrl
  //       .create({
  //         duration: 2000,
  //         position: "top",
  //         message: toastMessage
  //       })
  //       .present();
  //   });
  // }
  chooseActionWatchlist(stock: String){
  //   let alert = this.alertCtrl.create();
  //  alert.setTitle('What do you want to do?');
  //  alert.addInput({
  //   type: 'radio',
  //   label: 'Add',
  //   value: 'add',
  //   checked: false
  //   });
  //   alert.addInput({
  //     type: 'radio',
  //     label:'Remove',
  //     value: 'remove',
  //     checked: false
  //   });
  //   alert.addButton('Cancel');
  //   alert.addButton({
  //     text: 'Ok',
  //     handler: (data: any) => {
  //       this.doActionWatchlist(data , stock);
  //     }
  //   }
  //   );
  //   alert.present();
    this.addtoWatchlist(stock);
  }

  doActionWatchlist(action,stock){
    console.log(action);
    if(action == "add"){
      this.addtoWatchlist(stock);
    }
    else{
      this.removetoWatchlist(stock);
    }
  }
  chooseActionPortfolio(stock: Stock){
    
   let alert = this.alertCtrl.create();
   alert.setTitle('What do you want to do?');
   alert.addInput({
    type: 'radio',
    label: 'Add',
    value: 'add',
    checked: false
    });
    alert.addInput({
      type: 'radio',
      label:'Remove',
      value: 'remove',
      checked: false
    });
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Ok',
      handler: (data: any) => {
        this.doActionPortfolio(data , stock);
      }
    }
    );
    alert.present();

  }
  doActionPortfolio(action , stock){
    console.log(action);
    console.log(this.userPortfolios , 'portfolios user')
    if(action == 'add'){
      this.addtoPortfolio(stock)
    }
    else{
      this.removetoPortfolio(stock);
    }
  }
  

  addtoPortfolio(stock: Stock) {
    
    
   let isChecked =  false;
   let PORTFOLIOS =  ['Main', 'SMSF', 'Trading'];
   let hasPortfolios = [];
   let alert = this.alertCtrl.create();

   alert.setTitle('Select portfolio');


    console.log(this.userPortfolios)
    
      PORTFOLIOS.forEach((val,i)=>{
        console.log(val , i);
        console.log(this.userPortfolios.indexOf(val) , 'condition');  
        console.log(this.userPortfolios.indexOf(val) !== -1);
        if(this.userPortfolios.indexOf(val) !== -1){
          isChecked = true;
          hasPortfolios.push( PORTFOLIOS[i]);
        }
        alert.addInput({
          type: 'checkbox', 
          label: PORTFOLIOS[i],
          value: PORTFOLIOS[i],
          checked: isChecked,
          disabled: isChecked
        });
        isChecked = false;
      })


      alert.addButton('Cancel');
      alert.addButton({
        text: 'Ok',
        handler: (choices: any) => {
          let data = _.xor(choices, hasPortfolios);
          console.log('Radio data:', data);
          if(data.length > 0 && this.userPortfolios.length !== 3){
                let loaderMessage = `Adding ${stock.symbol} to portfolio...`;
                let toastMessage = `Successfully added ${stock.symbol} to portfolio.`;
                
                this.presentLoading(loaderMessage);
                  // data.forEach((val ,index)=>{
                  //       stock.addtoPortfolio(val).then(() => {
                
                        
                  //         if(index == data.length-1 ){
                  //           this.loader.dismiss();
                  //         this.toastCtrl
                  //           .create({
                  //             duration: 2000,
                  //             position: "top",
                  //             message: toastMessage
                  //           })
                  //           .present();
                  //         }
                  //       });
                  // })

               const asyncForLoop = async() =>{
                for(const val of data ) {
                  await stock.addtoPortfolio(val);
                  this.StocksProvider[`rankingValues${val}Source`].next([]);
                }
                this.loader.dismiss();
                this.toastCtrl
                  .create({
                    duration: 2000,
                    position: "top",
                    message: toastMessage
                  })
                  .present();
                  this.StocksProvider.getPortfolio().then(()=>{

                  })
                 
               }
               asyncForLoop();  
            }
        }
      });
  
      alert.present();

  }
  removetoWatchlist(stock: Stock) {
    let alert = this.alertCtrl.create();

    
        
    // let isFirst = true;
    // let PORTFOLIOS = ['Personnel' , 'Long term' , 'SMSF'];
    if( this.watchlists.length > 0){
    alert.setTitle('Select Watchlist to remove');
    this.watchlists.forEach((val,i)=>{
      console.log(val , i);
      // console.log(this.userPortfolios.indexOf(val));  
      // if(this.userPortfolios.indexOf(val) >= 0){

          alert.addInput({
            type: 'checkbox',
            label: val.data.list,
            value:val.data.list,
            checked: false
          });

        // alert.addInput({
        //   type: 'radio',
        //   label: PORTFOLIOS[i],
        //   value: PORTFOLIOS[i],
        //   checked: isFirst
        // });

        // isFirst = false;
      // }
    })
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Ok',
      handler: (data: any) => {
        console.log('Checkbox data:', data);
            
        let loaderMessage = `Removing ${stock.symbol} to watchlists...`;
        let toastMessage = `Successfully removed ${stock.symbol} to watchlists.`;
        this.presentLoading(loaderMessage);

        data.forEach((val , index)=>{
            this.removeWatchlist(this.watchlists , val)
            .then(() => {
                console.log('deleted' ,val)
              if(index == data.length-1 ){
                       this.loader.dismiss();
              this.toastCtrl
                .create({
                  duration: 2000,
                  position: "top",
                  message: toastMessage
                })
                .present();
              }

            });
        })

            // this.removePortfolio(this.portfolios , data)
            // .then(() => {
            //   this.loader.dismiss();
            //   this.toastCtrl
            //     .create({
            //       duration: 2000,
            //       position: "top",
            //       message: toastMessage
            //     })
            //     .present();
            // });
           
    
      }
    });
  }
  else{
    alert.setTitle("You don't have any Watchlist");
    alert.addButton('Ok');
 
  }

    alert.present();


  }
  removetoPortfolio(stock: Stock) {
    let alert = this.alertCtrl.create();

    
    if(this.userPortfolios.length > 0){
    alert.setTitle('Select portfolio to remove');
    // let isFirst = true;
    let PORTFOLIOS =  ['Main', 'SMSF', 'Trading'];

    PORTFOLIOS.forEach((val,i)=>{
      console.log(val , i);
      console.log(this.userPortfolios.indexOf(val));  
      if(this.userPortfolios.indexOf(val) >= 0){

          alert.addInput({
            type: 'checkbox',
            label: PORTFOLIOS[i],
            value: PORTFOLIOS[i],
            checked: false
          });

        // alert.addInput({
        //   type: 'radio',
        //   label: PORTFOLIOS[i],
        //   value: PORTFOLIOS[i],
        //   checked: isFirst
        // });

        // isFirst = false;
      }
    })

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Ok',
      handler: (data: any) => {
        console.log('Checkbox data:', data);
            
        let loaderMessage = `Removing ${stock.symbol} to portfolio...`;
        let toastMessage = `Successfully removed ${stock.symbol} to portfolio.`;
        this.presentLoading(loaderMessage);
        const asyncForLoop = async () => {
          for( const val of data ) {
            await this.removePortfolio(this.portfolios , val);
            console.log('deleted',val)
            this.StocksProvider[`rankingValues${val}Source`].next([]);
          }  

          this.loader.dismiss();
          this.toastCtrl
            .create({
              duration: 2000,
              position: "top",
              message: toastMessage
            })
            .present();
            this.StocksProvider.getPortfolio().then(() => {
              console.log('portfolio Refresh')
            })
        };
        asyncForLoop();
   
       
    
        
        // data.forEach(async (val , index)=>{
          
        // })

            // this.removePortfolio(this.portfolios , data)
            // .then(() => {
            //   this.loader.dismiss();
            //   this.toastCtrl
            //     .create({
            //       duration: 2000,
            //       position: "top",
            //       message: toastMessage
            //     })
            //     .present();
            // });
           
    
      }
    });
  }
  else{
    alert.setTitle("You don't have any Portfolio");
    alert.addButton('Ok');
  }
  alert.present();
  

  }

  viewUserProfile(userId: string) {
    console.log("I'm going to user's profile:", userId);
    this.app.getRootNav().push("UserProfilePage", { anotherUserId: userId });
  }

  getUserPortfolios(){
    return this.db.list('/portfolios/'+this.navParams.data.userId , ref => ref.orderByChild('stock').equalTo(this.navParams.data.symbol) )

  }
  getUserWatchlist(){
    return this.db.list('/watchlists/'+this.navParams.data.userId , ref => ref.orderByChild('stock').equalTo(this.navParams.data.symbol) )

  }


 removePortfolio(portfolios , portfolioType ) {
      // console.log(portfolios.filter( p => p.data.portfolio === portfolioType ))
      // let portfolioId = portfolios.filter( p => p.data.portfolio === portfolioType )[0].key;
      // console.log(portfolioId);
      // return this.db.object('/portfolios/' + this.navParams.data.userId+'/'+portfolioId)
      // .set(null);
      console.log(portfolios);
      console.log(portfolioType);
      let portfolioId = portfolios.filter( p => p.data.portfolio === portfolioType )
      console.log(portfolioId[0].key);
   return this.db.list('/portfolios/'+this.navParams.data.userId + '/'+portfolioId[0].key )
   .remove()

        
  }
  removeWatchlist(watchlists , watchlistType ) {
    // console.log(portfolios.filter( p => p.data.portfolio === portfolioType ))
    // let portfolioId = portfolios.filter( p => p.data.portfolio === portfolioType )[0].key;
    // console.log(portfolioId);
    // return this.db.object('/portfolios/' + this.navParams.data.userId+'/'+portfolioId)
    // .set(null);
  
    let watchlistId = watchlists.filter( p => p.data.list === watchlistType )
    console.log(watchlistId[0].key);
 return this.db.list('/watchlists/'+this.navParams.data.userId + '/'+watchlistId[0].key )
 .remove()

      
}


}

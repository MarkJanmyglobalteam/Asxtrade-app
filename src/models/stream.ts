import { ActionSheetController, ModalController, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import * as _ from 'underscore/underscore';
import * as lodash from 'lodash';
import firebase from 'firebase';
import moment from 'moment';

import { StreamModalComponent } from '../components/stream-modal/stream-modal';
import { StocksProvider } from '../providers/stocks/stocks';
import { User } from './user';
import { Stock } from './stock';

export class Stream {

    private db: AngularFireDatabase;
    private actionSheetCtrl: ActionSheetController;
    private modalCtrl: ModalController;
    private alertCtrl: AlertController;
    public param;

    post_id: string;
    userid: string;
    attached_file: string;
    post: string;
    timestamp: number;
    timeago: string;
    user: User;
    StocksProvider: StocksProvider;
    comments: any = [];
    commentsLength: number = 0;
    likes: any = [];
    liked: string;
    shares: any = [];
    stock: Stock;
    sharedPost: Stream;

    private getResharedPost(reshare) {
        let streamTemp = {
            userid: firebase.auth().currentUser.uid,
            post_id: reshare['post_id'],
            stock: this.stock
        }

        this.sharedPost = new Stream(streamTemp, this.StocksProvider, this.db, this.actionSheetCtrl, this.modalCtrl, this.alertCtrl);
    }

    private setValue(stream) {
        this.post_id = stream.post_id;
        this.userid = stream.userid;
        this.attached_file = stream.attached_file;
        this.post = stream.post;
        this.timestamp = stream.timestamp;
        this.timeago = stream.timeago;
        this.stock = stream.stock;
        console.log(this.userid , 'userdata');

        this.StocksProvider.getUserData({ uid: this.userid})
            .then(response => {
                console.log(response , 'userdata');
                this.user = new User(response);
            });

        this.db.list('/comments/' + stream.post_id).valueChanges()
            .subscribe(comments => {
                this.comments = comments;
            });

        this.db.object('/likes/' + stream.post_id).valueChanges()
            .subscribe(likes => {
                this.likes = lodash.values(likes);

                this.liked = _.findKey(likes, { uid: firebase.auth().currentUser.uid });
            });

        this.db.list('/shares/' + stream.post_id).valueChanges()
            .subscribe(shares => {
                this.shares = shares;
            });

        this.db.object('/reshares/' + stream.post_id).valueChanges()
            .subscribe(reshare => {
                if(reshare) {
                    this.getResharedPost(reshare);
                }
            });
    }

    constructor(
    	stream,
        StocksProvider,
        AngularFireDatabase,
        ActionSheetController,
        modalCtrl,
        alertCtrl
	) {
		this.db = AngularFireDatabase;
        this.StocksProvider = StocksProvider;
        this.actionSheetCtrl = ActionSheetController;
        this.modalCtrl = modalCtrl;
        this.alertCtrl = alertCtrl;
        this.param = stream;


        this.db.object('/streams/' + this.param.post_id).valueChanges()
            .subscribe(res => {
                if(res) {
                    res['timeago'] = moment(res['timestamp']).fromNow();
                    this.setValue(lodash.merge(this.param, res));
                }
            });

        const commentsRef = this.db.list('comments', ref => ref.orderByChild('post_id').equalTo(this.param.post_id)).valueChanges();
        commentsRef.subscribe(comments => {
          this.commentsLength = comments.length;
        });
    }

    private likeQuery() {
        this.db.list('/likes/' + this.post_id)
            .push({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                uid: firebase.auth().currentUser.uid
            })
    }

    private unlikeQuery() {
        this.db.list(
            '/likes/' +  this.post_id
        ).remove(this.liked);
    }

    like() {
        if(this.liked) {
            this.unlikeQuery();
        } else {
            this.likeQuery();
        }
    }

    shareToSocial() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Share to Social Media',
            buttons: [
                {
                    text: 'Facebook',
                    icon: 'logo-facebook',
                    handler: () => {
                        console.log('Destructive clicked');
                    }
                },
                {
                    text: 'Twitter',
                    icon: 'logo-twitter',
                    handler: () => {
                        console.log('Archive clicked');
                    }
                },
                {
                    text: 'Google',
                    icon: 'logo-google',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    icon: 'close',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }

    private destroyStream() {
        let confirm = this.alertCtrl.create({
            title: 'Delete Post',
            message: 'This post will be deleted, do you want to continue?',
            buttons: [
                {
                    text: 'No',
                    handler: () => {

                    }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        let tagsPost = this.db.object('/tags/' + this.stock.symbol + '/post').valueChanges()
                            .subscribe(tagsRes => {
                                let key = _.findKey(tagsRes, { post_id: this.post_id });
                                tagsPost.unsubscribe();

                                this.db.list('/tags/' + this.stock.symbol + '/post')
                                    .remove(key)
                                        .then(removeTagsRes => {
                                            this.db.list('/streams')
                                                .remove(this.post_id);

                                            this.db.list('/likes')
                                                .remove(this.post_id);

                                            this.db.list('/comments')
                                                .remove(this.post_id);

                                            this.db.list('/reshares')
                                                .remove(this.post_id);
                                        });
                            });
                    }
                }
              ]
        });
        confirm.present();
    }

    settings() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Settings',
            buttons: [
                {
                    text: 'Repost',
                    icon: 'repeat',
                    handler: () => {
                        let modal = this.modalCtrl.create(StreamModalComponent, { type: 'repost', data: this, stock: this.stock });
                        modal.present();
                    }
                },
                {
                    text: 'Edit',
                    icon: 'create',
                    handler: () => {
                        let modal = this.modalCtrl.create(StreamModalComponent, { type: 'edit', data: this, stock: this.stock });
                        modal.present();
                    }
                },
                {
                    text: 'Delete',
                    icon: 'trash',
                    handler: () => {
                        this.destroyStream();
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    icon: 'close',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }
}

import { Injectable } from "@angular/core";
import { UserCredential } from "@firebase/auth-types";
import { AngularFireDatabase } from "angularfire2/database";
import firebase from 'firebase';
import { Subscription, Observable } from "rxjs";
import { User } from "../../models/user";

@Injectable()
export class UserProvider {

  userSubscription: Subscription;
  followSubscription: Subscription;

  constructor(public db: AngularFireDatabase) {
  }

  saveUserData(userCredential: UserCredential, signInMethod: String): Promise<void> {
    let userId: string = userCredential.user.uid;
    console.log('saving data userid:', userId);
    let firstname: string = 'default';
    let lastname: string = 'default';
    let photoUrl: string = null;

    switch (signInMethod) {
      case 'google':
        firstname = userCredential.additionalUserInfo.profile['given_name'];
        lastname = userCredential.additionalUserInfo.profile['family_name'];
        photoUrl = userCredential.additionalUserInfo.profile['picture'];
        break;
      case 'facebook':
        firstname = userCredential.additionalUserInfo.profile['first_name'];
        lastname = userCredential.additionalUserInfo.profile['last_name'];
        if (!userCredential.additionalUserInfo.profile['picture']['data']['is_silhouette']) {
          photoUrl = userCredential.additionalUserInfo.profile['picture']['data']['url'];
        }
        break;
      case 'twitter':
        firstname = userCredential.additionalUserInfo.profile['name'];
        lastname = ''; // above is already a full name.
        if (!userCredential.additionalUserInfo.profile['default_profile_image']) {
          photoUrl = userCredential.additionalUserInfo.profile['profile_image_url'];
        }
        break;
      default:
        break;
    }

    var userData = {
      uuid: userId,
      firstname: firstname,
      lastname: lastname,
      fullname: `${firstname} ${lastname}`.trim().toLowerCase(),
      email: userCredential.user.email,
      isAdmin: false
    };

    if (photoUrl) {
      userData['photoUrl'] = photoUrl;
    }

    return this.db.object(`/userData/${userId}`).set(userData);
  }

  isCurrentUserFollowing(userId) {
    let currentUserId = firebase.auth().currentUser.uid;
    return this.db
      .object(`userFollowData/${currentUserId}/following/${userId}`)
      .valueChanges().take(1).toPromise();
  }

  followUser(userId: string) {
    let currentUserId = firebase.auth().currentUser.uid;
    return this.db.object(`userFollowData/${currentUserId}/following/${userId}`).set(true)
      .then(result => {
        return this.db.object(`userFollowData/${userId}/followers/${currentUserId}`).set(true);
      });
  }

  unfollowUser(userId: string) {
    let currentUserId = firebase.auth().currentUser.uid;
    return this.db.object(`userFollowData/${currentUserId}/following/${userId}`).remove().then(result => {
      return this.db.object(`userFollowData/${userId}/followers/${currentUserId}`).remove();
    });
  }

  getUsersByName(name: string, limit: number = 50): Promise<User[]> {
    let currentLoggedInUserId = firebase.auth().currentUser.uid;
    return new Promise((resolve, reject) => {
      let userRef = this.db.list('/userData', (ref: firebase.database.Reference) => ref.orderByChild('fullname').startAt(name.toLowerCase()).limitToFirst(limit));
      let userRefSubscription = userRef.valueChanges().subscribe((usersFound: User[]) => {
        console.log('usersFound:', usersFound);
        resolve(usersFound.filter(user => user.uuid != currentLoggedInUserId));
        userRefSubscription.unsubscribe();
      });
    });
  }

  unscribeAll() {
    if (this.userSubscription) this.userSubscription.unsubscribe();
    if (this.followSubscription) this.followSubscription.unsubscribe();
  }

  getById(id: string): Observable<User> {
    return this.db.object('/userData/' + id)
      .valueChanges()
      .map(x => <User>x);
  }
}
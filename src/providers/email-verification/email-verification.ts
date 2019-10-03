import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { env } from '../../app/app.env';

/*
  Generated class for the EmailVerificationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class EmailVerificationProvider {

  constructor(public http: HttpClient,
    public afAuth: AngularFireAuth) {
    console.log('Hello EmailVerificationProvider Provider');
  }

  public sendEmailVerification(): Promise<string> {
    return this.afAuth.auth.currentUser.reload()
      .then(() => {
        if (this.afAuth.auth.currentUser.emailVerified) {
          return 'Your email has already been verified';
        }

        return this.afAuth.auth.currentUser.sendEmailVerification()
          .then(() => {
            return 'Verification email has been sent. Please confirm your email address.';
          }).catch(error => {
            return 'Something went wrong while sending the verification email. Kindly check that you have a valid email.';
          });
      }).catch(() => {
        return 'Oops! Something went wrong.';
      });
  }

  public checkIfUserVerified() {
    return this.afAuth.auth.currentUser.reload()
      .then(() => {
        return this.afAuth.auth.currentUser.emailVerified;
      }).catch(() => {
        return false;
      });
  }
}

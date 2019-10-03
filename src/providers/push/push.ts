import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "angularfire2/database";
import firebase from "firebase";
import { OneSignalEnv } from "../../common/one-signal-env";
import { Http, Headers, ResponseOptions } from "@angular/http";

/*
  Generated class for the PushProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PushProvider {
  constructor(public http: Http, private db: AngularFireDatabase) {
    console.log("Hello PushProvider Provider");
  }

  async saveId(id: string) {
    let existingIds = (await this.getExistingIds()) || [];

    if (!existingIds.find(x => x === id)) {
      existingIds.push(id);
      this.db
        .object(`/userData/${firebase.auth().currentUser.uid}`)
        .update({ oneSignalIds: existingIds });
    }
  }

  private getExistingIds(): Promise<string[]> {
    return this.db
      .object(`/userData/${firebase.auth().currentUser.uid}/oneSignalIds`)
      .valueChanges()
      .first()
      .map(x => <string[]>x)
      .toPromise();
  }

  sendNotification(
    header: string,
    message: string,
    data: any,
    recipients?: string[]
  ) {
    let notifData = {
      app_id: OneSignalEnv.appId,
      include_player_ids: recipients,
      data: data,
      contents: { en: message },
      headings: { en: header }
    };

    if (!recipients) {
      delete notifData.include_player_ids;
      notifData[`included_segments`] = ["All"];
    }

    console.log("PUSH NOTIF", notifData);

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Basic ${OneSignalEnv.apiKey}`);

    const options = new ResponseOptions({ headers: headers });

    return this.http
      .post(
        "https://onesignal.com/api/v1/notifications",
        JSON.stringify(notifData),
        options
      )
      .toPromise();
  }
}

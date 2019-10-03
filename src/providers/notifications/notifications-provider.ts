import { Injectable } from "@angular/core";
import { Subscription } from "rxjs";
import * as firebase from 'firebase/app';

@Injectable()
export class NotificationsProvider {
  notificationSubscription: Subscription;
  userNotifications: any[] = [];
  unreadNotifications = [];

  constructor() {
    console.log('creating');
  }
}

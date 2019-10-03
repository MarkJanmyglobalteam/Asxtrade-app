import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "angularfire2/database";
import firebase from "firebase";
import { User } from "../../models/user";

/*
  Generated class for the ConversationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConversationProvider {
  currentLoggedInUserId = firebase.auth().currentUser.uid;

  constructor(public db: AngularFireDatabase) {
    console.log("Hello ConversationProvider Provider");
  }

  getPreviousIndividualConversation(otherUser: User) {
    let userConversationsRef = firebase
      .database()
      .ref(`userConversations/${this.currentLoggedInUserId}/`);
    return Promise.all([
      userConversationsRef
        .child(`${this.currentLoggedInUserId}_${otherUser.uuid}`)
        .once("value"),
      userConversationsRef
        .child(`${otherUser.uuid}_${this.currentLoggedInUserId}`)
        .once("value")
    ]).then(conversations => {
      let conversationsRetrieved = conversations.map(conversation => {
        if (conversation.exists()) {
          return conversation.key;
        } else {
          return null;
        }
      });
      conversationsRetrieved = conversationsRetrieved.filter(
        conversation => conversation !== null
      );

      let conversationRetrieved = null;
      if (conversationsRetrieved.length === 2) {
        console.warn(
          "Something is wrong here, 2 conversations for same users now exists!"
        );
        conversationRetrieved = conversationsRetrieved[0];
      } else if (conversationsRetrieved.length === 1) {
        conversationRetrieved = conversationsRetrieved[0];
      }
      console.log("conversationId retrieved:", conversationRetrieved);

      return conversationRetrieved;
    });
  }

  getParticipantsData(userIds: string[]) {
    let userDataRef = firebase.database().ref(`userData`);

    let userIdsRef = userIds.map(userId =>
      userDataRef.child(userId).once("value")
    );

    return Promise.all(userIdsRef).then(snaps => {
      return snaps.map(snap => snap.val());
    });
  }

  clearUnreadCountOfCurrentLoggedInUser(conversationId: string) {
    return this.db
      .object(
        `/userConversations/${this.currentLoggedInUserId}/${conversationId}`
      )
      .update({
        unread: false
      });
    // .query.ref.transaction(userConversation => {
    //   console.log('userConversation:', userConversation);
    //   userConversation['unread'] = 0;
    //   return userConversation;
    // });
  }

  updateConversationTimestampOfParticipants(
    participants: User[],
    conversationId: string,
    timestamp: any
  ) {
    participants.forEach(participant => {
      this.db
        .object(`/userConversations/${participant.uuid}/${conversationId}`)
        .update({
          timestamp: timestamp
        });
    });
  }

  setUnreadCountOfParticipants(participants: User[], conversationId: string) {
    participants.forEach(participant => {
      if (participant.uuid == this.currentLoggedInUserId) return;

      this.db
        .object(`/userConversations/${participant.uuid}/${conversationId}`)
        .update({
          unread: true
        });

      // console.log(`querying: /userConversations/${participant.uuid}/${conversationId}`);
      // this.db
      //   .object(`/userConversations/${participant.uuid}/${conversationId}`)
      //   .query.ref.transaction(userConversation => {
      //     console.log('result:', userConversation);

      //     if (userConversation) {
      //       if (!userConversation['unread']) {
      //         userConversation['unread'] = 1;
      //       } else {
      //         userConversation['unread'] = userConversation['unread'] + 1;
      //       }
      //       return userConversation;
      //     } else {
      //       return;
      //     }
      //   }, (error, committed, snapshot) => {
      //     if (error) {
      //         console.log("error in transaction");
      //     } else if (!committed) {
      //         console.log("transaction not committed");
      //     } else {
      //         console.log("Transaction Committed");
      //     }
      // }, true);
    });
  }

  createConversation(participants: User[], conversationName: string = "") {
    let participantIds = {};

    participants.forEach(participant => {
      participantIds[`${participant.uuid}`] = true;
    });

    let conversationData: any = {
      participants: participantIds,
      creator: this.currentLoggedInUserId,
      isGroupChat: false,
      conversationName: conversationName.trim(),
      conversationNameForSearch: conversationName.trim().toLowerCase()
    };
    let conversationId = "";

    if (Object.keys(participantIds).length === 2) {
      conversationId = `${participants[0].uuid}_${participants[1].uuid}`;
      this.db.object(`conversations/${conversationId}`).set(conversationData);
    } else {
      conversationData.isGroupChat = true;
      console.log("conversationDat:", conversationData);
      let newConversation = this.db
        .list("conversations")
        .push(conversationData);
      conversationId = newConversation.key;
      // this.db.object(`conversations/${conversationId}`).set(conversationData);
    }

    conversationData.conversationId = conversationId;

    this.addParticipantsToConversation(participants, conversationId);

    return conversationData;
  }

  addParticipantsToConversation(participants: any[], conversationId: string) {
    console.log("participants:", participants);
    participants.forEach(participant => {
      this.db
        .object(`userConversations/${participant.uuid}/${conversationId}`)
        .set({
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          unread: true
        });

      this.db
        .object(
          `conversations/${conversationId}/participants/${participant.uuid}`
        )
        .set(true);
    });
  }

  removeParticipantFromGroupConversation(
    conversationId: string,
    participantId: string
  ) {
    // Remove conversation ID from user's conversation list
    return this.db
      .object(`userConversations/${participantId}/${conversationId}`)
      .remove()
      .then(() => {
        // Flag participant
        this.db
          .object(
            `conversations/${conversationId}/participants/${participantId}`
          )
          .set(false);

        return true;
      });
  }

  renameGroupConversation(conversationId: string, newConversationName: string) {
    return this.db.object(`conversations/${conversationId}`).update({
      conversationName: newConversationName.trim(),
      conversationNameForSearch: newConversationName.trim().toLowerCase()
    });
  }
}

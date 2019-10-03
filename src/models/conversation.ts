import * as firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';

export class Conversation {

    constructor() {}

    public static create(_db, data): object {
        let conversation$ = _db.list('conversations/messages').push(true);
        let members = [ data.sender, data.recipient ];

        data['key'] = conversation$.key;
        data['sender_convo'] = _db.list('conversations/members/' + members[0]).push({ conversation_id: conversation$.key, uuid: members[1] });
        data['recipient_convo'] = _db.list('conversations/members/' + members[1]).push({ conversation_id: conversation$.key, uuid: members[0] });

        return data;
    }

    public static getConvo(_db: AngularFireDatabase, data): object {
        let members = [ data.sender, data.recipient ];
        let senderRef = _db.list('conversations/members/' + members[0]);
        let recipientRef = _db.list('conversations/members/' + members[1]);

        senderRef.snapshotChanges().subscribe(res => {
            let item$ = res.find((data, index, object) => {
                return data.payload.key == data['key'];
            });

            data['sender_convo'] = item$.payload.key;
        });

        recipientRef.snapshotChanges().subscribe(res => {
            let item$ = res.find((data, index, object) => {
                return data.payload.key == data['key'];
            });

            data['recipient_convo'] = item$.payload.key;
        });

        return data;
    }

    public static clearUnread(_db: AngularFireDatabase, data): void {
        let members = [ data.sender, data.recipient ];
        _db.object('conversations/members/' + members[0] + '/' + data.sender_convo).query.ref.transaction(convo => {            
            convo['unread'] = 0;
            return convo;
        });
    }

    public static sendMessage(_db: AngularFireDatabase, data, message_data): void {
        let members = [ data.sender, data.recipient ];

        // insert message
        let messages$ = _db.list('conversations/messages/' + data.key);
        messages$.push(message_data);

        // set unread
        _db.object('conversations/members/' + members[1] + '/' + data.recipient_convo).query.ref.transaction(convo => {
            if(! convo['unread']) {
                convo['unread'] = 1;
            } else {
                convo['unread'] = convo['unread'] + 1;
            }
            
            return convo;
        });
    }
}
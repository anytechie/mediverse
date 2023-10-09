import {Telegraf} from 'telegraf';
import express from 'express';
import admin from 'firebase-admin';

import serviceAccount from './firebase-key.json';
import { BOT_TOKEN } from './config';

admin.initializeApp({
  credential: admin.credential.cert((serviceAccount as admin.ServiceAccount))
});

const db = admin.firestore();

const app = express();
const PORT = 3001;
const bot = new Telegraf(BOT_TOKEN);


// Subscribe to new messages in Firestore
const messagesRef = db.collection('messages');
// eslint-disable-next-line no-unused-vars
const unsubscribe = messagesRef.onSnapshot(snapshot => {
  snapshot.docChanges().forEach(async change => {
    if (change.type === 'added') {
      const { userId, content } = change.doc.data();

      try {
        await bot.telegram.sendMessage(userId, content, { parse_mode: 'Markdown' });
        await change.doc.ref.delete(); // Delete the message from Firestore after sending
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import { Markup, Telegraf } from "telegraf";
import express from "express";
import admin from "firebase-admin";
import process from "process";
import serviceAccount from "./firebase-key.json";
import { BOT_TOKEN, PAYMENT_TOKEN } from "./config";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

const app = express();
const PORT = 3001;
const bot = new Telegraf(BOT_TOKEN);

// Subscribe to new messages in Firestore
const messagesRef = db.collection("messages");
const unsubscribe = messagesRef.onSnapshot((snapshot) => {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === "added") {
      const data = change.doc.data();
      const { userId, content, amount } = data;

      try {
        await bot.telegram.sendMessage(userId, content, {
          parse_mode: "Markdown",
        });
        if (amount) {
          await bot.telegram.sendInvoice(userId, {
            provider_token: PAYMENT_TOKEN,
            start_parameter: "payment",
            title: "Appointment Fee",
            description: "Please pay the below amount for your appointment",
            currency: "USD",
            is_flexible: false,
            need_shipping_address: false,
            prices: [{ label: "Payment", amount: Number(amount) * 100 }],
            payload: "Appointment Fee",
          });
        }
        await change.doc.ref.delete(); // Delete the message from Firestore after sending
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  });
});

bot.command('start', async (ctx) => {
  const caption = `*Welcome to Mediverse 🧑‍⚕️! *\n\nTap the button below to open the app and explore the features of Mediverse!`;

  const keyboard = Markup.inlineKeyboard([
      Markup.button.webApp('Open Mediverse', "https://mediverse.web.app/"),
  ]).reply_markup;

  await ctx.replyWithVideo("https://firebasestorage.googleapis.com/v0/b/mediverse-c3d3c.appspot.com/o/output.mp4?alt=media", {
      caption: caption,
      parse_mode: 'Markdown',
      reply_markup: keyboard,
  });
});

bot.on("pre_checkout_query", async (ctx) => {
  // confirm payment
  await ctx.answerPreCheckoutQuery(true);
});


bot.on("successful_payment", async (ctx) => {
  // send a message to the user saying that payment was received
  await ctx.reply(
    `Thank you, your payment of ${
      ctx.message.successful_payment.total_amount / 100
    } ${ctx.message.successful_payment.currency} was received and will be sent to the doctor.`
  );
});

process.on("SIGINT", () => {
  unsubscribe();
  process.exit();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

bot.launch();
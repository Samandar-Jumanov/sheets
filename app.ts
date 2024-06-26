import express, { Express, Request, Response } from "express";
import { compareAndUpdateSheet } from   "./utils/spreedsheet"
import Logger from "./lib/winston";
import bot from "./lib/bot";
import TelegramBot from "node-telegram-bot-api";
import { deleteMessages, readMessages } from "./utils/file";
import { IBotMessageInfo } from "./types";


const app: Express = express();


// Health checker
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Success" });
});

bot.onText(/\/start/, async (msg : TelegramBot.Message) => {
  const chatId = msg.chat.id.toString();
  const messages : IBotMessageInfo[] | null  = readMessages();
  await  bot.sendMessage(chatId, "Bot has started. You will receive notifications.");
  deleteMessages()
  
});


compareAndUpdateSheet().then()
.catch(err => Logger.error(err))

app.listen(3000,  () => {
  Logger.info("Server started on port 3000");
});

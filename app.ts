import express, { Express, Request, Response } from "express";
import cron from "node-cron";
import { compareAndUpdateSheet } from "./utils/spreedsheet";
import Logger from "./lib/winston";
import bot from "./lib/bot";
import TelegramBot from "node-telegram-bot-api";
import { deleteMessages, readMessages } from "./utils/file";
import { IBotMessageInfo } from "./types";




// google json example can be taken from google sheets 
const app: Express = express();

// Health checker
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Success" });
});

bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id.toString();
  const messages: IBotMessageInfo[] | null = readMessages();
  await bot.sendMessage(chatId, JSON.stringify(messages));
  deleteMessages();
});

compareAndUpdateSheet().then().catch(( error : any ) => Logger.error(error));

cron.schedule("*/15 * * * *", () => {
  compareAndUpdateSheet()
    .then()
    .catch(( error : any ) => Logger.error(error));
});

// Start the Express server
app.listen(3000, () => {
  Logger.info("Server started on port 3000");
});

import express, { Express, Request, Response } from "express";
import { compareAndUpdateSheet } from   "./utils/spreedsheet"
import cron from "node-cron";
import Logger from "./lib/winston";
import bot from "./lib/bot";
import fs from "fs";
import path from "path";
import TelegramBot from "node-telegram-bot-api";

const app: Express = express();

const chatIdFilePath = path.join(__dirname, "./chatId.json");

// Health checker
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Success" });
});

bot.onText(/\/start/, async (msg : TelegramBot.Message) => {
  const chatId = msg.chat.id.toString();
  fs.writeFileSync(chatIdFilePath, JSON.stringify({ chatId }));
  bot.sendMessage(chatId, "Bot has started. You will receive notifications.");
  Logger.info(`Chat ID ${chatId} stored for notifications`);
  await compareAndUpdateSheet();
});

app.listen(3000, async () => {
  Logger.info("Server started on port 3000");
  if (fs.existsSync(chatIdFilePath)) {
    const fileContent = fs.readFileSync(chatIdFilePath, "utf8");
    const storedData = JSON.parse(fileContent);
    const chatId = storedData.chatId;
    Logger.info(`Loaded chat ID ${chatId} from file`);
  }
});

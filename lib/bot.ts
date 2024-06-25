import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";

config();

const token = process.env.BOT_TOKEN!; 
const bot = new TelegramBot(token, { polling: true });

export default  bot;



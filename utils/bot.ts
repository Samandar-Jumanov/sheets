import bot from "../lib/bot";
import Logger from "../lib/winston";
import fs from "fs";
import path from "path";
import { IBotMessageInfo } from "../types";

const chatIdFilePath = path.join(__dirname, "../chatId.json");

let chatId: string | null = null;

// Load chat ID from file if it exists
if (fs.existsSync(chatIdFilePath)) {
  const fileContent = fs.readFileSync(chatIdFilePath, "utf8");
  const storedData = JSON.parse(fileContent);
  chatId = storedData.chatId;
}


export const sendNotification = async (message: string, data: IBotMessageInfo[]) => {
  if (!chatId) {
    Logger.error("Chat ID not set. Cannot send notification.");
    return;
  }

  const formattedData = data.map(info => `
    Updated User Count: ${info.updated_user_count}
    Updated Rating: ${info.updated_rating}
    Average Rating: ${info.avg_rating}
    Last Comment: ${info.last_comment}
    Updated Date: ${info.updated_date}
  `).join('\n\n');
  
  try {
    await bot.sendMessage(chatId, `${message}\n\n${formattedData}`);
    Logger.info("Notification sent successfully");
  } catch (error) {
    Logger.error("Failed to send notification:", error);
  }
};

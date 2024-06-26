import fs from 'fs';
import path from 'path';
import Logger from '../lib/winston';
import { IBotMessageInfo } from '../types';

const messagesFilePath = path.join(__dirname, '../messages.json');

export const writeToMessage = (message: IBotMessageInfo [] ) => {
  try {
    fs.writeFileSync(messagesFilePath, JSON.stringify(message, null, 2));
  } catch (error: any) {
    Logger.error(`Failed to write message: ${error.message}`);
  }
};

export const readMessages = (): any[] | null  => {
  try {
    if (fs.existsSync(messagesFilePath)) {
      const data = fs.readFileSync(messagesFilePath, 'utf8');
      console.log(JSON.parse(data))
      return JSON.parse(data) as IBotMessageInfo[];
    }
    return null 
  } catch (error: any) {
    Logger.error(`Failed to read messages: ${error.message}`);
    return  null 
  }
};


// Delete the messages.json file
export const deleteMessages = () => {
  try {
    if (fs.existsSync(messagesFilePath)) {
      fs.unlinkSync(messagesFilePath);
    }
  } catch (error: any) {
    Logger.error(`Failed to delete messages file: ${error.message}`);
  }
};

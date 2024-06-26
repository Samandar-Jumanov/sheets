import formattedDate from '../lib/date';
import { sheets, sheetId } from '../lib/google-spreedsheet';
import Logger from '../lib/winston';
import { sendNotification } from './bot';
import { runPuppeteer } from './puppeteer';
import { IBotMessageInfo } from '../types';
import { writeToMessage } from './file';

export async function updateFile(values: string[][], startRow: number) {
  try {
    const range = `Sheet1!C${startRow}`;
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values,
      },
    });
    return res.data;
  } catch (error: any) {
    Logger.error(error.message);
  }
}

export async function readSheet() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1:F', // Extend the range to include all rows and columns
    });

    const rows = response.data.values || [];
    return rows;
  } catch (error: any) {
    Logger.error(error.message);
  }
}

export const compareAndUpdateSheet = async () => {
  try {
    Logger.info("Started to compare and update sheet")
    const sheetData = await readSheet();

    if (!sheetData || sheetData.length <= 1) {
      Logger.error("No sheet data found or only header row present");
      return;
    }

    const botMessages: IBotMessageInfo[] = [];

    for (let i = 1; i < sheetData.length; i++) {
      const currentRow = sheetData[i];
      const url = currentRow[1];

      if (!url) {
        Logger.error(`URL not found in the sheet at row ${i + 1}`);
        continue;
      }

      const newData = await runPuppeteer(url);

      if (!newData) {
        Logger.error("No data fetched from Puppeteer");
        continue;
      }

      const hasChanged =
        currentRow[2] !== newData.user_count ||
        currentRow[3] !== newData.rating ||
        currentRow[4] !== newData.average_rating ||
        currentRow[5] !== newData.last_comment;

      if (hasChanged) {
        const newRow : any  = [
          newData.user_count,
          newData.rating,
          newData.average_rating,
          newData.last_comment,
          formattedDate,
        ];

        const data: IBotMessageInfo = {
          updated_user_count: newData.user_count as string,
          updated_rating: newData.rating as any ,
          avg_rating: newData.average_rating as string | number,
          last_comment: newData.last_comment as string,
          updated_date: formattedDate,
        };

        botMessages.push(data);

        await updateFile([newRow], i + 1);
      }
    }
        writeToMessage(botMessages)
        return 
  } catch (error) {
    Logger.error("Error in compareAndUpdateSheet:", error);
  }
};

import formattedDate from '../lib/date';
import { sheets, sheetId } from '../lib/google-spreedsheet';
import Logger from '../lib/winston';
import { sendNotification } from './bot';
import { runPuppeteer } from './puppeteer';

export async function updateFile(values: string[][]) {
  try {
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Sheet1!C2',
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
      range: 'Sheet1!A1:F10', 
    });

    const rows = response.data;
    return rows;
  } catch (error: any) {
    Logger.error(error.message);
  }
}

export const compareAndUpdateSheet = async () => {
  try {
    const sheetData = await readSheet();
    if (!sheetData || !sheetData.values) {
      Logger.error("No sheet data found or empty rows");
      return;
    }

    const rows = sheetData.values;
    const lastRow = rows[rows.length - 1];

    const url = lastRow[1]; 

    if (!url) {
      Logger.error("URL not found in the sheet");
      return;
    }

    const newData = await runPuppeteer(url);

    if (!newData) {
      Logger.error("No data fetched from Puppeteer");
      return;
    }

    const hasChanged =
      lastRow[2] !== newData.user_count ||
      lastRow[3] !== newData.rating ||
      lastRow[4] !== newData.average_rating ||
      lastRow[5] !== newData.last_comment;

    if (hasChanged) {
      const newRow  :any = [newData.user_count, newData.rating, newData.average_rating, newData.last_comment, formattedDate];
      await updateFile([newRow]);

      sendNotification('Data has changed', newRow);
    }
  } catch (error) {
    Logger.error("Error in compareAndUpdateSheet:", error);
  }
};

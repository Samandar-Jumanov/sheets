import puppeteer, { Browser } from 'puppeteer';
import { sheets, sheetId } from '../lib/google-spreedsheet';
import Logger from '../lib/winston';
import { sendNotification } from './bot';

export const runPuppeteer = async (url: string) => {
  const browser: Browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.waitForSelector('.F9iKBc');

  const userCount: string | null = await page.evaluate(() => {
    const element = document.querySelector('.F9iKBc');
    const match = element ? element.textContent?.match(/(\d[\d,]*)\s*users/) : null;
    return match ? match[1].replace(/,/g, '') : null;
  });

  const rating: string | null = await page.evaluate(() => {
    const element = document.querySelector('.awpk2');
    return element ? element.textContent : null;
  });

  const avgRating: string | null = await page.evaluate(() => {
    const element = document.querySelector('.Vq0ZA');
    return element ? element.textContent : null;
  });

  const lastComment: string | null = await page.evaluate(() => {
    const element = document.querySelector('.fzDEpf');
    return element ? element.textContent : null;
  });

  await browser.close();

  return {
    user_count: userCount,
    rating: rating,
    average_rating: avgRating,
    last_comment: lastComment,
  };
};

export async function updateFile(values: string[][]) {
  try {
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1',
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
      range: 'Sheet1!A1:F10', // Extend the range to include the URL column
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

    // Extract URL from the second column (B)
    const url = lastRow[1]; // Assuming URL is in the second column (B)

    if (!url) {
      Logger.error("URL not found in the sheet");
      return;
    }

    // Fetch data using Puppeteer
    const newData = await runPuppeteer(url);

    if (!newData) {
      Logger.error("No data fetched from Puppeteer");
      return;
    }

    // Compare fetched data with existing data
    const hasChanged =
      lastRow[2] !== newData.user_count ||
      lastRow[3] !== newData.rating ||
      lastRow[4] !== newData.average_rating ||
      lastRow[5] !== newData.last_comment;

    if (hasChanged) {
      const currentTime = new Date().toISOString();
      const newRow = [currentTime, url, newData.user_count, newData.rating, newData.average_rating, newData.last_comment];

      // Update the sheet with the new data
      await updateFile([newRow]);

      // Send notification about the data change
      sendNotification('Data has changed', newRow);
    }
  } catch (error) {
    Logger.error("Error in compareAndUpdateSheet:", error);
  }
};

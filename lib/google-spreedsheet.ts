// google sheets config 

import { google } from 'googleapis';
import { config } from 'dotenv';


config();


const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  keyFile: './google.json',
});

export const sheets = google.sheets({ version: 'v4', auth })
export const sheetId  = process.env.SPREED_SHEET_ID

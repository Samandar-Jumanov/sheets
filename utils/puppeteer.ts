import puppeteer, { Browser } from "puppeteer";


export const runPuppeteer = async ( url : string ) => {
  const browser: Browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for the main selector
  await page.waitForSelector('.F9iKBc');

  // Extract the number of users
  const userCount: string | null = await page.evaluate(() => {
    const element = document.querySelector('.F9iKBc');
    const match = element ? element.textContent?.match(/(\d[\d,]*)\s*users/) : null;
    return match ? match[1].replace(/,/g, '') : null;
  });

  // Wait for and extract the rating
  const rating: string | null = await page.evaluate(() => {
    const element = document.querySelector('.awpk2');
    return element ? element.textContent : null;
  });

  // Wait for and extract the average rating
  const avgRating: string | null = await page.evaluate(() => {
    const element = document.querySelector('.Vq0ZA');
    return element ? element.textContent : null;
  });

  // Wait for and extract the last comment
  const lastComment: string | null = await page.evaluate(() => {
    const element = document.querySelector('.fzDEpf');
    return element ? element.textContent : null;
  });

  // Log the extracted data
  const dataToWrite = {
    user_count: userCount,
    rating: rating,
    average_rating: avgRating,
    last_comment: lastComment,
  };

  console.log(dataToWrite);

  await browser.close();
};


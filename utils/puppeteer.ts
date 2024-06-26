import puppeteer, { Browser } from "puppeteer";


export const runPuppeteer = async (url: string) => {
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.waitForSelector('.F9iKBc');

  const userCount: string | null = await page.evaluate(() => {
    const element = document.querySelector('.F9iKBc');
    const match = element ? element.textContent?.match(/(\d[\d,]*)\s*users/) : null;
    return match ? match[1].replace(/,/g, '') : null;
  });

  const rating  = await page.evaluate(() => {
    const element = document.querySelector('.awpk2');
    const text : any  = element ? element.textContent : null;
     return text ? parseFloat(text.match(/\d+(\.\d+)?/)[0]) : null;
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

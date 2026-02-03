import { chromium } from "playwright";

type VideoItem = {
  title: string;
  url: string;
  views: number;
};

type BasicInfo = {
  channelName: string;
  subscribers: number;
  totalVideos: number;
};

type Category = {
  basic_info: BasicInfo;
  video: VideoItem;
  shorts: VideoItem;
  podcast: VideoItem;
};

const main = async () => {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();
  await page.goto("https://www.youtube.com/@100xEngineers");

  await page.waitForSelector("#page-header");
  const channelName = await page
    .locator("yt-dynamic-text-view-model")
    .textContent();
  console.log(channelName);

  const subscribers = await page
    .locator("yt-content-metadata-view-model > :nth-child(2) :nth-child(0)")
    .textContent();
  console.log(subscribers);
  browser.close();
};

main();

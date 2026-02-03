import { chromium } from "playwright";

////////////------Types

type VideoItem = {
  title: string;
  url: string;
  views: number;
};

type BasicInfo = {
  channelName: string | null;
  subscribers: number;
  totalVideos: number;
};

type Category = "basic_info" | "video" | "shorts" | "podcast";

///////////////---- Utility Functions

function convertToNumber(subs: string): number {
  let value = subs.toUpperCase().replace(/,/g, "").split(" ")[0];
  if (value.endsWith("K")) return parseFloat(value) * 1000;
  if (value.endsWith("M")) return parseFloat(value) * 1_000_000;
  if (value.endsWith("B")) return parseFloat(value) * 1_000_000_000;
  return parseFloat(value);
}

/////////----Extract Functions----Overload Signature

function extract(
  channelName: string,
  category: "basic_info",
): Promise<VideoItem>;
function extract(channelName: string, category: "video"): Promise<VideoItem>;
function extract(channelName: string, category: "shorts"): Promise<VideoItem>;
function extract(channelName: string, category: "podcast"): Promise<VideoItem>;

////---- Implementation Signature

async function extract(channel: string, category: Category): Promise<any> {
  const browser = await chromium.launch({
    headless: false,
  });
  const page = await browser.newPage();
  if (category === "basic_info") {
    await page.goto(channel);
    await page.waitForSelector("#page-header");
    const channelName: string | null = await page
      .locator("yt-dynamic-text-view-model")
      .textContent();

    const header = await page
      .locator('yt-content-metadata-view-model [role="text"]')
      .allTextContents();
    const subscribers: number = convertToNumber(header[1]);
    const totalVideos: number = convertToNumber(header[2]);

    const channelInfo: BasicInfo = {
      channelName,
      subscribers,
      totalVideos,
    };
    await browser.close();
    return channelInfo;
  }
}

const main = async () => {
  await extract("https://www.youtube.com/@IBMTechnology", "basic_info").then(
    (data) => {
      console.log(data);
    },
  );
};

main();

import { chromium } from "playwright";

////////////------Types

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
): Promise<BasicInfo>;
function extract(channelName: string, category: "video"): Promise<VideoItem>;
function extract(channelName: string, category: "shorts"): Promise<VideoItem>;
function extract(channelName: string, category: "podcast"): Promise<VideoItem>;

////---- Implementation Signature

async function extract(channel: string, category: Category): Promise<any> {
  const browser = await chromium.launch({
    headless: false,
  });
  const page = await browser.newPage();

  /////////---Basic-Info---
  if (category === "basic_info") {
    await page.goto(channel);
    await page.waitForSelector("#page-header");
    const channelName: string =
      (await page.locator("yt-dynamic-text-view-model").textContent()) ||
      "Channel Name not Found!";

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

  ///////----Video----///////
  if (category === "video") {
    await page.goto(channel);
    await page.waitForSelector("#above-the-fold");
    const title: string =
      (await page.locator("#above-the-fold > #title").textContent())?.trim() ||
      "Title not found!";
    const url: string = channel;
    const views: number = convertToNumber(
      (await page.locator("#owner-sub-count").textContent()) ||
        "Views not found",
    );
    const video: VideoItem = {
      title,
      url,
      views,
    };
    await browser.close();
    return video;
  }

  ///////----Shorts----///////
  if (category === "shorts") {
    await page.goto(channel);
    await page.waitForSelector("video");
    await page.locator("yt-shorts-video-title-view-model").click();

    const title: string =
      (
        await page
          .locator("ytd-video-description-header-renderer #title")
          .textContent()
      )?.trim() || "Title not found";

    const url: string = channel;
    const views: number = convertToNumber(
      (await page
        .locator(
          "ytd-video-description-header-renderer view-count-factoid-renderer",
        )
        .textContent()) || "Views not found",
    );
    const shorts: VideoItem = {
      title,
      url,
      views,
    };
    await browser.close();
    return shorts;
  }

  ///////----Podcast----///////
  if (category === "podcast") {
    await page.goto(channel);
    await page.waitForSelector("#above-the-fold");
    const title: string =
      (await page.locator("#above-the-fold > #title").textContent())?.trim() ||
      "Title not found!";
    const url: string = channel;
    const views: number = convertToNumber(
      (await page.locator("#owner-sub-count").textContent()) ||
        "Views not found",
    );
    const podcast: VideoItem = {
      title,
      url,
      views,
    };
    await browser.close();
    return podcast;
  }
}

const main = async () => {
  await extract(
    "https://www.youtube.com/watch?v=eZ1NizUx9U4&list=PLOspHqNVtKADcG4vf83D97cKUrs5WdXXR&index=1",
    "podcast",
  ).then((data) => {
    console.log(data);
  });
};

// main();

///////////----------------------Generator Function----------//////////////////////////////////////////////////

async function* genFunc(channelURL: string, category: Category) {
  ///////----Video----///////---------------------> Abhi incomplete hai
  const browser = await chromium.launch({
    headless: false,
  });
  const page = await browser.newPage();
  if (category === "video") {
    await page.goto(`${channelURL}/videos`);
    await page.waitForSelector("#page-header");
    let videoNumber = 0;
    while (true) {
      videoNumber++;
      const title: string =
        (await page
          .locator("ytd-rich-grid-media a[id='video-title-link']")
          .nth(videoNumber)
          .textContent()) || "Video Title not Found!";
      const url: string = channelURL;
      const views: number = convertToNumber(
        (await page.locator("#owner-sub-count").textContent()) ||
          "Views not found",
      );
      const video: VideoItem = {
        title,
        url,
        views,
      };
      console.log(videoNumber);
      yield video;
    }
    await browser.close();
  }
}

(async function () {
  const data = genFunc("https://www.youtube.com/@CodeWithHarry", "video");

  let i = 0;
  while (i < 5) {
    console.log((await data.next()).value);
    i++;
  }
})();

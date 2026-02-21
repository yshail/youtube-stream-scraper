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

export type Category = "basic_info" | "video" | "shorts" | "podcast";

///////////////---- Utility Functions

function convertToNumber(subs: string): number {
  let value = subs.toUpperCase().replace(/,/g, "").split(" ")[0];
  if (value.endsWith("K")) return parseFloat(value) * 1000;
  if (value.endsWith("M")) return parseFloat(value) * 1_000_000;
  if (value.endsWith("B")) return parseFloat(value) * 1_000_000_000;
  return parseFloat(value);
}

/////////----Extract Functions----Overload Signature

export function extract(
  channelName: string,
  category: "basic_info",
): AsyncGenerator<BasicInfo>;
export function extract(
  channelName: string,
  category: "video",
): AsyncGenerator<VideoItem>;
export function extract(
  channelName: string,
  category: "shorts",
): AsyncGenerator<VideoItem>;
export function extract(
  channelName: string,
  category: "podcast",
): AsyncGenerator<VideoItem>;

///////////----------------------Generator Function----------Implementation----------------------------------//////////////////////////////////

export async function* extract(
  channelURL: string,
  category: Category,
): AsyncGenerator<VideoItem | BasicInfo> {
  const browser = await chromium.launch({
    headless: true,
  });
  const page = await browser.newPage();

  /////////---Basic-Info---
  if (category === "basic_info") {
    await page.goto(channelURL);
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
    yield channelInfo;
    await browser.close();
    return;
  }

  ///////----Video----///////---------------------

  if (category === "video") {
    await page.goto(`${channelURL}/videos`);
    await page.waitForSelector("#page-header");
    let videoNumber = 0;
    try {
      while (true) {
        videoNumber++;
        if (videoNumber > 15) {
          await page.evaluate(() => {
            window.scrollBy(0, 7 * window.innerHeight);
          });
          //   await page.waitForTimeout(300);
        }
        const videoItem = page
          .locator("ytd-rich-item-renderer")
          .nth(videoNumber);
        const itemExists = await videoItem
          .waitFor({ state: "attached", timeout: 4000 })
          .then(() => true)
          .catch(() => false);

        if (!itemExists) {
          console.log("No new video entry found after 4s. Ending video fetch.");
          break;
        }

        const title: string =
          (await videoItem.locator("h3").textContent()) ||
          "Video Title not Found!";
        let tempURL =
          (await videoItem.locator("h3").locator("a").getAttribute("href")) ||
          "URL not Found!";
        let url = `https://www.youtube.com${tempURL}`;
        let viewer: string =
          (await videoItem.locator("ytd-video-meta-block").textContent()) ||
          "URL not Found!";
        const views: number = convertToNumber(viewer.trim().split(/\s+/)[2]);
        const video: VideoItem = {
          title,
          url,
          views,
        };
        console.log(videoNumber);
        yield video;
      }
    } finally {
      await browser.close();
    }
  }

  ///////----Shorts----///////---------------------
  if (category === "shorts") {
    await page.goto(`${channelURL}/shorts`);
    await page.waitForSelector("#page-header");
    const shorts = page.locator("ytm-shorts-lockup-view-model");
    try {
      let i = 0;
      while (true) {
        i++;
        await page.evaluate(() => {
          window.scrollBy(0, 8 * window.innerHeight);
        });
        //   await page.waitForTimeout(300);

        const currentShort = shorts.nth(i);
        const shortExists = await currentShort
          .waitFor({ state: "attached", timeout: 4000 })
          .then(() => true)
          .catch(() => false);

        if (!shortExists) {
          console.log(
            "No new shorts entry found after 4s. Ending shorts fetch.",
          );
          break;
        }

        const details = await currentShort.evaluate((el: any) => ({
          title: el.data?.overlayMetadata?.primaryText?.content,
          views: el.data?.overlayMetadata?.secondaryText?.content,
          url: el.data?.onTap?.innertubeCommand?.commandMetadata
            ?.webCommandMetadata?.url,
        }));
        const title: string = details.title;
        const views: number = convertToNumber(details.views);
        const url: string = "https://www.youtube.com" + details.url;
        const video: VideoItem = {
          title,
          url,
          views,
        };
        console.log(i);
        yield video;
      }
    } finally {
      await browser.close();
    }
  }

  ///////----Podcast----///////---------------------
  if (category === "podcast") {
    await page.goto(`${channelURL}/podcasts`);
    await page.waitForSelector("#page-header");
    const podcast = page.locator("yt-lockup-metadata-view-model");
    try {
      let i = 0;
      while (true) {
        i++;
        await page.evaluate(() => {
          window.scrollBy(0, 5 * window.innerHeight);
        });
        //   await page.waitForTimeout(300);

        const currentPodcast = podcast.nth(i);
        const podcastExists = await currentPodcast
          .waitFor({ state: "attached", timeout: 4000 })
          .then(() => true)
          .catch(() => false);

        if (!podcastExists) {
          console.log(
            "No new podcast entry found after 4s. Ending podcast fetch.",
          );
          break;
        }

        const details = await currentPodcast.evaluate((el: any) => ({
          title: el.innerText.split("\n")[0],
        }));
        let url =
          (await currentPodcast.locator("a").first().getAttribute("href")) ??
          "";
        url = `https://www.youtube.com${url}`;
        const title: string = details.title;
        const views: number = 0;
        const video: VideoItem = {
          title,
          url,
          views,
        };
        console.log(i);
        yield video;
      }
    } finally {
      await browser.close();
    }
  }
}

// Test code replaced for module export

////////////---------------------Old--------Code
//////////////////////
//////////////////////
////////////////////
///////////////////
///////////////////////
///////////////////////

////---- Implementation Signature

// async function extract(channel: string, category: Category) {
//   const browser = await chromium.launch({
//     headless: false,
//   });
//   const page = await browser.newPage();

//   /////////---Basic-Info---
//   if (category === "basic_info") {
//     await page.goto(channel);
//     await page.waitForSelector("#page-header");
//     const channelName: string =
//       (await page.locator("yt-dynamic-text-view-model").textContent()) ||
//       "Channel Name not Found!";

//     const header = await page
//       .locator('yt-content-metadata-view-model [role="text"]')
//       .allTextContents();
//     const subscribers: number = convertToNumber(header[1]);
//     const totalVideos: number = convertToNumber(header[2]);

//     const channelInfo: BasicInfo = {
//       channelName,
//       subscribers,
//       totalVideos,
//     };
//     await browser.close();
//     return channelInfo;
//   }

//   ///////----Video----///////
//   if (category === "video") {
//     await page.goto(channel);
//     await page.waitForSelector("#above-the-fold");
//     const title: string =
//       (await page.locator("#above-the-fold > #title").textContent())?.trim() ||
//       "Title not found!";
//     const url: string = channel;
//     const views: number = convertToNumber(
//       (await page.locator("#owner-sub-count").textContent()) ||
//         "Views not found",
//     );
//     const video: VideoItem = {
//       title,
//       url,
//       views,
//     };
//     await browser.close();
//     return video;
//   }

//   ///////----Shorts----///////
//   if (category === "shorts") {
//     await page.goto(channel);
//     await page.waitForSelector("video");
//     await page.locator("yt-shorts-video-title-view-model").click();

//     const title: string =
//       (
//         await page
//           .locator("ytd-video-description-header-renderer #title")
//           .textContent()
//       )?.trim() || "Title not found";

//     const url: string = channel;
//     const views: number = convertToNumber(
//       (await page
//         .locator(
//           "ytd-video-description-header-renderer view-count-factoid-renderer",
//         )
//         .textContent()) || "Views not found",
//     );
//     const shorts: VideoItem = {
//       title,
//       url,
//       views,
//     };
//     await browser.close();
//     return shorts;
//   }

//   ///////----Podcast----///////
//   if (category === "podcast") {
//     await page.goto(channel);
//     await page.waitForSelector("#above-the-fold");
//     const title: string =
//       (await page.locator("#above-the-fold > #title").textContent())?.trim() ||
//       "Title not found!";
//     const url: string = channel;
//     const views: number = convertToNumber(
//       (await page.locator("#owner-sub-count").textContent()) ||
//         "Views not found",
//     );
//     const podcast: VideoItem = {
//       title,
//       url,
//       views,
//     };
//     await browser.close();
//     return podcast;
//   }
// }

// const main = async () => {
//   await extract(
//     "https://www.youtube.com/watch?v=eZ1NizUx9U4&list=PLOspHqNVtKADcG4vf83D97cKUrs5WdXXR&index=1",
//     "podcast",
//   ).then((data) => {
//     console.log(data);
//   });
// };

// // main();

import express from "express";
import { extract, Category } from "./yt-yield";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/scrape", async (req, res) => {
  const channelUrl = req.query.channelUrl as string;
  const category = req.query.category as Category;

  if (!channelUrl || !category) {
    return res
      .status(400)
      .json({ error: "channelUrl and category are required" });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    // 'Access-Control-Allow-Origin': '*' // If needed
  });

  let isClientConnected = true;

  req.on("close", () => {
    isClientConnected = false;
    console.log("Client disconnected from SSE");
  });

  try {
    const dataGen = extract(channelUrl, category as any);
    let entryCount = 0;

    for await (const item of dataGen) {
      if (!isClientConnected) {
        // Break to ensure finally block in generator runs, closing browser
        break;
      }
      res.write(`data: ${JSON.stringify(item)}\n\n`);

      entryCount++;
      if (entryCount >= 500) {
        console.log("Reached limit of 500 entries. Stopping stream.");
        break;
      }
    }

    if (isClientConnected) {
      res.write(`data: ${JSON.stringify({ message: "Data scrapped" })}\n\n`);
    }
  } catch (error: any) {
    console.error("Error during scraping:", error);
    if (isClientConnected) {
      res.write(
        `data: ${JSON.stringify({ error: error.message || "Scraping failed" })}\n\n`,
      );
    }
  } finally {
    if (isClientConnected) {
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

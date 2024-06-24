import { promises as fs } from "fs";
// import rssParser from "rss-parser";

const DEFAULT_N = 5;

type Entry = {
  title?: string;
  canonical_url?: string;
  published_at?: string;
};

const fetchFeed = async (url: string): Promise<any> => {
  try {
    fetch(url)
  .then(res => res.json())
      .then(data => {
        let feeds = [];

    for (const item of data as any) {
      if (item.title && item["canonical_url"]) feeds.push(formatFeedEntry(item));
      if (feeds.length === DEFAULT_N) break;
    }
      return feeds;
      })

    // const parser = new rssParser();
    // const response = await parser.parseURL(url);

  } catch (error) {
    console.error("Error fetching or parsing the feed:", error);
    return [];
  }
};

const formatFeedEntry = (item: Entry | string): string => {
  if (typeof item === "string") {
    return item;
  }

  const { title, canonical_url, published_at } = item;
  const date = published_at ? new Date(published_at).toISOString().slice(0, 10) : "";
  return date ? `[${title}](${canonical_url}) - ${date}` : `[${title}](${canonical_url})`;
};

const replaceChunk = (
  content: string,
  marker: string,
  chunk: string,
  inline: boolean = false
): string => {
  const startMarker = `<!-- ${marker} start -->`;
  const endMarker = `<!-- ${marker} end -->`;

  const pattern = new RegExp(`${startMarker}[\\s\\S]*${endMarker}`, "g");

  if (!inline) {
    chunk = `\n${chunk}\n`;
  }

  return content.replace(pattern, `${startMarker}${chunk}${endMarker}`);
};

const updateReadme = async (): Promise<void> => {
  const url = "https://dev.to/api/articles?username=_itsglover";
  const feeds = await fetchFeed(url);

  try {
    const readmePath = `${process.cwd()}/README.md`;
    let readmeContent = await fs.readFile(readmePath, "utf-8");
    readmeContent = replaceChunk(readmeContent, "blog", feeds?.join("\n\n"));
    await fs.writeFile(readmePath, readmeContent, "utf-8");
    console.log("README.md updated successfully!");
  } catch (error) {
    console.error("Error updating README.md:", error);
  }
};

await updateReadme();
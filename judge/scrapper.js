import Firecrawl from "@mendable/firecrawl-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

// Create scrapped_docs folder if it doesn't exist
const DOCS_FOLDER = "./scrapped_docs";
if (!fs.existsSync(DOCS_FOLDER)) {
  fs.mkdirSync(DOCS_FOLDER, { recursive: true });
}

// Helper to create safe filename from URL
const createFilename = (url) => {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.replace(/\./g, "_");
  const pathname = urlObj.pathname.replace(/\//g, "_").replace(/\.[^.]+$/, "");
  const timestamp = Date.now();
  return `${hostname}${pathname}_${timestamp}`;
};

const scrappedAndStore = async (url) => {
  try {
    console.log(`Scraping URL: ${url}`);
    const doc = await firecrawl.scrape(url, { formats: ['markdown', 'html'] });
    console.log(doc);
    const filenameBase = createFilename(url);

    // Save Markdown
    const markdownPath = path.join(DOCS_FOLDER, `${filenameBase}.md`);
    fs.writeFileSync(markdownPath, doc.markdown);
    console.log(`Saved Markdown to: ${markdownPath}`);
    return true;
  }catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
  }
};

// Example URLs - replace with your actual URLs
const urls = [
  // React Official Docs
  "https://react.dev/learn",
  "https://react.dev/reference/react",
  "https://react.dev/reference/react-dom",
  "https://react.dev/learn/thinking-in-react",
  "https://react.dev/learn/describing-the-ui",
  "https://react.dev/learn/adding-interactivity",
  "https://react.dev/learn/managing-state",
  "https://react.dev/learn/escape-hatches",
  "https://react.dev/reference/react/hooks",
  "https://react.dev/reference/react/useState",
  "https://react.dev/reference/react/useEffect",
  "https://react.dev/reference/react/useContext",
  "https://react.dev/reference/react/useRef",
  "https://react.dev/reference/react/useMemo",
  "https://react.dev/reference/react/useCallback"
]; // <-- Added semicolon here

// Main execution
(async () => {
  console.log(`Starting scrape of ${urls.length} URLs...\n`);
  
  let successCount = 0;
  let failCount = 0;

  for (const url of urls) {
    const result = await scrappedAndStore(url);
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n=== Scraping Complete ===");
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Files saved in: ${DOCS_FOLDER}`);
})();
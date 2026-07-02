# PDF Link Extractor

**Deeply crawl any website to automatically extract all hidden and exposed PDF download links into a clean dataset.**

Whether you are building a repository of financial annual reports, hunting for product manuals, or scraping research papers from university portals, manually clicking through hundreds of web pages to find PDF links is tedious. This actor fully automates the process using a high-speed HTML crawler.

## What can this Actor do?

- ✅ **Deep Website Crawling** - Give it a starting URL and it will autonomously navigate through the website's internal architecture to find every single `.pdf` link.
- ✅ **Automatic Link Resolution** - Automatically converts messy relative paths (like `href="../../docs/report.pdf"`) into clean, clickable absolute URLs.
- ✅ **Global Deduplication** - If the exact same PDF is linked in the footer of 100 different pages, this actor is smart enough to only extract it *once*, keeping your dataset perfectly clean.
- ✅ **Anchor Text Extraction** - Extracts the text that was used to link to the PDF (e.g., "Download our 2023 Form 10-K") so you have context on what the file contains.

## Why scrape PDF links?

- 🎯 **Financial Research** - Bulk scrape investor relations pages to gather quarterly earnings reports, SEC filings, and ESG reports.
- 📊 **Academic Data** - Crawl university directories and research portals to compile datasets of academic papers and whitepapers.
- 📍 **E-commerce & Manufacturing** - Automatically find and download product manuals, MSDS sheets, and technical spec sheets from manufacturer websites.

## How to use it

1. Enter your website URL into the **Start URLs** field.
2. Set the **Max Pages to Scan** to limit how deep the crawler goes (e.g., 500 pages).
3. Ensure **Deep Crawl** is enabled if you want it to navigate the site, or disable it if you only want to scan the exact URLs provided.
4. Click Start!

## How much does it cost?

This actor uses a **Pay-Per-Event (PPE)** pricing model. You only pay for the HTML pages successfully scanned!
- **$0.50 per 1,000 pages scanned.**

## Output Example

When a unique PDF is found, the actor pushes this data to your dataset:

```json
{
  "pageUrl": "https://example.com/investor-relations/reports",
  "pdfUrl": "https://example.com/assets/docs/2023-annual-report.pdf",
  "linkText": "Download 2023 Annual Report (PDF)",
  "scrapedAt": "2023-10-25T15:00:00.000Z"
}
```

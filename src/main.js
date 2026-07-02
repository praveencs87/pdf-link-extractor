import { Actor } from 'apify';
import { CheerioCrawler, log, enqueueLinks } from 'crawlee';

await Actor.init();

try {
    const input = await Actor.getInput();
    if (!input || !input.startUrls || input.startUrls.length === 0) {
        throw new Error('startUrls is required!');
    }

    const { startUrls, maxPagesPerCrawl = 100, deepCrawl = true } = input;
    
    // Global set to keep track of discovered PDFs and avoid duplicates in the dataset
    const discoveredPdfs = new Set();
    
    let pagesScanned = 0;
    let pdfsExtracted = 0;

    const crawler = new CheerioCrawler({
        maxRequestsPerCrawl: maxPagesPerCrawl,
        
        async requestHandler({ request, $, enqueueLinks, log }) {
            const pageUrl = request.loadedUrl || request.url;
            
            // Extract all link tags
            const linkElements = $('a').toArray();
            let newPdfsOnPage = 0;

            for (const el of linkElements) {
                let href = $(el).attr('href');
                let linkText = $(el).text().trim() || $(el).attr('title') || '';
                
                if (!href) continue;
                
                // Fast check if it ends with .pdf or contains .pdf? or .pdf#
                const lowerHref = href.toLowerCase();
                if (!lowerHref.includes('.pdf')) continue;
                
                // Convert relative URLs to absolute
                try {
                    href = new URL(href, pageUrl).href;
                } catch (e) {
                    continue; // Invalid URL
                }
                
                // Double check it's actually a PDF file path
                const parsedUrl = new URL(href);
                if (!parsedUrl.pathname.toLowerCase().endsWith('.pdf')) {
                    continue;
                }

                // Deduplicate PDFs
                if (discoveredPdfs.has(href)) continue;
                discoveredPdfs.add(href);
                
                newPdfsOnPage++;
                pdfsExtracted++;
                
                // Push immediately to dataset
                await Actor.pushData({
                    pageUrl,
                    pdfUrl: href,
                    linkText,
                    scrapedAt: new Date().toISOString()
                });
            }

            // PPE Monetization: Charge per page scanned
            await Actor.charge({ eventName: 'page-scanned', count: 1 });
            pagesScanned++;
            
            log.info(`✅ Scanned ${pageUrl} - Found ${newPdfsOnPage} new unique PDFs.`);
            
            // Deep crawl logic: enqueue internal HTML pages
            if (deepCrawl) {
                await enqueueLinks({
                    strategy: 'same-domain',
                    // Only enqueue paths that don't look like static assets
                    transformRequestFunction(req) {
                        const url = new URL(req.url);
                        const ext = url.pathname.split('.').pop()?.toLowerCase();
                        const ignoreExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'css', 'js', 'zip', 'mp4'];
                        if (ext && ignoreExtensions.includes(ext)) {
                            return false;
                        }
                        return req;
                    }
                });
            }
        },
        
        async failedRequestHandler({ request, log }) {
            log.error(`Request ${request.url} failed too many times.`);
        },
    });

    log.info(`Starting crawler for ${startUrls.length} start URLs... (Deep Crawl: ${deepCrawl})`);
    
    await crawler.addRequests(startUrls);
    await crawler.run();

    log.info(`🎉 Finished! Scanned ${pagesScanned} pages and found ${pdfsExtracted} unique PDF links.`);
} catch (error) {
    log.error('Actor failed:', error);
    throw error;
}

await Actor.exit();

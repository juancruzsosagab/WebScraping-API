import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import UserAgent from 'user-agents';

export async function scrapeData(pagesToScrape = 2) {
  const url = 'https://members.collegeofopticians.ca/Public-Register';
  let pagesScraped = 0; // Variable to count scraped pages
  let data = []; // Array to store scraped data

  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Generate a random User-Agent
    const userAgent = new UserAgent();
    await page.setUserAgent(userAgent.toString());

    await page.goto(url, { waitUntil: 'networkidle2' }); // Wait for page to load fully

    // Wait for 'Loading' element to disappear
    await page.waitForSelector('span[translate="yes"]:not(:empty)', { hidden: true });

    // Handle potential button click for data retrieval (if needed)
    const submitButton = await page.waitForSelector('#ctl01_TemplateBody_WebPartManager1_gwpciNewQueryMenuCommon_ciNewQueryMenuCommon_ResultsGrid_Sheet0_SubmitButton', { visible: true, timeout: 10000 });
    if (submitButton) {
      await submitButton.click();
    }

    // Wait for target table to appear, with a longer timeout (adjust as needed)
    await page.waitForSelector('.rgMasterTable', { visible: true, timeout: 50000 });

    const pageInfo = await page.$eval('.rgInfoPart', info => info.innerText);
    const totalPages = pageInfo.match(/(\d+) pages/)[1];

    // Calculate the actual number of pages to scrape
    let pages;
    if (pagesToScrape === "all") {
      pages = totalPages; // Scrape all available pages
    } else {
      pages = Math.min(totalPages, parseInt(pagesToScrape, 10)); // Scrape the specified number of pages
    }

    // Extract data from each page
    for (let currentPage = 1; currentPage <= pages; currentPage++) {
      // Generate a new User-Agent for each page
      const userAgent = new UserAgent();
      await page.setUserAgent(userAgent.toString());

      // Scrape data from the current page
      const currentPageData = await page.evaluate(() => {
        const table = document.querySelector('.rgMasterTable');
        if (!table) {
          console.warn('Target table not found');
          return []; // Return empty array if table is missing
        }

        const rows = table.querySelectorAll('tbody tr');
        return Array.from(rows, row => {
          const columns = row.querySelectorAll('td');
          return {
            registrant: columns[0]?.innerText?.trim() || '',
            status: columns[1]?.innerText?.trim() || '',
            class: columns[2]?.innerText?.trim() || '',
            practice_location: columns[3]?.innerText?.trim() || '',
          };
        });
      });

      data.push(...currentPageData);
      pagesScraped++; // Increment scraped pages counter

      // Navigate to the next page if available
      if (currentPage < pages) {
        const nextPageButton = await page.waitForSelector(`.rgCurrentPage + a[title="Go to Page ${currentPage + 1}"]`);
        await nextPageButton.click();

        // Wait for 'Loading' element to appear and then disappear
        await page.waitForSelector('span[translate="yes"]:not(:empty)', { visible: true });
        await page.waitForSelector('span[translate="yes"]:not(:empty)', { hidden: true });
      }
    }

    await browser.close();

    // Save data to a JSON file
    const dataJSON = JSON.stringify(data, null, 2); // Convert to JSON with pretty formatting
    const filePath = path.join(path.resolve(), 'data', 'scraped_data.json'); // Path where JSON file will be saved

    // Check if the file already exists
    const fileExists = await fs.access(filePath)
      .then(() => true)
      .catch(() => false);

    if (fileExists) {
      // Overwrite existing file
      await fs.writeFile(filePath, dataJSON);
      console.log(`Existing file overwritten at ${filePath}`);
    } else {
      // Create a new file
      await fs.mkdir(path.dirname(filePath), { recursive: true }); // Ensure directory exists
      await fs.writeFile(filePath, dataJSON);
      console.log(`New file created at ${filePath}`);
    }

    // Also return the total number of pages scraped as an object within the return object
    return { success: true, data, pagesScraped };
  } catch (error) {
    console.error('Error in scraping:', error);
    return { success: false, error: error.message, pagesScraped };
  }
}
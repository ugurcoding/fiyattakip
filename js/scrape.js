const puppeteer = require('puppeteer');

async function getPrice(productName) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(productName)}&tbm=shop`;

    // Wait for the page to be fully loaded with network idle
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    try {
        // Optionally, take a screenshot for debugging
        await page.screenshot({ path: 'debug_page.png' });

        // Increase the timeout value to 30 seconds and wait for the element to appear
        await page.waitForSelector('.sh-dgr__grid-result', { timeout: 30000 });

        // Try to extract the price
        const price = await page.evaluate(() => {
            const priceElement = document.querySelector('.a8Pemb');
            return priceElement ? priceElement.textContent.trim() : null;
        });

        if (price) {
            return parseFloat(price.replace('₺', '').replace(' ', '').replace('.', '').replace(',', '.'));
        } else {
            throw new Error('Price not found');
        }

    } catch (error) {
        console.error('Error scraping price:', error);
        return null;
    } finally {
        await browser.close();
    }
}

module.exports = { getPrice };

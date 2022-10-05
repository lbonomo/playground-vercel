// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// https://nextjs.org/docs/api-routes/introduction
// https://github.com/alixaxel/chrome-aws-lambda
// https://github.com/vercel/og-image
// https://github.com/ireade/netlify-puppeteer-screenshot-demo

// The maximum execution timeout is 10
// seconds when deployed on a Personal Account (Hobby plan).
// For Teams, the execution timeout is 60 seconds (Pro plan)
// or 900 seconds (Enterprise plan).

const puppeteer = require("puppeteer-core");
const chrome = require("chrome-aws-lambda");

/** The code below determines the executable location for Chrome to
 * start up and take the screenshot when running a local development environment.
 *
 * If the code is running on Windows, find chrome.exe in the default location.
 * If the code is running on Linux, find the Chrome installation in the default location.
 * If the code is running on MacOS, find the Chrome installation in the default location.
 * You may need to update this code when running it locally depending on the location of
 * your Chrome installation on your operating system.
 */

async function getOptions() {

  let options;
  if ( process.env.ENVIRONMENT === 'local' ) {
    options = {
      executablePath: "/opt/google/chrome/chrome",
      headless: 'chrome',
    };
  } else {
    options = {
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    };
  }
  return options;
}


/**
 * Scroll.
 * 
 * @param page 
 */
 async function scroll(page) {
  const bodyHandle = await page.$('body');
  const { height } = await bodyHandle.boundingBox();
      
  const viewportHeight = page.viewport().height;
  let viewportIncr = 0;
  while (viewportIncr < height) {
      await page.evaluate( (_viewportHeight) => { window.scrollBy(0, _viewportHeight); }, viewportHeight);
      // await page.waitForTimeout(1000)
      viewportIncr = viewportIncr + viewportHeight;
  }
  
  // Scroll back to top
  await page.evaluate((_) => {  window.scrollTo(0, 0); });
  // await page.waitForTimeout(1000)
  return null
}

module.exports = async (req, res) => {

  const pageToScreenshot = req.body.url;

  // pass in this parameter if you are developing locally
  // to ensure puppeteer picks up your machine installation of
  // Chrome via the configurable options
  
  // try {

    // get options for browser
    const options = await getOptions();

    // launch a new headless browser with dev / prod options
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(30000);

    // set the viewport size
    await page.setViewport({ width: 1280, height: 720 });
     
    // const cookie_selector = "a#hs-eu-confirmation-button"
    // await page.waitForSelector(cookie_selector);
    // await page.$eval( cookie_selector, (form) => form.click() );

    // Scroll.
    await scroll(page)

    // tell the page to visit the url
    await page.goto(pageToScreenshot);

    // take a screenshot
    const file = await page.screenshot({
      type: "png",
      fullPage: true,
    });

    // close the browser
    await browser.close();

    res.statusCode = 200;
    res.setHeader("Content-Type", `image/png`);

    // return the file!
    res.end(file);
  // } catch (e) {
  //   res.statusCode = 500;
  //   res.json({
  //     body: "Sorry, Something went wrong!",
  //   });
  // }
};

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

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { bufferToBucket, makeKey, streamToBuffer, compareBuffer } from '../../libs/utils';

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
      await page.waitForTimeout(100)
      viewportIncr = viewportIncr + viewportHeight;
  }
  
  // Scroll back to top
  await page.evaluate((_) => {  window.scrollTo(0, 0); });
  await page.waitForTimeout(1000)
}



module.exports = async (req, res) => {

  const pageToScreenshot = req.body.url
  const testTime = Date.now().toString()

  // try {

    // get options for browser
    const options = await getOptions();

    // launch a new headless browser with dev / prod options
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(30000);

    // set the viewport size

    await page.setViewport({ width: 1280, height: 720 });

    // tell the page to visit the url
    await page.goto(pageToScreenshot)

    if ( req.body.selector ) {
      await page.click(req.body.selector)
    }

    // Scroll.
    await scroll(page)

    // Take a screenshot
    const snapshotBuffer = await page.screenshot({
      type: "png",
      fullPage: true,
    });


    // AWS common config
    const s3_region = process.env.S3_region
    const s3_bucket = process.env.S3_Bucket
    const s3_credentials = {
      accessKeyId: process.env.S3_AccessKeyId,
      secretAccessKey: process.env.S3_SecretAccessKey,
    };
    const s3_Client = new S3Client({ region: s3_region, credentials: s3_credentials });
    
    // Save screenshot.
    const snapshotKey = makeKey(pageToScreenshot, testTime ,'snapshot')
    const snapshotS3URL = await bufferToBucket(s3_Client, snapshotBuffer, snapshotKey)


    // Get base.
    const baseKey = makeKey(pageToScreenshot, null ,'base')
    const baseParams = {
      Bucket: s3_bucket,
      Key: baseKey,
    };

    let baseBuffer
    try {
      const baseData = await s3_Client.send(new GetObjectCommand(baseParams))
      baseBuffer = await streamToBuffer(baseData.Body)
    } catch {
      baseBuffer = snapshotBuffer
      // Save current snapshot as base
      await bufferToBucket(s3_Client, snapshotBuffer, baseKey)
    }

    
    // Make diff
    const {diffBuffer, diffPercent} = await compareBuffer(baseBuffer, snapshotBuffer)

    console.log("We have a diff...")
    
    // Storage diff
    const diffS3URL = await bufferToBucket(s3_Client, diffBuffer ,makeKey(pageToScreenshot, testTime, 'diff'))
    
    // close the browser
    await browser.close();

    // // return the file!
    res.statusCode = 200;
    res.setHeader("Content-Type", `image/png`);
    res.setHeader('Content-disposition', 'attachment; filename=screenshot.png');
    res.end(diffBuffer);
    
    const s3Data = {
        'snapshot': snapshotS3URL,
        'diff': diffS3URL
    }
    console.log(s3Data)

    // responder directamente la URL de S3.
    // res.statusCode = 200;
    // res.json({
    //   'snapshot': snapshotS3URL,
    //   'diff': diffS3URL
    // })

  // } catch (e) {
  //   res.statusCode = 500;
  //   res.json({
  //     body: "Sorry, Something went wrong!",
  //   });
  // }
};

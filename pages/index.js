import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useRef } from "react";


async function getBase() {
  console.log("Get Base")
  return "base"
}


export default function Home() {

  // Props.
  const [url, setURL] = useState('');
  const [cookieSelector, setCookieSelector] = useState(null);
  
  // Buffers images.
  const [base, setBase] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [compare, setCompare] = useState(null);

  // Get screenshot
  async function getScreenshot() {
    console.log("Get Screenshot")
    let apiURL = "api/screenshot"
    const data = {
      'url': url
    }
    if ( cookieSelector ) {
      data['selector'] = cookieSelector
    }
    
    // Get image.
    const snapshotURL = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(data)
    }).then((response) => {
      const reader = response.body.getReader();
      return new ReadableStream({
        start(controller) {
          return pump();
          function pump() {
            return reader.read().then(({ done, value }) => {
              // When no more data needs to be consumed, close the stream
              if (done) {
                controller.close();
                return;
              }
              // Enqueue the next data chunk into our target stream
              controller.enqueue(value);
              return pump();
            });
          }
        }
      })
    }).then((stream) => new Response(stream))     // Create a new response out of the stream
    .then((response) => response.blob())          // Create an object URL for the response
    .then( blob => URL.createObjectURL(blob) )
    .then((url) => { return url })
    .catch((err) => console.error(err));
    
    return snapshotURL
  }

  // Main function.
  async function handleClick() {
    setScreenshot( await getScreenshot() )
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Puppeteer serverless function test</title>
        <meta name="description" content="Puppeteer serverless function test" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Puppeteer serverless function test
        </h1>

        <div className={styles.grid}>
          <div className={styles.form }>

            <div className={styles.field}>
              <label>URL</label>              
              <input 
                className={styles.inputText} type='url' name='url'
                onChange={(event) => {setURL(event.target.value)}} 
                />
            </div>
            <div className={styles.field}>
              <label>Cookie selector</label>
              <input 
                className={styles.inputText} type='text' name='selector'
                onChange={(event) => {setCookieSelector(event.target.value)}} 
              />
            </div>
            <div className={styles.field}>
              <input className={styles.inputSubmit} type='button' defaultValue='Compare' onClick={ handleClick }/>
            </div>
          </div>
          <div className="pt-2">
            <img className={styles.img} src={screenshot} />            
          </div>
        </div>
      </main>

    </div>
  )
}

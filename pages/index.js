import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState } from "react";


async function getBase() {
  console.log("Get Base")
  return "base"
}


export default function Home() {

  // Props.
  const [url, setURL] = useState('');
  const [cookieSelector, setCookieSelector] = useState(null);
  
  // Buffers images.
  const [screenshot, setScreenshot] = useState(null);
  const [cursor, setCursor ] = useState('default');
  const [button, setButton ] = useState('true');

  // Get screenshot
  async function getScreenshot() {

    setCursor('wait')

    let apiURL = "api/screenshot"
    const data = { 'url': url }
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
    setCursor('default')
    return snapshotURL
  }

  // Main function.
  async function handleClick() {
    setButton('true')
    setScreenshot( await getScreenshot() )
    setButton('false')
  }

  return (
    <div className={styles.container} style={{ cursor: cursor }}>
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
                style={{ cursor: cursor }}
                className={styles.inputText} type='url' name='url'
                onChange={(event) => {
                  setButton(false)
                  setURL(event.target.value)
                }} 
                />
            </div>
            <div className={styles.field}>
              <label>Cookie selector</label>
              <input 
                style={{ cursor: cursor }}
                className={styles.inputText} type='text' name='selector'
                onChange={(event) => {setCookieSelector(event.target.value)}} 
              />
            </div>
            <div className={styles.field}>
              <input 
                style={{ cursor: cursor }}
                className={styles.inputSubmit}
                type='button'
                defaultValue='Compare'
                onClick={ handleClick } 
                disabled={ button }
              />
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

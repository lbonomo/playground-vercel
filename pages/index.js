import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

async function getBase() {
  console.log("Get Base")
  return ""
}

async function getScreenshot() {
  console.log("Get Screenshot")
  return ""
}

async function getCompare() {
  console.log("Compare")
  let url = "api/compare"
 
  const data = new URLSearchParams();
  data.append('url','https://bymason.com')

  const response = await fetch(url, {
    method: 'POST',
    // mode: 'same-origin', // no-cors, *cors, same-origin
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });

  return response

}

async function handleClick() {
  const base = await getBase()
  const screenshot = await getScreenshot()

  const compare = await getCompare()
}

export default function Home() {
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
              <input className={styles.inputText} type='text' name='url'/>
            </div>
            <div className={styles.field}>
              <label>Cookie selector</label>
              <input className={styles.inputText} type='text' name='selector'/>
            </div>
            <div className={styles.field}>
              <input className={styles.inputSubmit} type='button' defaultValue='Make screenshot' onClick={ handleClick }/>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}

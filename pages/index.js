import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Puppeteer headless function test" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Puppeteer headless function test
        </h1>

        <div className={styles.grid}>
          <form className={styles.form } action='/api/screenshot' method='post'>
            <div className={styles.field}>
              <label>URL</label>
              <input className={styles.inputText} type='text' value="https://bymason.com" name='url'/>              
            </div>
            <div className={styles.field}>
              <input className={styles.inputSubmit} type='submit' value='Make screenshot'/>
            </div>
          </form>
        </div>
      </main>

    </div>
  )
}

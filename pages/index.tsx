import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Basic } from '../components/Form'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Algorand Soulbound Tokens</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a target="_blank" href="https://parsl.co">Parsl!</a>
        </h1>

        <p className={styles.description}>
          This is our submission for the Algorand GreenHouse Hackathon<br/>
          <code className={styles.code}>Soul Bound NFTs ARC</code>
        </p>

        <div className={styles.grid}>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Play &rarr;</h2>
            <p>
              Instantly mint, claim and revoke SBTs using AlgoSigner.
            </p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Video &rarr;</h2>
            <p>
              Watch our pitch video to better understand our submission.
            </p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about our industry and the problem we are solving.</p>
          </a>

          <a target="_blank" href="https://github.com/MatiFalcone/algorand-soulbound/blob/main/ARCs/arc-5114.md" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find out about ARC-5114 and how to implement SBTs in Algorand.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Team &rarr;</h2>
            <p>
              Meet the great Parsl team.
            </p>
          </a>
          
          <a
            href="https://github.com/MatiFalcone/algorand-soulbound/tree/main/python"
            target="_blank"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Implementation in Python.</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home

import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link';    
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Algorand SBTs</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a target="_blank" rel="noopener noreferrer" href="https://parsl.co">Parsl</a>
        </h1>

        <p className={styles.description}>
          This is our submission for the Algorand GreenHouse Hackathon<br/>
          <code className={styles.code}>Soul Bound NFTs ARC</code>
        </p>

        <div className={styles.grid}>

          <Link href="/connect_wallet">
            <a className={styles.card}>
              <h2>Playground &rarr;</h2>
              <p>
                Instantly mint, claim and revoke SBTs using AlgoSigner.
              </p>
            </a>
          </Link>

          <a target="_blank" rel="noopener noreferrer"
            href="https://www.youtube.com/watch?v=5ujm5RIS9K0"
            className={styles.card}
          >
            <h2>Video &rarr;</h2>
            <p>
            Watch our pitch video for a better understanding of our submission.
            </p>
          </a>

          <a target="_blank" rel="noopener noreferrer" href="https://github.com/MatiFalcone/algorand-soulbound/blob/main/README.md" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about our industry and the problem we are solving.</p>
          </a>

          <a target="_blank" rel="noopener noreferrer" href="https://github.com/MatiFalcone/algorand-soulbound/blob/main/ARCs/arc-5114.md" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find out about ARC-5114 and how to implement SBTs in Algorand.</p>
          </a>

          <a
            target="_blank" rel="noopener noreferrer" href="https://github.com/MatiFalcone/algorand-soulbound#our-team-%EF%B8%8F"
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
            rel="noopener noreferrer"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Implementation in Python.</p>
          </a>
        </div>
      </main>
    </div>
  )
}

export default Home

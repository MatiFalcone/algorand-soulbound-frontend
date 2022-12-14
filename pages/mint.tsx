import type { NextPage } from 'next'
import Head from 'next/head'
import { GetServerSideProps } from "next";
import styles from '../styles/Home.module.css'
import { Mint } from '../components/Mint'
import Router from 'next/router'

const Playground: NextPage = (props:any) => {
  
  const back = () => {
    Router.push('/welcome')
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Soulbound Tokens Issuance</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Mint props={props}></Mint>
        <br />
        <button className={styles.goBackButton} onClick={back}>
          Go Back
        </button>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const ALGOD_SERVER = process.env.ALGOD_SERVER;
  const ALGOD_TOKEN = process.env.ALGOD_TOKEN;
  const PARSL_MNEMONIC = process.env.PARSL_MNEMONIC;
  return {
    props: {
      ALGOD_SERVER,
      ALGOD_TOKEN,
      PARSL_MNEMONIC
    }, // will be passed to the page component as props
  };
};

export default Playground

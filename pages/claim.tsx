import type { NextPage } from 'next'
import Head from 'next/head'
import { GetServerSideProps } from "next";
import styles from '../styles/Home.module.css'
import { Claim } from '../components/Claim'
import Router from "next/router";
import databaseConnect from '../utils/connect';
import Token from '../models/tokenModel';

const Playground: NextPage = (props:any) => {
  
  const back = () => {
    Router.push('/choose_role')
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Soulbound Tokens Claiming</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Claim props={props}></Claim>
        <br />
        <br />
        <br />
        <button className={styles.goBackButton} onClick={back}>
          Go Back
        </button>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  var tokens;
  try {
    await databaseConnect();
    tokens = await Token.find();

  } catch(error) {
    console.log(error);
  }
  const ALGOD_SERVER = process.env.ALGOD_SERVER;
  const ALGO_INDEXER = process.env.ALGO_INDEXER;
  const ALGOD_TOKEN = process.env.ALGOD_TOKEN;
  const PARSL_MNEMONIC = process.env.PARSL_MNEMONIC;
  return {
    props: {
      ALGOD_SERVER,
      ALGO_INDEXER,
      ALGOD_TOKEN,
      PARSL_MNEMONIC,
      tokens: JSON.parse(JSON.stringify(tokens))
    }, // will be passed to the page component as props
  };
};

export default Playground

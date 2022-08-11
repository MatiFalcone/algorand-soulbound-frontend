import type { NextPage } from 'next'
import Head from 'next/head'
import { GetServerSideProps } from "next";
import styles from '../styles/Home.module.css'
import { Claim } from '../components/Claim'
import Router from "next/router";

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
        <button onClick={back}>
          Go Back
        </button>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ALGOD_SERVER = process.env.ALGOD_SERVER;
  const ALGOD_TOKEN = process.env.ALGOD_TOKEN;
  return {
    props: {
      ALGOD_SERVER,
      ALGOD_TOKEN
    }, // will be passed to the page component as props
  };
};

export default Playground

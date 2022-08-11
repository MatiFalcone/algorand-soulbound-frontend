import React from "react";
import { useNavigate, BrowserRouter } from 'react-router-dom';
import Router from 'next/router'
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Role: NextPage = () => {

  const mint = () => {
    Router.push('/welcome')
  }

  const claim = () => {
    Router.push('/claim')
  }

  return (
      <div className={styles.container}>
        <Head>
          <title>Soulbound Tokens Playground</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <a>Are you a... </a>
          <button onClick={mint}>
            Token Issuer
          </button>
          <a>...or a </a>
          <button onClick={claim}>
            Token Claimer
          </button><a>?</a>
        </main>

      </div>
  )
}

export default Role
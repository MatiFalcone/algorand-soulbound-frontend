import { Formik, Field, Form } from 'formik';
import React from "react";
import styles from '../styles/Home.module.css'
import algosdk from "algosdk";
import crypto from "crypto";
import Swal from "sweetalert2";
import { useState } from 'react';
import ClipLoader from "react-spinners/ClipLoader";

declare var AlgoSigner: any;

export const Mint = (props: any) => {
  
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const createToken = async (assetId: Number, orderId: Number, transactionId: String, claimer: String, company: String, risk: String) => {
    // Stores token in off-chain issuer repository for future reference
    const res = await fetch("/api/token/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({
        assetId,
        orderId,
        transactionId,
        claimer,
        company,
        risk,
        claimed: false
      })
    })
    const data = await res.json();
  }

  const issueSBT = async(props: any, values: any) => {
    console.log(props);
    setIsLoading(true);
    const algodServer = props.props.ALGOD_SERVER;
    const token = { 
      "X-API-Key": props.props.ALGOD_TOKEN
    };
    console.log(token);
    const port = "";
    const algodClient = new algosdk.Algodv2(token, algodServer, port);
    console.log(algodClient);
    let client: string = localStorage.getItem("accountInformation")!;
    const parslAddr = algosdk.mnemonicToSecretKey(props.props.PARSL_MNEMONIC).addr;
    const sk = algosdk.mnemonicToSecretKey(props.props.PARSL_MNEMONIC).sk;
    let suggestedParams = await algodClient.getTransactionParams().do();
    console.log(suggestedParams);
    let metadataJson = {
      "standard": "ARC5114",
      "issuer": parslAddr,
      "claimer": client,
      "status": "issued",
      "description": "Cannabis Order Verification Certificate",
      "properties": {
        "Company": values.company,
        "Order": values.orderId,
        "Risk": values.risk
      },
      "mime_type": "image/png"
    }
    // Construimos el Hash de la metadata
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(metadataJson))
    const metadata = new Uint8Array(hash.digest());
    const paramsObj: any = {
      from: parslAddr,
      defaultFrozen: false,
      manager: parslAddr,
      reserve: undefined,
      clawback: parslAddr,
      freeze: parslAddr,
      strictEmptyAddressChecking: false,
      assetURL: "ipfs://QmbykSfp8ED1jieXgs23xioKimrNKPLk6KtcJr46fgZcos",
      decimals: 0,
      total: 1,
      note: AlgoSigner.encoding.stringToByteArray(JSON.stringify(metadataJson)),
      assetMetadataHash: metadata,
      assetName: "Cannabis Order Verification",
      unitName: "CANNA",
      suggestedParams: suggestedParams,
    };
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject(paramsObj)
    let signedTx = algosdk.signTransaction(txn, sk);
    let signed = []
    signed.push(signedTx.blob)
    let tx = (await algodClient.sendRawTransaction(signed).do());
    let assetId = null;
    const ptx = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
    console.log("Transaction: " + tx.txId);
    assetId = ptx["asset-index"];
    if(tx.txId !== undefined && assetId !== null) {
      const transaction = `https://testnet.algoexplorer.io/tx/` + tx.txId;
      Swal.fire(
        'Good job',
        `Your token has been issued. Check <a style="text-decoration: underline" target="_blank" rel="noopener noreferrer" href=${transaction}><b>transaction</b></a>`,       
        'success'
      )
      createToken(assetId, values.orderId, tx.txId, values.companyAccount, values.company, values.risk);
    }
  }

  return (
    <div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '1vh'}}>
        <h1>Issue SoulBound Token</h1>
      </div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '8vh'}}>
        <h6>Issue a certificate to the Algo account in the <code className={styles.code}>Company Account</code> field.</h6>
      </div>
      <br />
      <Formik
        initialValues={{
          orderId: '',
          company: '',
          companyAccount: '',
          risk: '',
        }}
        onSubmit={async (values) => {
          issueSBT(props, values).then(() => {
            setIsLoading(false);
          }).catch(()=> {
            setIsLoading(false);
          });
        }}
          >
        <Form>
          <label className={styles.mintingFormLabel} htmlFor="orderId">Order ID </label>
          <Field className={styles.mintingFormField} id="orderId" name="orderId" placeholder="1234" />
          <br />
          <br />
          <label className={styles.mintingFormLabel} htmlFor="company">Company </label>
          <Field className={styles.mintingFormField} id="company" name="company" placeholder="Cannabis Business" />
          <br />
          <br />
          <label className={styles.mintingFormLabel} htmlFor="companyAccount">Company Account </label>
          <Field className={styles.mintingFormField} id="companyAccount" name="companyAccount" placeholder="Algo Account" />
          <br />
          <br />
          <label className={styles.mintingFormLabel} htmlFor="risk">Risk </label>
          <Field className={styles.mintingFormField}
            id="risk"
            name="risk"
            placeholder="LOW | MEDIUM | HIGH"
            type="risk"
          />
          <br />
          <br />
          <br />
          <br />
          <button className={styles.mintingFormSubmitButton} type="submit" disabled={isLoading}>Issue Certificate </button>
        </Form>
      </Formik>
    </div>
  );
}
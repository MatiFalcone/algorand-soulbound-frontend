import algosdk from "algosdk";
import Router from "next/router";
import crypto from "crypto";
import { useEffect, useState } from 'react';
import Token from '../models/tokenModel';
import styles from '../styles/Home.module.css';
import Swal from 'sweetalert2';

declare var AlgoSigner: any;

interface Token {
  assetId: number, 
  orderId: number,
  transactionId: string,
  claimer: string,
  company: string,
  risk: string,
  claimed: boolean,
  revoked: boolean
}

export const Claim = (props: any) => {
  
  const [noTokens, setNoTokens] = useState(true);
  const [tokenList, setTokenList] = useState<Array<Token>>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const refreshPage = () => {
    Router.push('/claim')
  }

  useEffect(() => {
    const client: string = localStorage.getItem("accountInformation")!;
    const result = props.props.tokens.filter((x: any) => x.claimer === client && x.claimed !== true && x.revoked !== true);
    if(result.length === 0) {
      setNoTokens(true);
    } else {
      setNoTokens(false);
      setTokenList(result);
    }
  }, [props.props.tokens]);

  const updateToClaimed = async (assetId: Number, claimed: Boolean, revoked: Boolean) => {
    // Stores token in off-chain issuer repository for future reference
    const res = await fetch("/api/token/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({
        assetId,
        claimed,
        revoked
      })
    })
    const data = await res.json();
    console.log(data);
  }

  const claimToken = async (props: any, assetId: number, orderId: number, claimer: string, company: string, risk: string) => {
    
    setIsLoading(true);

    // Connect to node
    const algodServer = props.props.ALGOD_SERVER;
    const algoIndexer = props.props.ALGO_INDEXER;
    const token = { 
      "X-API-Key": props.props.ALGOD_TOKEN
    };
    const port = "";
    const algodClient = new algosdk.Algodv2(token, algodServer, port);
    const algoIndexerClient = new algosdk.Indexer(token, algoIndexer, port);
    
    let client: string = localStorage.getItem("accountInformation")!;
    const parslAddr = algosdk.mnemonicToSecretKey(props.props.PARSL_MNEMONIC).addr;
    const parslSk = algosdk.mnemonicToSecretKey(props.props.PARSL_MNEMONIC).sk;
    // Get params from network
    let suggestedParams = await algodClient.getTransactionParams().do();
    
    // 1) Create asset opt-in transaction
    const paramsObj: any = {
      from: client,
      to: client,
      amount: 0,
      assetIndex: assetId,
      suggestedParams: suggestedParams
    };
    const optinTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(paramsObj);
    const binaryOptinTxn = optinTxn.toByte();
    const optinTxn_b64 = AlgoSigner.encoding.msgpackToBase64(binaryOptinTxn);
    
    // 2) Issuer updates metadata
    let metadataJson = {
      "standard": "ARC5114",
      "issuer": parslAddr,
      "claimer": claimer,
      "status": "claimed",
      "description": "Cannabis Order Verification Certificate",
      "properties": {
        "Company": company,
        "Order": orderId,
        "Risk": risk
      },
      "mime_type": "image/png"
    }
    console.log(metadataJson);
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(metadataJson))
    const metadata = new Uint8Array(hash.digest());
    const updateObj: any = {
      from: parslAddr,
      assetIndex: assetId,
      manager: parslAddr,
      reserve: undefined,
      clawback: parslAddr,
      freeze: parslAddr,
      strictEmptyAddressChecking: false,
      note: AlgoSigner.encoding.stringToByteArray(JSON.stringify(metadataJson)),
      assetMetadataHash: metadata,
      suggestedParams: suggestedParams,
    };
    const updateTxn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject(updateObj);

    // 3) Send token to claimer
    const sendObj: any = {
      from: parslAddr,
      to: client,
      amount: 1,
      assetIndex: assetId,
      suggestedParams: suggestedParams
    };
    const sendTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(sendObj);

    // 4) Freeze token in claimer's account
    const freezeObj: any = {
      from: parslAddr,
      freezeTarget: client,
      freezeState: true,
      assetIndex: assetId,
      suggestedParams: suggestedParams
    };
    const freezeTxn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject(freezeObj);

    // Atomic Transfer
    algosdk.assignGroupID([optinTxn, updateTxn, sendTxn, freezeTxn]);
    let binaryTxs = [optinTxn.toByte(), updateTxn.toByte(), sendTxn.toByte(), freezeTxn.toByte()];
    let base64Txs = binaryTxs.map((binary) => AlgoSigner.encoding.msgpackToBase64(binary));

    // Sign all transactions
    let signedTxs = await AlgoSigner.signTxn([
      {
        txn: base64Txs[0]
      },
      {
        txn: base64Txs[1],
        signers: []
      },
      {
        txn: base64Txs[2],
        signers: []
      },
      {
        txn: base64Txs[3],
        signers: []
      }
    ]);

    let signedTx0Binary = AlgoSigner.encoding.base64ToMsgpack(signedTxs[0].blob);
    let signedTx1Binary = updateTxn.signTxn(parslSk);
    let signedTx2Binary = sendTxn.signTxn(parslSk);
    let signedTx3Binary = freezeTxn.signTxn(parslSk);

    let signed = []   
    signed.push(signedTx0Binary);
    signed.push(signedTx1Binary);
    signed.push(signedTx2Binary);
    signed.push(signedTx3Binary);

    let tx = (await algodClient.sendRawTransaction(signed).do());
    await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
    const claimingTransaction = await algoIndexerClient.lookupTransactionByID(tx.txId).do();
    console.log(claimingTransaction);
    let groupId = encodeURIComponent(claimingTransaction.transaction.group);
    await updateToClaimed(assetId, true, false);
    const atomicTransfer = `https://testnet.algoexplorer.io/tx/group/` + groupId;
    Swal.fire(
      'Good job',
      `Your token has been claimed. Check <a style="text-decoration: underline" target="_blank" rel="noopener noreferrer" href=${atomicTransfer}><b>atomic transfer</b></a>`,       
      'success'
    )    
    refreshPage();
  }

  const render = (props: any) => {
    if(noTokens) {
      return <div style={{display: 'flex', color: "red", justifyContent:'center', alignItems:'center', height: '10vh'}}><h6>No Tokens have been issued to your Algo account.</h6></div>
    } else {
      return (<div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thTitle}>Asset ID</th>
              <th className={styles.thTitle}>Company</th>
              <th className={styles.thTitle}>Order ID</th>
              <th className={styles.thTitle}>Risk</th>
              <th className={styles.thTitle}>Action</th>
            </tr>
          </thead>
          {tokenList?.map(({ assetId, orderId, transactionId, claimer, company, risk }, i) => (
            <tbody key={i}>
              <tr>
                <th className={styles.th}> {assetId} </th>
                <th className={styles.th}> {company} </th>
                <th className={styles.th}> {orderId} </th>
                <th className={styles.th}> {risk} </th>
                <th className={styles.th}><button className={styles.goBackButton} disabled={isLoading} onClick={() => claimToken(props, assetId, orderId, claimer, company, risk)
                  .then(() => {setIsLoading(false)})
                  .catch(() => {setIsLoading(false)})}>Claim Token</button></th>
              </tr>
            </tbody>
          ))}
        </table>
        </div>);
    }
  }

  return (
    <div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '1vh'}}>
        <h1>Claim SoulBound Token</h1>
      </div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '10vh'}}>
        <h6>Tokens issued to your Algo account:</h6>
      </div>
      <br />
      {render(props)}
    </div>
  );
}
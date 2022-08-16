import algosdk from "algosdk";
import crypto from "crypto";
import { useEffect, useState } from 'react';
import Token from '../models/tokenModel';

declare var AlgoSigner: any;

interface Token {
  assetId: number, 
  transactionId: string,
  claimer: string,
  company: string,
  risk: string,
  claimed: boolean
}

export const Claim = (props: any) => {
  
  const [noTokens, setNoTokens] = useState(true);
  const [tokenList, setTokenList] = useState<Array<Token>>();

  useEffect(() => {
    const client: string = localStorage.getItem("accountInformation")!;
    const result = props.props.tokens.filter((x: any) => x.claimer === client && x.claimed !== true);
    console.log(result);
    if(result.length === 0) {
      setNoTokens(true);
    } else {
      setNoTokens(false);
      setTokenList(result);
    }
  }, [props.props.tokens]);

  const claimToken = async (props: any, assetId: number, claimer: string, company: string, risk: string, claimed: boolean) => {

    // Connect to node
    const algodServer = props.props.ALGOD_SERVER;
    const token = { 
      "X-API-Key": props.props.ALGOD_TOKEN
    };
    const port = "";
    const algodClient = new algosdk.Algodv2(token, algodServer, port);
    
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
      "status": "claimed",
      "description": "Cannabis Order Verification Certificate",
      "properties": {
        "Issuer": "PARSL",
        "IssuedFor": claimer,
        "Company": company,
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
    //const binaryUpdateTxn = updateTxn.toByte();
    //const updateTxn_b64 = AlgoSigner.encoding.msgpackToBase64(binaryUpdateTxn);
    //const updateSignedTxn = algosdk.signTransaction(updateTxn, parslSk);

    // 3) Send token to claimer
    const sendObj: any = {
      from: parslAddr,
      to: client,
      amount: 1,
      assetIndex: assetId,
      suggestedParams: suggestedParams
    };
    const sendTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(sendObj);
    //const binarySendTxn = sendTxn.toByte();
    //const sendTxn_b64 = AlgoSigner.encoding.msgpackToBase64(binarySendTxn);
    //const sendSignedTxn = algosdk.signTransaction(sendTxn, parslSk);

    // 4) Freeze token in claimer's account
    const freezeObj: any = {
      from: parslAddr,
      freezeTarget: client,
      freezeState: true,
      assetIndex: assetId,
      suggestedParams: suggestedParams
    };
    const freezeTxn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject(freezeObj);
    //const binaryFreezeTxn = freezeTxn.toByte();
    //const freezeTxn_b64 = AlgoSigner.encoding.msgpackToBase64(binaryFreezeTxn);
    //const freezeSignedTxn = algosdk.signTransaction(freezeTxn, parslSk);

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
    const ptx = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
    console.log("token claimed = ", tx.txId);
    console.log(ptx);
  }

  const render = (props: any) => {
    if(noTokens) {
      return <div style={{display: 'flex', color: "red", justifyContent:'center', alignItems:'center', height: '10vh'}}><h6>No Soulbound Tokens issued for your Algo wallet.</h6></div>
    } else {
      return (<div>
        {tokenList?.map(({ assetId, transactionId, claimer, company, risk, claimed }, i) => (
          <div key={i}>
            <li> {claimer} can retrieve {assetId} </li>
            <button onClick={() => claimToken(props, assetId, claimer, company, risk, claimed)}>Claim</button>
          </div>
        ))}
        </div>);
    }
  }

  return (
    <div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '1vh'}}>
        <h1>Claim SoulBound Token</h1>
      </div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '10vh'}}>
        <h6>Token MUST have been issued to your Algo account in order for you to claim it.</h6>
      </div>
      <br />
      {render(props)}
    </div>
  );
}
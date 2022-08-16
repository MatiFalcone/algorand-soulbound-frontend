import { Formik, Field, Form } from 'formik';
import styles from '../styles/Home.module.css'
import algosdk from "algosdk";
import crypto from "crypto";
import Swal from "sweetalert2";

declare var AlgoSigner: any;

export const Mint = (props: any) => {
  
  const createToken = async (assetId: Number, transactionId: String, claimer: String, company: String, risk: String) => {
    const res = await fetch("/api/token/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({
        assetId,
        transactionId,
        claimer,
        company,
        risk,
        claimed: false
      })
    })
    const data = await res.json();
    console.log(data);
  }

  const issueSBT = async(props: any, values: any) => {
    console.log(values);
    const algodServer = props.props.ALGOD_SERVER;
    const token = { 
      "X-API-Key": props.props.ALGOD_TOKEN
    };
    console.log(token);
    const port = "";
    const algodClient = new algosdk.Algodv2(token, algodServer, port);
    console.log(algodClient);
    let client: string = localStorage.getItem("accountInformation")!;
    // EHZMYXLWT7FNOTVS2DV6P4QDD6CKDLDJA5LTPWOZ7KQEA6RRCGJJSLPEDM
    let parsl = "EHZMYXLWT7FNOTVS2DV6P4QDD6CKDLDJA5LTPWOZ7KQEA6RRCGJJSLPEDM";
    const sk = algosdk.mnemonicToSecretKey(props.props.PARSL_MNEMONIC).sk;
    let suggestedParams = await algodClient.getTransactionParams().do();
    console.log(suggestedParams);
    let metadataJson = {
      "standard": "ARC5114",
      "status": "issued",
      "description": "Cannabis Order Verification Certificate",
      "properties": {
        "Issuer": "PARSL",
        "IssuedFor": values.companyAccount,
        "Company": values.company,
        "Risk": values.risk
      },
      "mime_type": "image/png"
    }
    // Construimos el Hash de la metadata
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(metadataJson))
    const metadata = new Uint8Array(hash.digest());
    const paramsObj: any = {
      from: parsl,
      defaultFrozen: false,
      manager: parsl,
      reserve: undefined,
      clawback: parsl,
      freeze: parsl,
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
    //const binaryTxs = txn.toByte();
    //console.log(binaryTxs);
    //let txn_b64 = AlgoSigner.encoding.msgpackToBase64(binaryTxs);
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
        'Good job!',
        `Your token has been issued! Check <a style="text-decoration: underline" target="_blank" rel="noopener noreferrer" href=${transaction}><b>transaction</b></a>`,       
        'success'
      )
      createToken(assetId, tx.txId, values.companyAccount, values.company, values.risk);
    }
  }

  return (
    <div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '1vh'}}>
        <h1>Issue SoulBound Token</h1>
      </div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '8vh'}}>
        <h6>Issues a certificate to the account specified in the <code className={styles.code}>Company Account</code>field.</h6>
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
          //await new Promise((r) => setTimeout(r, 500));
          //alert(JSON.stringify(values, null, 2));
          console.log(values);
          issueSBT(props, values);
        }}
          >
        <Form>
          <label htmlFor="orderId">Order ID</label>
          <Field id="orderId" name="orderId" placeholder="#123" />

          <label htmlFor="company">Company</label>
          <Field id="company" name="company" placeholder="Cannabis Business" />

          <label htmlFor="companyAccount">Company Account</label>
          <Field id="companyAccount" name="companyAccount" placeholder="Algo Account" />

          <label htmlFor="risk">Risk</label>
          <Field
            id="risk"
            name="risk"
            placeholder="LOW | MEDIUM | HIGH"
            type="risk"
          />
          <button type="submit">Issue Certificate</button>
        </Form>
      </Formik>
    </div>
  );
}
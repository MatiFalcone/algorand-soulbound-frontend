import { Formik, Field, Form } from 'formik';
import styles from '../styles/Home.module.css'
import algosdk from "algosdk";
import crypto from "crypto";

declare var AlgoSigner: any;

export const Mint = (props: any) => {
  
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
    client = "EHZMYXLWT7FNOTVS2DV6P4QDD6CKDLDJA5LTPWOZ7KQEA6RRCGJJSLPEDM";
    const sk = algosdk.mnemonicToSecretKey(props.props.PARSL_MNEMONIC).sk;
    let suggestedParams = await algodClient.getTransactionParams().do();
    console.log(suggestedParams);
    let metadataJson = {
      "standard": "ARC5114",
      "status": "issued",
      "description": "Cannabis Order Verification Certificate",
      "properties": {
        "Issuer": "PARSL",
        "IssuedFor": "Q4MQ4GS5S3G5Z6MLRZBNJTIVPUMHFV7JU2QFO2OZHXNWE7JSHSZA",
        "Company": "AMS",
        "Risk": "LOW"
      },
      "mime_type": "image/png"
    }
    // Construimos el Hash de la metadata
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(metadataJson))
    const metadata = new Uint8Array(hash.digest());
    const paramsObj: any = {
      from: client,
      defaultFrozen: false,
      manager: client,
      reserve: undefined,
      clawback: client,
      freeze: client,
      strictEmptyAddressChecking: false,
      assetURL: "ipfs://QmepNYKTRQQDeeogGbYTBLUUi7YyxEE3KHngFRkJCMG7rZ",
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
    console.log("Transaction: " + tx.txId);

    // Wait for transaction to be confirmed
    //await utils.waitForConfirmation(algodClient, tx.txId);
    //AlgoSigner.signTxn([{ txn: txn_b64 }])
/*     .then((res: any) => {
      console.log("success sign in txn", res);
      AlgoSigner.send({
        ledger: "TestNet",
        tx: res[0].blob,
      });
    })
    .catch((e: any) => {
      console.error("Error in algo txn", e);
    }); */
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

          <label htmlFor="companyAccont">Company Account</label>
          <Field id="companyAccont" name="companyAccont" placeholder="Algo Account" />

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
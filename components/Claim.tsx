import { Formik, Field, Form } from 'formik';
import { useRef } from "react";
import algosdk from "algosdk";
import crypto from "crypto";

declare var AlgoSigner: any;

export const Claim = (props: any) => {
  
  const ref = useRef(null);

  const claimSBT = async(props: any, values: any) => {
    console.log("values inside claimSBT", values);
    console.log("estas son las props", props);
    const algodServer = props.props.ALGOD_SERVER;
    const token = { 
      "X-API-Key": props.props.ALGOD_TOKEN
    };
    console.log(token);
    const port = "";
    const algodClient = new algosdk.Algodv2(token, algodServer, port);
    console.log(algodClient);
    const client: string = localStorage.getItem("accountInformation")!;
    const accountAssetInfo = await algodClient
      .accountAssetInformation(client, 100434404) //myketoken asset id
      .do();
    console.log(accountAssetInfo)
    let suggestedParams = await algodClient.getTransactionParams().do();
    console.log(suggestedParams);
    let metadataJson = {
      "standard": "ARC5114",
      "status": "issued",
      "description": "Cannabis Order Verification Certificate",
      "properties": {
        "Issuer": client,
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
    const binaryTxs = txn.toByte();
    console.log(binaryTxs);
    let txn_b64 = AlgoSigner.encoding.msgpackToBase64(binaryTxs);
    AlgoSigner.signTxn([{ txn: txn_b64 }])
    .then((res: any) => {
      console.log("success sign in txn", res);
      AlgoSigner.send({
        ledger: "TestNet",
        tx: res[0].blob,
      });
    })
    .catch((e: any) => {
      console.error("Error in algo txn", e);
    });
  }

  return (
    <div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '1vh'}}>
        <h1>Claim SoulBound Token</h1>
      </div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '10vh'}}>
        <h6>Token MUST have been issued to your Algo account.</h6>
      </div>
      <br />
      <Formik
        initialValues={{
          assetId: ''
        }}
        onSubmit={async (values) => {
          //await new Promise((r) => setTimeout(r, 500));
          //alert(JSON.stringify(values, null, 2));
          console.log(values);
          claimSBT(props, values);
        }}
          >
        <Form>
          <label htmlFor="assetId">Asset ID</label>
          <Field id="assetId" name="assetId" placeholder="#123" />
          <button type="submit">Claim Certificate</button>
        </Form>
      </Formik>
    </div>
  );
}
import { NextApiRequest, NextApiResponse} from "next";
import databaseConnect from "../../../utils/connect";
import Token from "../../../models/tokenModel";

export default async function addToken(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { assetId, transactionId, claimer, company, risk } = req.body;
        await databaseConnect();
        const token = await Token.create(req.body);
        res.json({token});
    } catch(error) {
        console.log(error);
        res.json({error});
    }
}
import { NextApiRequest, NextApiResponse} from "next";
import databaseConnect from "../../../utils/connect";
import Token from "../../../models/tokenModel";

export default async function updateToken(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { assetId, claimed, revoked } = req.body;
        await databaseConnect();
        const token = await Token.updateOne({ assetId: assetId }, { claimed: claimed, revoked: revoked });
        res.json({token});
    } catch(error) {
        console.log(error);
        res.json({error});
    }
}
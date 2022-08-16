import { Schema, model, models } from "mongoose";

const tokenSchema = new Schema({
    assetId: {
        type: Number,
        required: true,
        unique: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    claimer: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    risk: {
        type: String,
        required: true
    },
    claimed: {
        type: Boolean,
        required: true,
        default: false
    }
});

const Token = models.Token || model('Token', tokenSchema);

export default Token;
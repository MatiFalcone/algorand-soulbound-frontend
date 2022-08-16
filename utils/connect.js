import mongoose from "mongoose";

const databaseConnect = async () => {
  await mongoose.connect(process.env.MONGODB_URI, 
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then((res) => {
            console.log(
            'Connected to Distribution API Database - Initial Connection'
            );
        })
        .catch((err) => {
            console.log(
            `Initial Distribution API Database connection error occured -`,
            err
            );
        });
}

export default databaseConnect;
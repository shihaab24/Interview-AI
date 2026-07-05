const mongoose = require ('mongoose');
require ('dotenv').config()

async function connectToDB () {

    try{
        const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(dbUri);
        console.log("connected to DB");

    }catch(err){
        console.log(err);
    }
}

module.exports = connectToDB;
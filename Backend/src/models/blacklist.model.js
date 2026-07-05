const mongoose = require("mongoose");

const blacklistTokenSchema = mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to be added is blacklist!"]

    },
        
    
},{timestamps: true})

const tokenBlacklistModel = mongoose.model("blacklistTokens",blacklistTokenSchema);
module.exports = tokenBlacklistModel;
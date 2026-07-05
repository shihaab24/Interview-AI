const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")


async function authUser(req,res,next){

    let token = req.cookies.token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }
    
    if(!token){
        return res.status(401).json({
            message: "Token is not provided"
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "Token is invalid"
        })
    }

    try{

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            req.user = decoded

            next()

    }catch(err) {
        return res.status(401).json({
            message: "Incalid token"
        })
    }

}

module.exports = { authUser }
const userModel = require ("../models/user.model");
const bcrypt = require ("bcryptjs");
const jwt = require ("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

/** 
 * @name registerUserController
 * @description this controller helps to register a new user it expects username, email, password
 * @access Public
 */

async function registerUserController (req,res) {

    const {username, email, password} = req.body;

    if(!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password!"
        })
    }

    /** check if user already exists */

    const isUserAlreadyRegistered = await userModel.findOne ({
        $or: [{username}, {email}]
    })

    if(isUserAlreadyRegistered){
        return res.status(400).json({
            message: "User already exists with email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    /* Creating a token */
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET ,
        { expiresIn: "1d" }

    )

    
    /* Setting token in cookie */
    res.cookie("token", token)

    res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


/**
 * @name loginUserController
 * @description this controller helps users to login it expects an email address and a password
 * @access Public 
 */

async function loginUserController (req,res) {
    const {email, password} = req.body;


    /* check if this email id is already registered */
    const user = await userModel.findOne({email});
    
    if(!user){
        return res.status(400).json({
            message: "Invalid email or password!"
        })
    }


    /* check if password entered mathes to the one in DB */
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password!"
        })
    }

    /* Creating a token */
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET ,
        { expiresIn: "1d" }

    )

    /* Setting token in cookie */
    res.cookie("token", token);

    res.status(200).json({
        message: "User logged in successfully.",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
    

    
}

/**
 * @ame logoutUserController
 * @description Logout user by clearing the token cookie
 * @access Public
 */

async function logoutUserController (req,res) {
    let token = req.cookies.token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    if(token) {
        await tokenBlacklistModel.create({token});
    }

    res.clearCookie("token");

    res.status(200).json({
        message: "User logged out successfully."
    })

}

/**
 * @name getMeController
 * @description get the current logged in user details
 * @access Private
 */

async function getMeController(req,res) {

    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};


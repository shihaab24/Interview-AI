const express = require ('express');

const router = express.Router;
const authRouter = router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware")
/**
 * @route Post /api/auth/register
 * @description Register a new user
 * @access Public
 */

authRouter.post("/register",authController.registerUserController);

/**
 * @route Post /api/auth/login
 * @description Login user with email and password
 * @access Public
 */

authRouter.post("/login",authController.loginUserController);

/**
 * @route Get /api/auth/logout
 * @description Logout user by clearing the token cookie
 * @access Public
 */

authRouter.get("/logout",authController.logoutUserController)


/**
 * @route Get /api/auth/get-me
 * @description gets the current logged in user details
 * @access Private
 */
authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController)


module.exports = authRouter;
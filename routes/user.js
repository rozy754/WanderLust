const express = require("express");
const router = express.Router();
//user model ko require kr re hai 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
//passport ko require krna hia taki login krte waqt user ko authenticate kre ki hai ya ni vo phle se data base ke nader
const passport = require("passport");
//yh voi middleware vali file mae se is middleware ko require kr lia tha vs code ne automatically yaad hae ?
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
.route("/signup")
.get(userController.renderSignupForm)
.post( wrapAsync( userController.signup));


//saveRedirectUrl yh ek middleware hae jo original url jha se user login ki koshish kr ra tha usko locals ke andr save kra ra hai taki vo baad mai usi pe redirect kr ske 
router
.route("/login")
.get( userController.renderLoginForm)
.post(
    saveRedirectUrl,
    passport.authenticate("local",{failureRedirect:"/login",
        failureFlash: true,
    }),
    userController.login
    );

    
router.get("/logout",userController.logout)

module.exports = router;
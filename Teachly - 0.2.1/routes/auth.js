const bodyParser = require('body-parser');
express = require('express');
router = express.Router();
authController = require('../controllers/authController')


router.post("/login",  bodyParser.json({ limit: "1mb" }),  authController.login)

router.post("/register", bodyParser.json({ limit: "10mb" }), authController.register)

router.get('/logout', authController.logout)

router.get("/oauth2/redirect/google",  authController.getUserDetailsG);

router.get("/signinWithGoogle",  authController.getUrlGauth);

router.get("/loginWithGoogle",  authController.googleLogin);


router.get("/oauth2/redirect/facebook",  authController.getUserDetailsF);

router.get("/signinWithFacebook",  authController.getUrlFauth);

router.get("/loginWithFacebook",  authController.facebookLogin);



// @desc    this changes user http cookie settings, if it doesn't exist it creates it then adds settings
// @route   GET /
router.post('/settings', bodyParser.json({ limit: "50mb" }), authController.settings)

// @desc    this route gets the email and email verificatiob code then validates the email address then logs the user in
// @route   GET /
router.get('/emailValidation', authController.emailValidation)

// @desc    this route gets the email and email verificatiob code then validates the email address then logs the user in
// @route   GET /
router.post('/refresh-token', authController.refreshToken)


module.exports = router
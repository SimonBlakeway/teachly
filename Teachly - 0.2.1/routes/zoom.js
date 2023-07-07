const express = require('express')
const router = express.Router()
const fs = require('fs');
const db = require('../config/db');
const utils = require(process.cwd() + '/utils.js');
const paypal = require('../util-APIs/paypal');
const { contextSetup } = require(process.cwd() + '/utils.js');

subroute = `/gateway/zoom`



//webhook
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {

  // Return a 200 response to acknowledge receipt of the event

  res.sendStatus(200)
});




module.exports = router
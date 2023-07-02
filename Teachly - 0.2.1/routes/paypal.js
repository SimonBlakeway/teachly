const express = require('express')
const router = express.Router()
const fs = require('fs');
const db = require('../config/db');
const utils = require(process.cwd() + '/utils.js');
const paypal = require('../util-APIs/paypal');
const { contextSetup } = require(process.cwd() + '/utils.js');

subroute = `/gateway/paypal`



//webhook
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {

  // Return a 200 response to acknowledge receipt of the event

  res.sendStatus(200)
});


//checkout routes 
router.post('/create-checkout-session', async (req, res) => {
  try {


    orderContext = {
      amount: 30,
      currency: req.settings.cur,
      description: "lol",
      lang: req.settings.lang
    }


    order = await paypal.createOrder(orderContext)
    console.log(result.data.links[1].href)

    //console.log(order)
    res.send(result.data.links[1].href)


  } catch (error) {
    console.log(error)
    res.redirect("/") // treats bad actor request same as an invalid request
  }
});

router.get('/success', async (req, res) => {
  res.render('landingPage', {
    layout: 'main',
    context: contextSetup(req.settings, ["navbar", "footer"], "landingPage"),
  })
});

router.get('/cancel', async (req, res) => {
  res.render('landingPage', {
    layout: 'main',
    context: contextSetup(req.settings, ["navbar", "footer"], "landingPage"),
  })
});



//general paypal test
router.get('/payplal-gateway', async (req, res) => {
  res.render('paypalGateway', {
    layout: 'main',
  })
});




//paypal oauth
router.get("/signin-with-paypal", async (req, res) => {
  url = paypal.getConnectionUrl()
  res.redirect(url)
})

router.get("/oauth2/redirect/paypal", async (req, res) => {

  res.render('landingPage', {
    layout: 'main',
    context: contextSetup(req.settings, ["navbar", "footer"], "landingPage"),
  })


  code = req.query.code
  accessToken = paypal. getAcccesToken()
  


})











module.exports = router
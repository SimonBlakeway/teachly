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
  url = await paypal.getConnectionUrl()
  res.send(url)
})

router.get("/oauth2/redirect/paypal", async (req, res) => {
  res.redirect("/")

  code = req.query.code
  financial_id_placeholder = req.query.randint


  userInfo = await paypal.getUserID(code)
  console.log(userInfo)

  if (userInfo.verified_account == true) {
    try {
          result = await db.query(`UPDATE teacher_course SET financial_id = $1 
          WHERE financial_id = $2 
          AND financial_platform IS NULL`, [userInfo.payer_id, financial_id_placeholder]);
        } catch (error) {
          console.log(error)
        }
  }
  else {

    // ? send nofification and ask user to retry?

  }

})


module.exports = router
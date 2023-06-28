const express = require('express')
const router = express.Router()
const fs = require('fs');
const db = require('../config/db');
const utils = require(process.cwd() + '/utils.js');
const paypal = require('../util-APIs/paypal');
const { contextSetup } = require(process.cwd() + '/utils.js');

subroute = `/gateway/paypal`



//checkout success and payment success are different
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  console.log("reee")
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {

    //handling checkout events, async versions exist but not sure how to best imp
    case 'checkout.session.completed':
      const checkoutSucceeded = event.data.object;
      console.log(checkoutSucceeded)
      break;
    case 'checkout.session.expired':
      //const checkoutSucceeded = event.data.object;
      break;

    // ... handle payment intent events
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      console.log(paymentIntentSucceeded)
      break;
    case 'payment_intent.canceled':
      //const checkoutSucceeded = event.data.object;
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

router.post('/create-checkout-session', async (req, res) => {
  try {

    orderContext = {
      amount: 30,
      currency: "USD",
      description: "l",
      lang: ""
    }

    
    order = paypal.createOrder(orderContext)





    // unit amount should be an integer, so maybe create function that converts 
    // a currency from float/decimal to integer?

    //uniqe idenifiers to tie the completed to this?
    console.log(session.id)
    console.log(session.client_reference_id)
    console.log(session.customer)


    res.send(session.url)

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

//general stripe test
router.get('/payplal-gateway', async (req, res) => {
  res.render('stripeGateway', {
    layout: 'main',
  })
});






module.exports = router
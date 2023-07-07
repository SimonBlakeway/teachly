const express = require('express')
const router = express.Router()
const fs = require('fs');
const db = require('../config/db');
const utils = require(process.cwd() + '/utils.js');
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
const stripeUtils = require('../util-APIs/stripe.js');
const { contextSetup } = require(process.cwd() + '/utils.js');

subroute = `/gateway/stripe`
/*
try {
  result = await db.query('select * FROM users');

  
  
} catch (error) {
  console.log(error)
}
*/
//used to secure stripe webhook
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET

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


    //maybe by using checkout intent can be avoided?
    price = 1000

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: req.settings.cur.toLowerCase(),
            product_data: {
              name: "course booking"
            },
            unit_amount: utils.currencyFloatToInt(price)

          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.COMPLETE_URL + subroute}/success`,
      cancel_url: `${process.env.COMPLETE_URL + subroute}/cancel`,
      currency: req.settings.cur.toLowerCase(),
      locale: req.settings.lang,  //language configuration
      customer_email: req.settings.email,
      metadata: {
        order_id: '6735', // way to identify users  generate order crypto.randomBytes(20).toString('hex')
      },
      //invoice_creation , to create emails to send to user
    });

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
router.get('/stripe-gateway', async (req, res) => {
  res.render('stripeGateway', {
    layout: 'main',
  })
});



//paypal oauth
router.get("/signin-with-stripe", async (req, res) => {
  url = paypal.getConnectionUrl()
  res.redirect(url)
})

router.get("/oauth2/redirect/stripe", async (req, res) => {


  res.render('landingPage', {
    layout: 'main',
    context: contextSetup(req.settings, ["navbar", "footer"], "landingPage"),
  })

  code = req.query.code
  accessToken = stripe.getAcccesToken(code)


  res.send(user_details)

})







module.exports = router
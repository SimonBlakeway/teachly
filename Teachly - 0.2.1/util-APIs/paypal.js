const { randomUUID } = require('crypto');
const db = require('../config/db');
const utils = require(process.cwd() + '/utils.js');
const axios = require('axios');
baseURL = process.env.PAYPAL_BASE_URL
var access_token = "";




async function setToken() {
    try {
        url = `${baseURL}/oauth2/token`
        data = {
            "grant_type": "client_credentials"
        }
        config = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            auth: {
                username: process.env.PAYPAL_CLIENT_ID,
                password: process.env.PAYPAL_CLIENT_SECRET
            }
        }
        result = await axios.post(url, data, config)
        access_token = result.data.access_token
    } catch (error) {
        console.log(error)
    }
}
async function setup() {
    setToken()
    setInterval(async () => {
        //refresh access token every 50 min
        setToken(access_token)
    }, ((32341 - (5 * 60)) * 1000))
}
async function verifyWebhook(webhookObj) {
    try {
        url = `${baseURL}/notifications/verify-webhook-signature`
        data = JSON.stringify({
            "transmission_id": webhookObj.transmission_id,
            "transmission_time": webhookObj.transmission_time,
            "cert_url": webhookObj.cert_url,
            "auth_algo": webhookObj.auth_algo,
            "transmission_sig": webhookObj.transmission_sig,
            "webhook_id": webhookObj.webhook_id,
            "webhook_event": webhookObj.webhook_event
        })
        config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
        }

        result = await axios.post(url, data, config)

    } catch (err) {

    }

}
async function createOrder(amount, currency, description, lang) {

    url = `${baseURL}/v2/checkout/orders`
    data = JSON.stringify({
        "intent": "CAPTURE",
        "purchase_units": [
            {

                "description": description,
                //"reference_id": "d9f80740-38f0-11e8-b467-0ed5f89f718b",
                "custom_id": randomUUID(),
                "amount": { "currency_code": currency, "value": amount }
            }],
        "payment_source": {
            "paypal": {
                "experience_context": {
                    "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
                    "payment_method_selected": "PAYPAL",
                    "brand_name": "TEACHLY",
                    "locale": lang,
                    "landing_page": "LOGIN",
                    // "shipping_preference": "SET_PROVIDED_ADDRESS",
                    "user_action": "PAY_NOW",
                    "return_url": procces.env.COMPLETE_URL,
                    "cancel_url": procces.env.COMPLETE_URL
                }
            }
        }
    })
    config = {
        headers: {
            'Content-Type': 'application/json',
            'PayPal-Request-Id': randomUUID(), //need to generate token for indempotency
            'Authorization': `Bearer ${access_token}`
        },
    }

    /*
    result = {
        "id": "5O190127TN364715T",
        "status": "PAYER_ACTION_REQUIRED",
        "payment_source": {
            "paypal": {}
        },
        "links": [
            {
                "href": "https://api-m.paypal.com/v2/checkout/orders/5O190127TN364715T",
                "rel": "self",
                "method": "GET"
            },
            {
                "href": "https://www.paypal.com/checkoutnow?token=5O190127TN364715T",
                "rel": "payer-action",
                "method": "GET"
            }
        ]
    }
    */

    result = await axios.post(url, data, config)

    console.log(result)

    //checkoutLink  =  result.links[1].href

    


}
async function payUser(userId, userPaypalAcountId, amount, currency) {

    const transfer = await stripe.transfers.create({
        amount: amount,
        currency: currency,
        destination: userStripeAcountId,
    });

}



module.exports = {
    setToken,
    setup,
    payUser,
    verifyWebhook,
    createOrder
}

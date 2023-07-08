const { randomUUID } = require('crypto');
const db = require('../config/db');
const utils = require(process.cwd() + '/utils.js');
const axios = require('axios');
const http = require("https");
baseURL = process.env.PAYPAL_BASE_URL
baseHostURL = process.env.COMPLETE_URL
var access_token = "";

function base64EncodeAuth(str) {
    const buff = Buffer.from(str, 'utf-8');
    const base64 = buff.toString('base64');
    return base64
}


//server side 
async function setServerToken() {
    try {
        url = `${baseURL}/v1/oauth2/token`
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
    await setServerToken()
    setInterval(async () => {
        //refresh access token every 50 min
        setServerToken(access_token)
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
    try {

        url = `${baseURL}/v2/checkout/orders`

        data = JSON.stringify({
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "description": "reee",
                    "soft_descriptor": "reee",
                    "reference_id": randomUUID(),  //"d9f80740-38f0-11e8-b467-0ed5f89f718b",
                    "amount": {
                        "currency_code": "USD",
                        "value": "100.00",
                        "breakdown": {
                            "item_total": {
                                "currency_code": "USD",
                                "value": "100.00"
                            },
                        },

                    },

                    "items": [
                        {
                            "name": "string",
                            "quantity": "1",
                            "description": "string",
                            "sku": "dddddd",
                            "category": "DIGITAL_GOODS",
                            "unit_amount": {
                                "currency_code": "USD",
                                "value": "100.00"
                            },
                            //  "tax": {
                            //      "currency_code": "str",
                            //      "value": "string"
                            //  }
                        }
                    ],

                }
            ],
            "payment_source": {
                "paypal": {
                    "experience_context": {
                        "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
                        "payment_method_selected": "PAYPAL",
                        "brand_name": "TEACHLY",
                        "locale": "en-US",
                        "landing_page": "NO_PREFERENCE",
                        "user_action": "PAY_NOW",
                        "return_url": `${baseHostURL}/gateway/paypal/paypalSuccess`,
                        "cancel_url": `${baseHostURL}/gateway/paypal/paypalCancel`
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
        result = await axios.post(url, data, config)
        data = result.data.links[1].href
        return data
    } catch (error) {
        console.log((error.response.data))
    }
}
async function payUser(PAYPAL_ID, sender_item_id, sender_batch_id ,amount, currency) {

    url = `${baseURL}/v1/payments/payouts`

    data = JSON.stringify({
        "sender_batch_header": {
            "sender_batch_id": sender_batch_id,
            "email_subject": "You have a payout!",
            "email_message": "You have received a payout! Thanks for using our service!"
        }, "items": [
            {
                "recipient_type": "PAYPAL_ID", "amount": {
                    "value": amount,
                    "currency": currency
                },
                "note": "Thanks for your patronage!",
                "sender_item_id": sender_item_id,
                "receiver": PAYPAL_ID, 
                "recipient_wallet": "RECIPIENT_SELECTED"
            }
        ]
    })
    config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
    }

    result = await axios.post(url, data, config)

}


//oauth
async function getConnectionUrl() {
    // http://127.0.0.1:3001/
    scopes = ["openid", `https://uri.paypal.com/services/paypalattributes`].join(" ")
    scopes = encodeURIComponent(scopes)
    //scopes = encodeURIComponent("openid")
    //return_url = encodeURIComponent(`${baseHostURL}/gateway/paypal/oauth2/redirect/paypal`)
    return_url = encodeURIComponent("https://www.google.com/")
    return_url = encodeURIComponent("http://127.0.0.1:3001/gateway/paypal/oauth2/redirect/paypal")


    url = `https://www.sandbox.paypal.com/connect/?flowEntry=static&client_id=${process.env.PAYPAL_CLIENT_ID}&response_type=code&scope=${scopes}&redirect_uri=${return_url}`
    return url
}
async function getAcccesToken(code) {
    try {
        basicStr =`Basic ${base64EncodeAuth(process.env.PAYPAL_CLIENT_ID +":"+process.env.PAYPAL_CLIENT_SECRET)}`
        url = `${baseURL}/v1/oauth2/token`
        const data = `grant_type=authorization_code&code=${code}`;
        config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': basicStr
            },
        }
        result = await axios.post(url, data, config)
        return (result.data.access_token)
    } catch (error) {
        console.log(error.response.data)
    }
}
async function getUserID(code) {
    accessToken = await getAcccesToken(code)
    const { data } = await axios({
        url: `${baseURL}/v1/identity/openidconnect/userinfo?schema=openid`,
        method: 'get',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${accessToken}`,
        },
    })
    return data
}


module.exports = {
    setServerToken,
    setup,
    payUser,
    verifyWebhook,
    createOrder,
    getConnectionUrl,
    getUserID,
    getAcccesToken,
}





const express = require('express')
const router = express.Router()
const fs = require('fs');
const db = require('../config/db');
const utils = require(process.cwd() + '/utils.js');
baseHostURL = process.env.COMPLETE_URL


async function setup() {


    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, { 
        apiVersion: '2023-05-28',
        maxNetworkRetries: 1,
        timeout: 8000,
        host: process.env.DOMAIN, 
        port: process.env.PORT,
        telemetry: true,
        protocol: 'https'
    });

}

async function payUser(userId, userStripeAcountId, amount, currency) {

    const transfer = await stripe.transfers.create({
        amount: amount,
        currency: currency,
        destination: userStripeAcountId,
    });

}

// oauth
async function getConnectionUrl(nonce) {
    scopes = `read_only`
    return_url = encodeURIComponent(`${baseHostURL}/gateway/paypal/stripe/redirect/stripe&nonce=${nonce}`)
    const url = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_ID}&scope=${scopes}&redirect_uri=${return_url}`
    return url
}

async function getAcccesToken(code) {
    //to get any details from the google api you need the access token, so I decided it needs it's own function

    const response = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code: 'ac_123456789',
    });

    return res.data.access_token
}

async function getUserID(code) {
    const response = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code: 'ac_123456789',
    });

    var connected_account_id = response.stripe_user_id;
    return connected_account_id
}

module.exports = {
    getConnectionUrl,
    payUser,
    getAcccesToken,
    getUserID,
    setup
}


const express = require('express')
const router = express.Router()
const fs = require('fs');
const db = require('../config/db');
const utils = require(process.cwd() + '/utils.js');

const stripe = Stripe(`${process.env.STRIPE_SECRET_TEST_KEY}`, {
    apiVersion: '2023-05-28',
    maxNetworkRetries: 1,
    timeout: 8000,
    host: process.env.DOMAIN, // 'http://localhost:4242' example
    port: process.env.PORT,
    telemetry: true,
    protocol: 'https'
});

const account = await stripe.accounts.create({
    type: 'express',
});

const accountLink = await stripe.accountLinks.create({
    account: process.env.STRIPE_ID,
    refresh_url: 'https://example.com/reauth',
    return_url: 'https://example.com/return',
    type: 'account_onboarding',
});


async function payUser(userId, userStripeAcountId, amount, currency) {

    const transfer = await stripe.transfers.create({
        amount: amount,
        currency: currency,
        destination: userStripeAcountId,
    });

}


async function getConnectionUrl() {
    const url = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&scope=read_only&redirect_uri=${d}`
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
async function getUserDetails(code) {
    accessToken = await getAcccesToken(code)
    const { data } = await axios({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
    return data

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
    payUser
}

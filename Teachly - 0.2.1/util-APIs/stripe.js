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







async function payUser(userId, userStripeAcountId, amount, currency ) {

    const transfer = await stripe.transfers.create({
        amount: amount,
        currency: currency,
        destination: userStripeAcountId,
    });

}
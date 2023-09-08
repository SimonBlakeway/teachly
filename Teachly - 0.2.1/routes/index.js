const express = require('express')
const router = express.Router()
const { contextSetup, } = require(process.cwd() + '/utils.js');
const db = require('../config/db');



// @desc    Landing page
// @route   GET / 
router.get('/', async (req, res) => {
  res.render('landingPage', {
    layout: 'main',
    context: contextSetup(req.settings, ["navbar", "footer"], "landingPage"),
  })
})

// @desc    Login page
// @route   GET / login
router.get('/login', async (req, res) => {
  res.render('login', {
    layout: "main",
    context: contextSetup(req.settings, ["footer"], "login"),
  })
})


// @desc    Registration  page
// @route   GET / register
router.get('/register', async (req, res) => {
  res.render('register', {
    layout: "main",
    context: contextSetup(req.settings, ["footer"], "register"),
  })
})


// @desc    help page
// @route   GET /
router.get('/help', async (req, res) => {
  res.render('help')
})

// @desc    feedback page
// @route   GET /
router.get('/feedback', async (req, res) => {
  res.render('feedback')
})


// @desc    view user profile
// @route   GET /user/id
router.get('/user/:id', async (req, res) => {
  userId = req.params.id
  res.render('userProfile', {
    layout: "main",
    context: contextSetup(req.settings, ["footer"], "userProfile"),
  })
})

module.exports = router

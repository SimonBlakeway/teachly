const express = require('express')
const router = express.Router()
const { LZDecompress } = require('../utils')
const fs = require('fs');
const db = require('../config/db');
const { json } = require('body-parser');


validSpecialitiesObj = JSON.parse(fs.readFileSync(`./private_resources/json/validspecialities.json`))
validSubjectObj = JSON.parse(fs.readFileSync(`./private_resources/json/validSubject.json`))

// @desc    get supported Subject
// @route   GET /
router.get('/validSubject', (req, res) => {
  try {
    res.send(validSubjectObj[req.settings.lang])
  } catch (error) {
    res.sendStatus(404)
  }
})

// @desc    get supported validspecialities
// @route   GET /
router.get('/validSpecialities/:subject', (req, res) => {
  try {
    res.send(validSpecialitiesObj[req.settings.lang][req.params['subject']])
  } catch (error) {
    res.sendStatus(404)
  }
})


// @desc    get images
// @route   GET /
router.get('/images/profile/:id', (req, res) => {
  if (req.params.id == null) {
    res.send(404)
    return
  }
  db.query(`SELECT profile_img FROM user_info WHERE id = $1`, [req.params.id], (err, result) => {
    if (result.rowCount == 0) {
      res.send("404")
      return
    }

    /*
     
     I have an idea, and it goes something like this

     so when a client make a request to the server, for assets that are loaded from
     the postgresql database, often there is already the asset loaded and stored as 
     a file in the directory, this is especially true for assets that are requested 
     for very often, the way it is done currently is bad, since it adds a random number 
     at the end to stop collisions with the other asset loaded from the database.
     which is both inefficient and janky

     */

    directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing
    img = LZDecompress(result.rows[0].profileImg.trim())
    fs.writeFileSync(directoryPath + `${req.params.id}.png`, img, { encoding: 'base64' });
    try { res.sendFile(`${req.params.id}.png`, { root: directoryPath }) }
    catch { res.send("404") }

  })
})

// @desc    get currency ratio
// @route   GET /
router.get('/curConversionRatio/:cur', (req, res) => {
  try {
    //res.json({ "ratio": global.currencyObj.conversion_rates[req.params.cur] })
    res.json({ "ratio": 5 })
  }
  catch (err) {
    res.json({ "err": err })
  }
})


module.exports = router
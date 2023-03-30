const express = require('express')
const router = express.Router()
const { LZDecompress } = require('../utils')
const fs = require('fs');
const db = require('../config/db');
const { json } = require('body-parser');




validSpecialitiesObj = JSON.parse(fs.readFileSync(`./private_resources/json/validspecialities.json`))
validSubjectObj = JSON.parse(fs.readFileSync(`./private_resources/json/validSubject.json`))
validLanguagesArr = JSON.parse(fs.readFileSync(`./private_resources/json/validLanguages.json`))


// @desc    get supported languages
// @route   GET /
router.get('/validLanguagesFullName', (req, res) => {
  try {
    res.send(validLanguagesArr.fullName)
  } catch (error) {
    res.sendStatus(404)
  }
})

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
  db.query(`SELECT profileImg FROM user_info WHERE id = $1`, [req.params.id], (err, result) => {
    if (result.rowCount == 0) {
      res.send("404")
      return
    }
    directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing
    img = LZDecompress(result.rows[0].profileImg.trim())
    fs.writeFileSync(directoryPath + `${req.params.id}.png`, img, { encoding: 'base64' });
    try { res.sendFile(`${req.params.id}.png`, { root: directoryPath }) }
    catch { res.send("404") }

  })
})

// @desc    get images
// @route   GET /
router.get('/curConversionRatio/:cur', (req, res) => {
  try {
    res.json({ "ratio": global.currencyObj.conversion_rates[req.params.cur] })
  }
  catch (err) {
    res.json({ "err": err })
  }
})


module.exports = router
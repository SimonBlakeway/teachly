const express = require('express')
const router = express.Router()
const { LZDecompress } = require('../utils')
const fs = require('fs');
const db = require('../config/db');
const { createAssetTimer } = require('../customTimers')


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
router.get('/images/profile/:id', async (req, res) => {
  directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing

  try {
    if (req.params.id == null) {
      res.send(404)
    }
    else if (global.timerObj[`${req.params.id}-profile-image.jpeg`]) {
      console.log("image already exists, sending image to client and resetting timer")
      createAssetTimer(`${req.params.id}-profile-image.jpeg`, 1000 * 10) //   1000 * 60 * 15     15 minutes
      res.sendFile(`${req.params.id}-profile-image.jpeg`, { root: directoryPath })


    }
    else {
      console.log("image does not exist, sending image to client and creating timer")
      result = await db.query(`SELECT profile_img FROM user_info WHERE id = $1`, [req.params.id])
      if (result.rowCount == 0) {
        res.send("404")
        return
      }

      directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing
      img = LZDecompress(result.rows[0].profile_img.trim())
      createAssetTimer(`${req.params.id}-profile-image.jpeg`, 1000 * 60 * 15) //15 minutes
      fs.writeFileSync(directoryPath + `${req.params.id}-profile-image.jpeg`, img, { encoding: 'base64' });
      res.sendFile(`${req.params.id}-profile-image.jpeg`, { root: directoryPath })

    }
  } catch (error) {
    console.log(error)
    res.sendStatus(404)
  }
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
const express = require('express')
const router = express.Router()
const { contextSetup } = require(process.cwd() + '/utils.js');
const db = require('../config/db');
const utils = require('../utils')
const fs = require('fs');


// @desc    profile
// @route   GET /profile
router.get('/', async (req, res) => {
  res.render('profile', {
    layout: "main",
    context: contextSetup(req.settings, ["footer"], "profile"),
  })
})


// @desc    settings page
// @route   GET /
router.get('/settings', (req, res) => {
  res.render('profileSettings', {
    name: "user"
  })
})

// @desc    profile img
// @route   GET /
router.get('/img', async (req, res) => {
  if (req.settings.isUser == false) {
    res.sendStatus(404)
    return
  }
  try {
    result = await db.query(`SELECT profile_img, id FROM user_info WHERE id = $1`, [req.settings.id]);
    if (result.rowCount == 0) {
      res.send("404")
      return
    }

    imgName = `${req.settings.id}.png`
    directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing
    img = utils.LZDecompress(result.rows[0].profile_img.trim())
    fs.writeFileSync(directoryPath + imgName, img, { encoding: 'base64' });
    res.sendFile(imgName, { root: directoryPath }, () => {
      fs.unlink(directoryPath + imgName, err => {
      })
    })
  } catch (error) {
    console.log(error)

  }
})









module.exports = router

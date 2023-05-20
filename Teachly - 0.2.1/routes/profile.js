const express = require('express')
const router = express.Router()
const { contextSetup } = require(process.cwd() + '/utils.js');
const db = require('../config/db');
const utils = require('../utils')
const fs = require('fs');

router.use(require('../middleware/auth.js').ensureUser)


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


// @desc    active chat rooms and messages
// @route   GET /
router.get('/rooms', async (req, res) => {
  try {
    result = await db.query(`
       SELECT t1.chat_id, t2.name, t2.id
       from chat t1
         inner join user_info t2 on t2.id = t1.teacher_id
         inner join teacher_course t3 on t3.teacher_id  = t1.teacher_id
        WHERE t1.teacher_id = $1 `, [req.settings.id]);

    if (result.rowCount == 0 == 12) {
      res.send("404")
      return
    }
    else {
      //send chat profile info

      falseData = [
        { "chat_id": "1222", "name": "brad Pit", "id": "1111111" },
        { "chat_id": "1412", "name": "Makaio Zorica Asenov", "id": "1111112" },
        { "chat_id": "1612", "name": "Sans Sanna Cabello", "id": "1111113" },
        { "chat_id": "12122", "name": "Tijana Dorji Martín", "id": "1111114" },
        { "chat_id": "121232", "name": "dfdfdf Pit", "id": "1111115" },
        { "chat_id": "121352", "name": "barwgv Pit", "id": "1111116" },
        { "chat_id": "121232", "name": "ynrebw Pit", "id": "1111117" },
        { "chat_id": "1215532", "name": "eyehew Pit", "id": "1111118" },
        { "chat_id": "1214362", "name": "bvbtee Pit", "id": "1111119" },
      ]

      res.send(falseData)
    }

  } catch (error) {
    console.log("reee")

  }
})

// @desc    old messages, newer one will be send realtime
// @route   GET /
router.get('/old-messages', async (req, res) => {
  try {
    result = await db.query(`
        SELECT * from messages
        WHERE sender_id = $1 OR receiver_id = $2
        ORDER BY created_at desc`, [req.settings.id, req.settings.id]);

    if (result.rowCount == 0 == 12) {
      res.send("404")
      return
    }
    else {
      //send messages info
      falseData = [
        {
          "text": "character(1024) ",
          "created_at": 1212121,
          "sender_id": 1212,
          "receiver_id": 1212,
          "chat_id": 1222,
        },
        {
          "text": "character(1024) ",
          "created_at": 1212121,
          "sender_id": 1212,
          "receiver_id": 1212,
          "chat_id": 1222,
        },
        {
          "text": "character(1024) ",
          "created_at": 1212121,
          "sender_id": 1212,
          "receiver_id": 1212,
          "chat_id": 1222,
        },
        {
          "text": "character(1024) ",
          "created_at": 1212121,
          "sender_id": 1212,
          "receiver_id": 1212,
          "chat_id": 1222,
        },
        {
          "text": "character(fddsfdfdsfa) ",
          "created_at": 1212121,
          "sender_id": 1212,
          "receiver_id": 1212,
          "chat_id": 1222,
        }
      ]


      res.send(falseData)
    }

  } catch (error) {
    console.log(error)

  }
})









module.exports = router

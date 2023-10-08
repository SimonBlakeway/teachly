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
      console.log("not found image")
      res.send("404")
      return
    }

    imgName = `${req.settings.id}.png`
    directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing
    img = utils.LZDecompress(result.rows[0].profile_img.trim())
    fs.writeFileSync(directoryPath + imgName, img, { encoding: 'base64' });
    res.sendFile(imgName, { root: directoryPath }, () => {
      fs.unlink(directoryPath + imgName, err => {
        if (err) console.log(err, "ererr")
      })
    })
  } catch (error) {
    console.log(error)

  }
})

// @desc    view user profile
// @route   GET /user/id
router.get('/chat', async (req, res) => {
  res.render('chat', {
    layout: "main",
    context: contextSetup(req.settings, ["navbar"], "chat"),
  })
})


// @desc    active chat rooms and messages
// @route   GET /
router.get('/rooms', async (req, res) => {
  try {
    result = await db.query(`
       SELECT t1.chat_id, t2.name, t1.teacher_id, t1.student_id
       from chat t1
         inner join user_info t2 on t2.id = t1.teacher_id OR t2.id = t1.student_id
        WHERE t1.teacher_id = $1 OR t1.student_id = $1`, [req.settings.id]);

    if (result.rowCount == 0 == 12) {
      res.send("404")
      return
    }
    else {
      //send chat profile info

      falseData = [
        { "chat_id": "1222", "name": "brad Pit", "id": "111231111", "last_message_time": 121212 },
        { "chat_id": "1412", "name": "Makaio Zorica Asenov", "id": "1111112" },
        { "chat_id": "1612", "teacher_name": "Sans Sanna Cabello", "teacher_id": "1111113" },
        { "chat_id": "12122", "teacher_name": "Tijana Dorji Martín", "teacher_id": "1111114" },
        { "chat_id": "121232", "teacher_name": "dfdfdf Pit", "teacher_id": "1111115" },
        { "chat_id": "121352", "teacher_name": "barwgv Pit", "teacher_id": "1111116" },
        { "chat_id": "121262", "teacher_name": "ynrebw Pit", "teacher_id": "1111117" },
        { "chat_id": "1215532", "teacher_name": "eyehew Pit", "teacher_id": "1111118" },
        { "chat_id": "1214362", "teacher_name": "bvbtee Pit", "teacher_id": "1111119" },
      ]

      res.send(falseData)
    }

  } catch (error) {
    console.log(error)
    console.log("reee")

  }
})

// @desc    old messages, newer one will be send realtime
// @route   GET /
router.get('/old-messages', async (req, res) => {
  try {
    result = await db.query(`
    SELECT t2.text
    FROM chat t1 
    INNER JOIN messages t2
      ON t1.chat_id = t2.chat_id
    WHERE t1.teacher_id = $1 Or t1.student_id = $1
    ORDER BY
      t1.created_at ASC`, [req.settings.id]);

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
          "sender_id": 196,
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

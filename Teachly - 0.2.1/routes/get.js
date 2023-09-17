const express = require('express')
const router = express.Router()
const { LZDecompress } = require('../utils')
const fs = require('fs');
const db = require('../config/db');
const { createAssetTimer } = require('../customTimers')


const validSpecialitiesObj = JSON.parse(fs.readFileSync(`./private_resources/json/validspecialities.json`))
const validSubjectObj = JSON.parse(fs.readFileSync(`./private_resources/json/validSubject.json`))

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
router.get('/images/course/:courseId', async (req, res) => {
  directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing
  try {
    id = req.params.courseId

    fileName = `${id}-course-image.jpeg`
    if (id == null) {
      res.send(404)
    }
    else if (global.timerObj[`${fileName}`]) {
      console.log("image already exists, sending image to client and resetting timer")
      createAssetTimer(`${fileName}`, 1000 * 10) //   1000 * 60 * 15     15 minutes
      res.sendFile(`${fileName}`, { root: directoryPath })


    }
    else {
      result = await db.query(`SELECT course_img FROM teacher_course WHERE course_id = $1`, [id])
      if (result.rowCount == 0) {
        console.log(result.rows)
        res.sendFile(`no-image-found.png`, { root: "`./public/images/`" })
        return
      }

      directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing
      img = LZDecompress(result.rows[0].course_img.trim())
      createAssetTimer(`${fileName}`, 1000 * 60 * 15) //15 minutes
      fs.writeFileSync(directoryPath + `${fileName}`, img, { encoding: 'base64' });
      res.sendFile(`${fileName}`, { root: directoryPath })

    }
  } catch (error) {
    res.sendFile(`no-image-found.png`, { root: `./public/images/` })
  }
})

// @desc    get images
// @route   GET /
router.get('/images/profile/:id', async (req, res) => {
  directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing

  try {
    if (req.params.id == null || parseInt(req.params.id == NaN || typeof req.params.id == "undefined") ) {
      res.send(404)
      return
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
        res.sendFile(`no-image-found.png`, { root: `./public/images/` })
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
    console.log("dfsfdsd")
    res.sendStatus(404)
  }
})

// @desc    get user image
// @route   GET /user-image/id
/*
router.get('/user-image/:userId', async (req, res) => {
  userId = req.params.userId
  //res.set("Cache-Control", "private, max-age=80000");
  try {
    result = await db.query(`SELECT profile_img FROM user_info WHERE id = $1`, [userId]);
    if (result.rowCount == 0) {
      res.send("404")
      return
    }

    imgName = `${req.settings.id}.png`
    directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing
    img = LZDecompress(result.rows[0].profile_img)
    fs.writeFileSync(directoryPath + imgName, img, { encoding: 'base64' });
    res.sendFile(imgName, { root: directoryPath }, () => {
      fs.unlink(directoryPath + imgName, err => {
      })
    })

  } catch (error) {
    console.log(error)
    //console.log(error)

  }



})
*/

// @desc    get currency ratio
// @route   GET /
router.get('/curConversionRatio/:cur', (req, res) => {
  try {
    //res.json({ "ratio": global.currencyObj.conversion_rates[req.params.cur] })
    res.json({ "ratio": 1 })
  }
  catch (err) {
    res.json({ "err": err })
  }
})

// @desc    get course reviews
// @route   GET /
router.post('/course-reviews/:id', async (req, res) => {
  try {
    id = req.params.id
    result = (await db.query(`
    SELECT 
      t1.*,
      t2.name
    FROM 
      reviews t1
      INNER JOIN user_info t2
          ON t1.author_id = t2.id
    WHERE 
      t1.course_id = $1
    ORDER BY 
      (likes + dislikes) DESC;`, [id])).rows
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.json({ "err": err.message })
  }
})

// @desc    get user reviews
// @route   GET /
router.post('/user-reviews/:id', async (req, res) => {
  try {
    id = req.params.id
    result = (await db.query(`
    SELECT 
      t1.*,
      t2.name
    FROM 
      reviews t1
      INNER JOIN user_info t2
          ON t1.author_id = t2.id
    WHERE 
      t1.course_id = $1
    ORDER BY 
      (likes + dislikes) DESC;`, [id])).rows
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.json({ "err": err.message })
  }
})


module.exports = router
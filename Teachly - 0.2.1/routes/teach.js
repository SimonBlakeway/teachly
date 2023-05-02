const express = require('express');
const router = express.Router()
const { contextSetup } = require(process.cwd() + '/utils.js');
const utils = require(process.cwd() + '/utils.js');
const db = require('../config/db');
const bodyParser = require('body-parser');
const { compile } = require('html-to-text');
const options = { wordwrap: false, };
const compiledConvert = compile(options);

function courseImagePrep(imgStr) {
  //the "cap" needs to be removed before it can be converted into an image
  console.log(Date.now())
  base64Image = imgStr.split(';base64,').pop();
  comp = utils.LZCompress(base64Image)
  console.log(Date.now())
  return comp
}


router.use(require('../middleware/auth.js').ensureUser)

// @desc    teach landing page
// @route   GET /
router.get('/', (req, res) => {
  try {
    res.render('teach', {
      layout: "main",
      context: contextSetup(req.settings, ["footer"], "teach"),
    })
  }
  catch (err) {
    res.json({ "err": err })
  }
})

// @desc    createCourse
// @route   GET /
router.get('/createCourse', async (req, res) => {
  try {
    if (req.settings.isUser == false) {
      res.redirect("/login")
      return
    }

    res.render('createCourse', {
      layout: "main",
      context: contextSetup(req.settings, ["navbar", "footer"], "createCourse"),
    })
  }
  catch (err) {
    res.json({ "err": err })
  }
})

// @desc    createCourse
// @route   POST /
router.post('/createCourse', bodyParser.json({ limit: "10mb" }), async (req, res) => {
  try {
    res.send({ "result": true })
    courseData = req.body
    courseData.image = await courseImagePrep(courseData.courseImg)
    courseData.description = compiledConvert(courseData.description)
    courseObj = {
      description: courseData.description,
      createdAt: Math.floor(Date.now() / 1000),
      taughtIn: courseData.taughtIn,
      offersTrialLesson: courseData.offersTrialLesson,
      pricePerLesson: courseData.pricePerLesson,
      subject: courseData.subject,
      specialities: courseData.specialities,
      availableTimes: courseData.availableTimes,
      courseImg: courseData.courseImg
    }
    try {
      result = await db.query(`
          INSERT INTO teacher_course ( 
            description,
            created_at,
            taught_in, 
            price_per_lesson,
            subject, 
            specialities, 
            time_schedule,
            teacher_id,
            teacher_name,
            ts_vector
              ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, to_tsvector( $10 ) )`,
        [courseObj.description,
        courseObj.createdAt,
        courseObj.taughtIn,
        courseObj.pricePerLesson,
        courseObj.subject,
        courseObj.specialities,
        courseObj.availableTimes,
        req.settings.id,
        req.settings.name,
        [req.settings.name, courseObj.description].join(" ")
        ]);
    } catch (error) {
      console.log(error)
    }
  } catch (err) {
    console.log(err)
    res.send({ "err": err })
  }
})

// @desc    course settings
// @route   GET /
router.get('/course/:courseId/settings', async (req, res) => { //[req.params.courseId]
  try {
    console.log(req.settings)

    res.render('createCourse', {
      layout: "main",
      context: contextSetup(req.settings, ["navbar", "footer"], "createCourse"),
    })
  }
  catch (err) {
    res.json({ "err": err })
  }
})




module.exports = router



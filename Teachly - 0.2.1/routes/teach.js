const express = require('express');
const router = express.Router()
const { contextSetup } = require(process.cwd() + '/utils.js');
const utils = require(process.cwd() + '/utils.js');
const db = require('../config/db');
const bodyParser = require('body-parser');
const { compile } = require('html-to-text');
const options = { wordwrap: false, };
const compiledConvert = compile(options);



router.use(require('../middleware/auth.js').ensureUser)

// @desc    teach landing page
// @route   GET /
router.get('/', (req, res) => {
  try {
    res.render('teachLandingPage', {
      layout: "main",
      context: contextSetup(req.settings, ["navbar", "footer"], "teachLandingPage"),
    })
  }
  catch (err) {
    res.json({ "err": err })
  }
})

// @desc    createCourse
// @route   GET /
router.get('/create-course', async (req, res) => {
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

    courseData = req.body



    if (courseData.lesson_time >= 60) throw new Error("lesson time too high")
    if (courseData.lesson_time < 20) throw new Error("lesson time too low")
    if (courseData.price >= 60) throw new Error("price too high")
    if (courseData.price < 1) throw new Error("price too low")

 


    res.send({ "result": true })





    courseData.image = courseData.courseImg
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
      courseImg: courseData.courseImg,
      lesson_time: courseData.lesson_time
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
            ts_vector,
            lesson_time
              ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, to_tsvector( $10 ), $11 )`,
        [courseObj.description,
        courseObj.createdAt,
        courseObj.taughtIn,
        courseObj.pricePerLesson,
        courseObj.subject,
        courseObj.specialities,
        courseObj.availableTimes,
        req.settings.id,
        req.settings.name,
        [req.settings.name, courseObj.description].join(" "),
        courseObj.lesson_time
        ]);
    } catch (error) {
      console.log(error)
    }



  } catch (err) {
    console.log(err.message)
    res.send({ "err": err.message }) 
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



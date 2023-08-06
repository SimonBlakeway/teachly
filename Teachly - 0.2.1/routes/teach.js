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

    //price_per_minute check
    if (typeof courseData.price_per_minute != "number") throw new Error("price too low")
    if (courseData.price_per_minute > 5) throw new Error("price too high")
    if (courseData.price_per_minute < 0.05) throw new Error("price too low")

    //description check
    if (typeof courseData.description != "string") throw new Error("price too low")
    if (courseData.description.length > 6969) throw new Error("price too low")
    if (courseData.description.length < 0) throw new Error("price too low")

    //taughtIn check
    if (courseData.taughtIn.constructor !== Array) throw new Error("price too low")
    if (courseData.taughtIn.length == 0) throw new Error("price too low")

    //offersTrialLesson check
    if (typeof courseData.offersTrialLesson != "boolean") throw new Error("price too low")

    //calender_times check
    if (typeof courseData.calender_times.constructor !== Array) throw new Error("price too low")



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
      courseImg: await utils.ImagePrep(utils.LZDecompress(courseData.courseImg), `${req.settings.name}-course-${courseData.subject}`, dimensions = [1440, 1440], maxSize = 2097152),
      price_per_minute: courseData.price_per_minute,
      calender_times: courseData.courseTimeRanges
    }


    try {
      result = await db.query(`
          INSERT INTO teacher_course ( 
            description,
            created_at,
            taught_in, 
            subject, 
            specialities, 
            teacher_id,
            teacher_name,
            ts_vector,
            course_img,
            price_per_minute,
            calender_times
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, to_tsvector( $10 ), $11)`,
        [courseObj.description,
        courseObj.createdAt,
        courseObj.taughtIn,
        courseObj.subject,
        courseObj.specialities,
        req.settings.id,
        req.settings.name,
        [req.settings.name, courseObj.description].join(" "),
        courseObj.courseImg,

        courseObj.price_per_minute,
        courseObj.calender_times
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

    res.render('createCourse', {
      layout: "main",
      context: contextSetup(req.settings, ["navbar", "footer"], "createCourse"),
    })
  }
  catch (err) {
    res.json({ "err": err })
  }
})


// @desc    teach landing page
// @route   GET /
router.get('/', async (req, res) => {

  //get info
  result = await db.query(`SELECT email, name FROM user_info WHERE email = $1 OR name=$2`, [user.email, user.name]);
  queryInfo = result.something

  try {
    res.render('viewCourseRequest', {
      layout: "main",
      context: contextSetup(req.settings, ["navbar", "footer"], "viewCourseRequest", queryInfo), //add new param, dbData or something
    })
  }
  catch (err) {
    res.json({ "err": err })
  }
})




module.exports = router



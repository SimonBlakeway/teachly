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
    courseData = req.body


    // this function asumes the data is not clean
    courseData.image = await utils.ImagePrep(courseData.courseImg, "course-id=" + req.settings.id)
    courseData.description = compiledConvert(courseData.description)


    if (!courseData.image) {
      throw new Error("invalid image")
    }

    if (!((utils.isValidLanguage(courseData.taughtIn, fullName = true)) >= 0)) { throw new Error("invalid Language") }
    courseData.taughtIn = utils.langugeToLanguageCode(courseData.taughtIn)
    if (!utils.isInt(courseData.pricePerLesson) || ((courseData.pricePerLesson <= 0) || (courseData.pricePerLesson > 60))) { throw new Error("invalid pricePerLesson") }
    if (!(utils.isValidSubject(courseData.taughtIn, courseData.subject))) { throw new Error("invalid subject") }
    if (!utils.isValidSubjectSpeciality(courseData.taughtIn, courseData.subject, courseData.specialities)) { throw new Error("invalid specialities") }
    if (!utils.isValidAvailableTimes(courseData.availableTimes)) { throw new Error("invalid availableTimes") }

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
      result = await db.query(`INSERT INTO teacher_course ( description, created_at, taught_in, price_per_lesson, subject, specialities, time_schedule, teacher_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [courseObj.description, courseObj.createdAt, courseObj.taughtIn, courseObj.pricePerLesson, courseObj.subject, courseObj.specialities, courseObj.availableTimes, req.settings.id]);
      res.send({ "result": true })
      console.log("send message good")
    } catch (error) {
      console.log(error)
      res.send({ "err": error })
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



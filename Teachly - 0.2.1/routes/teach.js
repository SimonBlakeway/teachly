const express = require('express');
const router = express.Router()
const { contextSetup } = require(process.cwd() + '/utils.js');
const utils = require(process.cwd() + '/utils.js');
const db = require('../config/db');

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

// @desc    createCourse
// @route   POST /
router.post('/createCourse', async (req, res) => {
  try {
    // this function asumes the data is not clean
    courseData.courseImg = await ImagePrep(courseData.courseImg, "course-id=" + userInfo.id)
    courseData.description = compiledConvert(courseData.description)

    if (!courseData.courseImg) {
      res.json({ "err": "invalid image" })
    }
    if (!((isValidLanguage(courseData.taughtIn, fullName = false)) >= 0)) {
      return { "err": "invalid Language" }
    }
    if (!isInt(courseData.pricePerLesson) || ((courseData.pricePerLesson <= 0) || (courseData.pricePerLesson > 50))) {
      return { "err": "invalid pricePerLesson" }
    }
    if ((courseData.pricePerLesson < 0) || (courseData.pricePerLesson > 50)) {
      console.log(courseData.pricePerLesson > 0)
      console.log("Sf")
      return { "err": "invalid pricePerLesson" }
    }
    if (courseData.pricePerLesson > 50) {
      console.log("death")
      return { "err": "invalid pricePerLesson" }
    }
    if (!(isValidSubject(courseData.taughtIn, courseData.subject))) {
      return { "err": "invalid subject" }
    }
    if (typeof courseData.offersTrialLesson != "boolean") {
      return { "err": "invalid offersTrialLesson" }
    }
    if (!isValidSubjectSpeciality(courseData.taughtIn, courseData.subject, courseData.specialities)) {
      return { "err": "invalid specialities" }

    }
    if (!isValidAvailableTimes(courseData.availableTimes)) {
      return { "err": "invalid availableTimes" }
    }

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
      //result = await db.query('select "qualifications" FROM user_info WHERE id = $1', [userInfo.id]);
      console.log(result)

      try {
        //result = await db.query(`INSERT INTO "teacher_course ( "description", "createdAt", "taughtIn", "offersTrialLesson", "pricePerLesson", subject, specialities, "timeSchedule", "teacherId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [courseObj.description, courseObj.createdAt, courseObj.taughtIn, courseObj.offersTrialLesson, courseObj.pricePerLesson, courseObj.subject, courseObj.specialities, courseObj.availableTimes, userInfo.id]);



      } catch (error) {
        return false
      }



    } catch (error) {
      return false
    }
  } catch (error) {
    return false
  }
})




// @desc    course chat
// @route   GET /
router.get('/course/:courseId/chat', async (req, res) => { //[req.params.courseId]
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

// @desc    course chat
// @route   GET /
router.get('/course/:courseId/messages', async (req, res) => { //[req.params.courseId]
  try { // npm i socket.io 
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
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
// @route   POST /
router.get('/createCourse', async (req, res) => {
  try {

    res.render('createCourse', {
      layout: "main",
      context: contextSetup(req.settings, ["footer"], "createCourse"),
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





// @desc    view user profile
// @route   GET /user/id
router.get('/tests/subject/:subject', async (req, res) => {
  try {
    subject = req.params.subject
    if (utils.isValidSubject(req.settings.lang, subject)) {
      res.render('testSubject', {
        layout: "main",
        context: contextSetup(req.settings, ["footer"], "testSubject"),
      })

    }
    else {
      res.sendStatus(404)
    }
  } catch (err) {
    console.log(err)
    res.json({ "err": err })

  }
})

// @desc    test speciality
// @route   GET /user/id
router.get('/tests/speciality/:speciality', async (req, res) => {
  try {
    subject = req.params.subject
    if (utils.isValidSubjectSpeciality(subject)) {
      res.render('testSpeciality', {
        layout: "main",
        context: contextSetup(req.settings, ["footer"], "testSpeciality"),
      })

    }
  }
  catch (err) {
    console.log(err)
    serialize.json(err)
  }
})



// @desc    view user profile
// @route   GET /user/id
router.post('/tests/:subject', async (req, res) => {
  subjectObj = req.body
  subject = req.params.subject
  if (utils.isValidSubject(subject)) {

    try {
      result = await db.query(`SELECT "qualifications" FROM user_info WHERE id = $1`, [req.settings.id]);

      if (result.qualifications.subject) {

      }


    } catch (error) {
      console.log(error)
      res.json({ "err": "no idea what heppened here" })
    }





  }
})

// @desc    view user profile
// @route   GET /user/id
router.post('/tests/:speciality', async (req, res) => {
  specialityObj = req.body
  speciality = req.params.subject
  if (utils.isValidSubjectSpeciality(subject)) {

    try {
      result = await db.query(`SELECT "qualifications" FROM user_info WHERE id = $1`, [req.settings.id]);



    } catch (error) {
      console.log(error)
    }





  }
})





module.exports = router
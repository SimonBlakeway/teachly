const express = require('express')
const router = express.Router()
const { contextSetup } = require(process.cwd() + '/utils.js');
const utils = require(process.cwd() + '/utils.js');
const bodyParser = require('body-parser');
const db = require('../config/db');

// @desc    view user profile
// @route   GET /user/id
router.get('/', async (req, res) => {
  res.render('learnLandingPage', {
    layout: "main",
    context: contextSetup(req.settings, ["navbar", "footer"], "learnLandingPage"),
  })
})

// @desc    view user profile
// @route   GET /user/id
router.get('/:subject', async (req, res) => {
  try {
    if (utils.isValidSubject(req.settings.lang, req.params['subject'])) {
      res.render('learnSubject', {
        layout: "main",
        context: contextSetup(req.settings, ["footer", "navbar"], "learnSubject"),
      })
    }
    else {
      res.send("invalid subject")
    }
  } catch (error) {
    res.send("error")

  }
})

// @desc    access tutor courses
// @route   GET /
router.post('/searchTutorCourses', bodyParser.json({ limit: "2mb" }), async (req, res) => {
  reqObj = req.body
  lang = req.settings.lang

  pricePerLessonRange = reqObj.pricePerLessonRange ? (reqObj.pricePerLessonRange) : [1, 50];
  subject = reqObj.subject ? (reqObj.subject) : "english";
  specialityQueryString = utils.convertspecialityArrToQuery(lang, subject, reqObj.specialities)
  orderByQueryString = utils.convertOrderByToQuery(reqObj.orderBy)
  timeRangeQueryString = utils.convertTimeRangeToQuery(reqObj.days)
  amount = (reqObj.amount) ? (reqObj.amount) : 10;
  searchByKeywordQueryString = utils.convertSearchByKeywordToQuery(reqObj.searchByKeyword)
  pagePlace = Number(reqObj.pagePlace) ? Number(reqObj.pagePlace) * 10 : 0;
  if (((pricePerLessonRange[0] > 50) || (pricePerLessonRange[0] < 1))) { res.json({ "err": "invalid pricePerLessonRange" }) }
  if (((pricePerLessonRange[1] > 50) || (pricePerLessonRange[1] < 1))) { res.json({ "err": "invalid pricePerLessonRange" }) }
  if (!utils.isValidSubject(lang, subject)) { res.json({ "err": "invalid subject" }) }
  queryString = `
  SELECT * FROM "teacher_course"
  WHERE "taughtIn" = '${lang}'
  AND "subject" =  '${subject}' 
  AND "pricePerLesson" > ${pricePerLessonRange[0]}  
  AND "pricePerLesson" < ${pricePerLessonRange[1]}  
  `
  if (specialityQueryString) { queryString += "" + specialityQueryString }
  if (searchByKeywordQueryString) { queryString += searchByKeywordQueryString }
  if (timeRangeQueryString) { queryString += "  " + timeRangeQueryString }
  if (orderByQueryString) { queryString += orderByQueryString }
  queryString += `  LIMIT ${amount} OFFSET ${pagePlace};`
  try {
    result = await db.query(queryString);
    if (result.rows.length  != 0) {
      res.json({ "result": result.rows })
    }
    else {
      res.json({ "err": 404 })
    }
  } catch (error) {
    res.json({ "err": "server error" })
  }
})



module.exports = router
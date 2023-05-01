const express = require('express')
const router = express.Router()
const { contextSetup } = require(process.cwd() + '/utils.js');
const utils = require(process.cwd() + '/utils.js');
const bodyParser = require('body-parser');
const db = require('../config/db');

// @desc    learn landing page 
// @route   GET /user/id
router.get('/', async (req, res) => {
  res.render('learnLandingPage', {
    layout: "main",
    context: contextSetup(req.settings, ["navbar", "footer"], "learnLandingPage"),
  })
})

// @desc    learn page  
// @route   GET /subject or speciality
router.get('/:str', async (req, res) => {
  try {
    str = req.params['str'].replaceAll("-", " ");
    if (utils.isValidSubject(req.settings.lang, str)) {
      setting = req.settings
      setting.subject
      setting.speciality
      setting.subject = str
      setting.speciality = ""
      res.render('learn', {
        layout: "main",
        context: contextSetup(settings, ["footer", "navbar"], "learn"),
      })
    }
    else {
      posSub = utils.isValidSubjectSpecialityNoSubject(req.settings.lang, str)
      if (posSub) {
        setting = req.settings
        setting.subject 
        setting.speciality
        setting.subject = posSub
        setting.speciality = str
        res.render('learn', {
          layout: "main",
          context: contextSetup(settings, ["footer", "navbar"], "learn"),
        })
      }
      else {
        res.render('learnLandingPage', {
          layout: "main",
          context: contextSetup(req.settings, ["navbar", "footer"], "learnLandingPage"),
        })

      }
    }
  } catch (error) {
    console.log(error)
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
  searchByKeywordQueryString = utils.convertSearchByKeywordToQuery(reqObj.searchby)
  pagePlace = Number(reqObj.pagePlace) ? Number(reqObj.pagePlace) * 10 : 0;
  if (((pricePerLessonRange[0] > 50) || (pricePerLessonRange[0] < 1))) { res.json({ "err": "invalid pricePerLessonRange" }) }
  if (((pricePerLessonRange[1] > 50) || (pricePerLessonRange[1] < 1))) { res.json({ "err": "invalid pricePerLessonRange" }) }
  if (!utils.isValidSubject(lang, subject)) { res.json({ "err": "invalid subject" }) }
  queryString = `
  SELECT * FROM teacher_course
  WHERE taught_in = '${lang}'
  AND subject =  '${subject}' 
  AND price_per_lesson > ${pricePerLessonRange[0]}  
  AND price_per_lesson < ${pricePerLessonRange[1]}  
  `
  if (specialityQueryString) { queryString += "" + specialityQueryString }
  if (searchByKeywordQueryString) { queryString += searchByKeywordQueryString }
  if (timeRangeQueryString) { queryString += "  " + timeRangeQueryString }
  if (orderByQueryString) { queryString += orderByQueryString }
  queryString += `  LIMIT ${amount} OFFSET ${pagePlace};`
  try {
    //result = await db.query(queryString);
    console.log(queryString)
    //console.log(result)
    if (  false) { //result.rows.length  != 0) {
    //  res.json({ "result": result.rows })
    }
    else {
      res.json({ "err": 404 })
    }
  } catch (error) {
    console.log(error)
    res.json({ "err": "server error" })
  }
})



module.exports = router
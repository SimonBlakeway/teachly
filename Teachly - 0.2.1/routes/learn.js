const express = require('express')
const router = express.Router()
const { contextSetup } = require(process.cwd() + '/utils.js');
const utils = require(process.cwd() + '/utils.js');
const bodyParser = require('body-parser');
const db = require('../config/db');




function escapeStrArr(arr) {
  try {
    newArr = []
    for (i = 0; i < arr.length; i++) {
      newArr.push(utils.escapeStr(arr[i]))

    }
    return newArr
  } catch (error) {
    console.log(error)
    throw new Error("error, bad time_Schedule arr")
  }
}

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
      settings.title = str
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
  specialityQueryString = utils.convertspecialityArrToQuery(lang, subject, escapeStrArr(reqObj.specialities))
  orderByQueryString = utils.convertOrderByToQuery(reqObj.orderBy)
  timeRangeQueryString = utils.convertTimeRangeToQuery(reqObj.availableTimes)
  taughtInToQuery = utils.convertTaughtInToQuery(reqObj.taughtIn)
  searchByKeywordQueryString = utils.convertSearchByKeywordToQuery(reqObj.searchby)
  pagePlace = Number(reqObj.pagePlace) ? Number(reqObj.pagePlace) * 10 : 0;
  if (((pricePerLessonRange[0] > 50) || (pricePerLessonRange[0] < 1))) { res.json({ "err": "invalid pricePerLessonRange" }) }
  if (((pricePerLessonRange[1] > 50) || (pricePerLessonRange[1] < 1))) { res.json({ "err": "invalid pricePerLessonRange" }) }
  if (!utils.isValidSubject(lang, subject)) { res.json({ "err": "invalid subject" }) }

  queryString = `
  SELECT created_at FROM teacher_course
  WHERE subject =  '${subject}'
  AND price_per_lesson > ${pricePerLessonRange[0]}  
  AND price_per_lesson < ${pricePerLessonRange[1]}  
  ${specialityQueryString}
  ${searchByKeywordQueryString}
  ${timeRangeQueryString}
  ${taughtInToQuery}
  ${specialityQueryString}
  ${specialityQueryString}
  ${orderByQueryString}
  LIMIT ${10} OFFSET ${pagePlace - 1};
  `
  /*
   * maybe cache countResult on the server?
   * say if their is 1000s of requests for the courses,
   * there's gonna be overlap, right? and by storing the 
   * count on the server it could result in overall less db requests
   * since the result can just be handed to the user,
   */
  try {
    countQuery = `SELECT COUNT ( * )  FROM teacher_course \n  ` + "WHERE" + queryString.split("WHERE")[1].split("ORDER BY")[0]
    countResult = (reqObj.pageAmount == -1) ? db.query(countQuery) : reqObj.pageAmount
    courseResult = db.query(queryString);

    Promise.all([courseResult, countResult]).then((vals) => {
      console.log(Number(vals[1].rows[0].count))

      if (typeof vals[1] != "object") {
        res.json({ "courses": vals[0].rows, "countResult": reqObj.pageAmount })
      }
      else {
        res.json({ "courses": vals[0].rows, "countResult": Number(vals[1].rows[0].count) })
      }
    }).catch(err => {
      console.log(countQuery)
      console.log(err)
      res.json({ "err": "bad query" })
    })
  } catch (error) {
    console.log(error)
    res.json({ "err": "server error" })
  }
})



module.exports = router
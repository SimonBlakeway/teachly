const express = require('express')
const router = express.Router()
const { contextSetup } = require(process.cwd() + '/utils.js');
const utils = require(process.cwd() + '/utils.js');
const bodyParser = require('body-parser');
const db = require('../config/db');


async function clear() {
  str = `TRUNCATE teacher_course CASCADE`
  res = await db.query(str)
}



async function search() {


  str = `
  SELECT  created_at,
  course_id,
  description,
  teacher_id,
  course_lessons,
  specialities,
  subject,
  taught_in,
  teacher_name,
  rating,
  number_of_reviews,
  calender_times,
  price_per_minute
FROM teacher_course
WHERE subject =  'english'
  ORDER BY number_of_active_students ASC
LIMIT 10 OFFSET 0;`

  res = await db.query(str)

  console.log(res.rows[0])


}


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
// @route   GET /learn
router.get('/', async (req, res) => {
  res.render('learnLandingPage', {
    layout: "main",
    context: contextSetup(req.settings, ["navbar", "footer"], "learnLandingPage"),
  })
})

// @desc    learn page  
// @route   GET /learn/(subject or speciality)
router.get('/:str', async (req, res) => {
  try {
    str = req.params['str'].replaceAll("-", " ");
    if (utils.isValidSubject(req.settings.lang, str)) {
      settings.title = str
      settings = req.settings
      settings.subject = str
      res.render('learn', {
        layout: "main",
        context: contextSetup(settings, ["footer", "navbar"], "learn"),
      })
    }
    else {
      posSub = utils.isValidSubjectSpecialityNoSubject(req.settings.lang, str)
      if (posSub) {
        settings = req.settings
        settings.subject
        settings.speciality
        settings.subject = posSub
        settings.speciality = str
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
// @route   POST /learn/searchTutorCourses
router.post('/searchTutorCourses', bodyParser.json({ limit: "2mb" }), async (req, res) => {
  try {
    reqObj = req.body
    lang = req.settings.lang


    pricePerLessonRange = reqObj.pricePerLessonRange ? (reqObj.priceRange) : [0.05, 5];
    subject = reqObj.subject


    specialityQueryString = utils.convertspecialityArrToQuery(lang, subject, escapeStrArr(reqObj.specialities))
    orderByQueryString = utils.convertOrderByToQuery(reqObj.orderBy)
    timeRangeQueryString = utils.convertMinuteTimeRangeToQuery(reqObj.availableTimeRanges, reqObj.min, reqObj.man)
    taughtInToQuery = utils.convertTaughtInToQuery(reqObj.taughtIn)
    searchByKeywordQueryString = utils.convertSearchByKeywordToQuery(reqObj.searchby)
    pagePlace = Number(reqObj.pagePlace) ? Number(reqObj.pagePlace) * 10 : 0;
    if (((pricePerLessonRange[0] < 0.05) || (pricePerLessonRange[0] > 5))) throw new Error("invalid pricePerLessonRange")
    if (((pricePerLessonRange[1] > 5) || (pricePerLessonRange[1] < 0.05))) throw new Error("invalid pricePerLessonRange")
    if (!utils.isValidSubject(lang, subject)) throw new Error("invalid subject")


    /*
     * maybe cache countResult on the server?
     * say if their is 1000s of requests for the courses,
     * there's gonna be overlap, right? and by storing the 
     * count on the server it could result in overall less db requests
     * since the result can just be handed to the user,
     *
     */



    queryString = `
    SELECT 
      created_at,
      course_id,
      description,
      teacher_id,
      course_lessons,
      specialities,
      subject,
      taught_in,
      teacher_name,
      rating,
      number_of_reviews, 
      calender_times,
      price_per_minute
    FROM teacher_course
    WHERE subject =  '${subject}'
    AND price_per_minute > ${pricePerLessonRange[0]}  
    AND price_per_minute < ${pricePerLessonRange[1]}  
    ${specialityQueryString}
    ${searchByKeywordQueryString}
    ${timeRangeQueryString}
    ${taughtInToQuery}
    ${specialityQueryString}
    ${specialityQueryString}
    ${orderByQueryString}
    LIMIT ${10} OFFSET ${pagePlace};
    `;


    countQuery = `SELECT COUNT ( * )  FROM teacher_course \n  ` + "WHERE" + queryString.split("WHERE")[1].split("ORDER BY")[0]
    countResult = (reqObj.pageAmount == -1) ? db.query(countQuery) : reqObj.pageAmount
    courseResult = db.query(queryString);
    Promise.all([courseResult, countResult]).then((vals) => {
      if (typeof vals[1] != "object") {
        res.json({ "courses": vals[0].rows, "count": reqObj.pageAmount })
      }
      else {
        res.json({ "courses": vals[0].rows, "count": Number(vals[1].rows[0].count) })
      }
    })
  } catch (error) {
    console.log(err.message)
    res.json({ "err": err.message })
  }
})

// @desc    access tutor courses
// @route   GET /learn/book-lesson
router.get('/book-lesson', async (req, res) => {
  courseId = req.query.code


  res.render('createOrder', {
    layout: "main",
    context: contextSetup(req.settings, ["footer"], "createOrder"),
  })



})

// @desc    access tutor courses
// @route   post /learn/request-lesson
router.post('/request-lesson', async (req, res) => {

  try {
    teacherId = req.body.teacherId
    studentId = req.settings.id
    studentName = req.settings.name

    //checks that course and teacher id are linked and also makes sure potential student isn't banned by teacher
    result = await db.query(`
      SELECT t1.name 
      FROM user_info t1
      FULL OUTER  JOIN  teacher_course t2
        ON teacher_course.teacher_id = user_info.id
      WHERE t1.id = $1
      AND 'search text' = ANY(t1.banned_users)`,
      [teacherId, studentId]);

    if (result.rowCount != 1) {
      throw new Error("bad teacher/course linking or student is banned") //maybe split this into two parts so as to get a better error message?
    }

    //notify teacher,
    utils.sendAutomatedNotification(req.setting.lang, "request-lesson", { text: [studentName], link: [] }, teacherId)

    //add event to the db
    try {
      result = await db.query(`INSERT INTO event (type, created_at, meta, data ) VALUES ($1, $2, $3, $4)`,
        [user.name, user.email, user.profileImage, req.settings.lang]);
    } catch (error) {
      console.log(error)
    }


    res.sendStatus()
  } catch (error) {
    res.sendStatus(400)
  }
})

// @desc    access tutor courses
// @route   post /learn/create-chat
router.post('request-chat', async (req, res) => {

  try {
    courseId = req.body.courseId
    teacherId = req.body.courseId
    studentId = req.settings.id
    console.log(courseId, teacherId, studentId)
    return
    createdAt = Math.floor(Date.now() / 1000)
    result = await db.query(`
        SELECT user_info.banned_users
        FROM teacher_course t1 
        FULL OUTER  JOIN  user_info t2
          ON teacher_course.teacherId = user_info.id
        WHERE  teacher_course.courseId = $1;`, [courseId]);


    if (result.rowCount != 1) {
      //if there isn't any rows, throw
      throw new Error("no course/user")
    }
    if (result.rows[0].user_info == undefined) {
      //if the user doesn't exist, throw 
      throw new Error("no course/user")
    }
    if (result.rows[0].teacher_course == undefined) {
      //if the course doesn't exist, throw 
      throw new Error("no course/user")
    }
    if (result.rows[0].user_info.banned_users.inludes(studentId)) {
      //if the user is banned by the teacher, throw
      throw new Error("user is banned")
    }

    //all checks complete, creating chat
    db.query(`INSERT INTO chat (student_id, teacher_id, created_at, course_id) 
                    VALUES ($1, $2, $3, $4)`, [studentId, teacherId, createdAt, courseId]);

    return true
  } catch (error) {

  }

})


module.exports = router
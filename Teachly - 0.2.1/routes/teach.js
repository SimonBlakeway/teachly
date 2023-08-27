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
    if (typeof courseData.pricePerMinute != "number") throw new Error("price not number")
    if (courseData.pricePerMinute > 5) throw new Error("price too high")
    if (courseData.pricePerMinute < 0.05) throw new Error("price too low")

    //description check
    if (typeof courseData.description != "string") throw new Error("description not str")
    if (courseData.description.length > 6969) throw new Error("description len too high")
    if (courseData.description.length < 0) throw new Error("description len too low")

    //taughtIn check
    if (courseData.taughtIn.constructor !== Array) throw new Error("taughtIn not Array")
    if (courseData.taughtIn.length == 0) throw new Error("taughtIn len too low")

    //offersTrialLesson check
    if (typeof courseData.offersTrialLesson != "boolean") throw new Error("offersTrialLesson not bool")


    //calender_times check
    if (courseData.courseTimeRanges.constructor !== Array) throw new Error("calender_times not Array")



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
      price_per_minute: courseData.pricePerMinute,
      calender_times: utils.formatToPGRange(courseData.courseTimeRanges)
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
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, to_tsvector( $8 ), $9, $10, $11)`,
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
router.get('/view-course-request/:eventId', async (req, res) => {
  try {
    /*

    eventId = req.query.eventId
    queryInfo = (await db.query(`
  SELECT 
    t1.body, 
    t1.event_id,
    t2.user_id,
    t2.name,
    t2.description,
    t2.created_at
  FROM events t1
  JOIN 
    user_info t2
  ON 
    (t1.body ->> 'user_id')::int = t2.id
  WHERE t1.id = $1;
    `,
      [eventId])).rows[0]

    if (typeof queryInfo == "undefined") throw new Error("database issue")
*/

    res.render('viewCourseRequest', {
      layout: "main",
      context: contextSetup(req.settings, ["navbar", "footer"], "viewCourseRequest",)// queryInfo), //add new param, dbData or something
    })
  }
  catch (err) {
    res.send(err.message)
  }
})

// @desc    teach landing page
// @route   GET /
router.post('/handle-course-request', bodyParser.json({ limit: "2mb" }), async (req, res) => {
  try {
    if (req.body.accept == true) {
      eventId = req.body.eventId
      teacherId = req.settings.id
      teacherName = req.settings.name
      studentId = req.body.studentId
      courseId = req.body.courseId
      //remove old event
      await db.query(`
    DELETE 
      FROM events
    WHERE 
      type = "lesson requested" AND
      event_id = $1 AND
      (body ->> 'teacher_id')::int = $2 AND
      (body ->> 'course_id')::int = $3 AND
      (body ->> 'student_id')::int = $4
    `,
        [
          eventId,
          teacherId,
          courseId,
          studentId
        ])


      //add new event to the db
      newEventId = utils.genSafeRandomNum(1, 9999999999999)
      result = await db.query(`
      INSERT INTO event 
        type, 
        created_at, 
        data, 
        id  
      VALUES 
        ($1, $2, $3, $4)`,
        [
          "lesson acepted",
          Math.floor(Date.now() / 1000),
          {
            courseId: courseId,
            teacherId: teacherId,
            studentId: studentId,

          },
          newEventId
        ]);
      //notify student
      utils.sendAutomatedNotification("lesson-request-accepted", { text: [teacherName, subject], link: [newEventId] }, studentId)
    }
    else {
      await db.query(`
      DELETE 
        FROM events
      WHERE 
        type = "lesson requested" AND
        event_id = $1 AND
        (body ->> 'teacher_id')::int = $2 AND
        (body ->> 'course_id')::int = $3 AND
        (body ->> 'student_id')::int = $4
      `,
        [
          eventId,
          teacherId,
          courseId,
          studentId
        ])
      res.sendStatus(200)
    }
  }
  catch (err) {
    res.json({ "err": err })
  }
})

// @desc    course dashboard
// @route   GET /
router.get('/course/dashboard/courseId,', async (req, res) => {

  courseId = req.query.courseId
  queryInfo = (await db.query(`
  SELECT 
    t1.name, 
    t2.subject
  FROM user_info t1
  JOIN 
    teacher_course t2
    ON (t1.id =  t2.teacher_id AND t2.course_id = $2)
  WHERE t1.id = $1;
    `,
    [req.settings.id, courseId])).rows[0]

  if (result.length != 1) throw new Error("database issue")

  try {
    res.render('courseDashboard', {
      layout: "main",
      context: contextSetup(req.settings, ["footer"], "courseDashboard", queryInfo), //add new param, dbData or something
    })
  }
  catch (err) {
    res.json({ "err": err })
  }
})


module.exports = router



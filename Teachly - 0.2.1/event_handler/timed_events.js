const db = require('../config/db');
const utils = require('../utils')
const fs = require('fs');
const db = require('../config/db');
const email = require('./util-APIs/email')
const zoomApi = require('./util-APIs/zoom')
const paypalApi = require('./util-APIs/paypal')
const stripeAPI = require('./util-APIs/stripe')


/**
 * 
 *  timed event loose schema {
 *    event_type: "sf" | "dcs"
 *    start_time: timestamp,
 *    end_time: timestamp or null if auto end on activation
 *         
 * 
 *  }
 * 
 * 
 */


queryInfo = (await db.query(`
SELECT 
  t1.body, 
  t2.user_id,
  t2.name,
  description,
  created_at
FROM events t1
JOIN 
  user_info t2
  ON (t1.body ->> 'user_id')::int = t2.user_id
WHERE t1.id = $1;
  `,
  [eventId])).rows[0]


result = await db.query(`
  INSERT INTO event 
    ( type, created_at, data, id ) VALUES ($1, $2, $3, $4)`,
  [
    "lesson_booking",
    createdAt,
    {
      start: req.body.timeRange[0],
      finish: req.body.timeRange[1],

    },
    eventId
  ]);



//not currently useful
async function clearExpiredEventsFromDb() {

}

function setTimeoutByDate(fn, date) {
  return setTimeout(fn, (date * 1000) - Date.now());
}


async function activateEvent(event) {

  if (event.event_type = "notification") {
/*
* template = {  
*      start_time: int,
*      text_arr: arr,
*      link_arr: arr,
*      user_id: int,
*      lang: str | Null,
*      is_global: bool
*  }
*/
    if (event.is_global) {
      utils.sendAutomatedNotificationGlobal("lesson started:student", { text: [event.text_arr], link: [event.link_arr] }, studentId, student_info.lang)
    }
    else {
      utils.sendAutomatedNotification("lesson started:student", { text: [event.text_arr], link: [event.link_arr] }, event.user_id, event.lang)
    }

  }

  else if (event.event_type = "start lesson") {

/*
* template = {  
*      start_time: 1212,
*      start: req.body.timeRange[0],
*      finish: req.body.timeRange[1],
*      student_id: 1212,
*      teacher_id: 1212,
*      course_id: 1221,
*       subject: str,
*  }
*/
    duration = (event.finish_time - event.start_time)
    subject = event.subject

    teacher_info = (await db.query(`
    SELECT 
      name,
      lang 
    FROM 
      user_info 
    WHERE 
     id = $1
     `, [event.teacher_id])).rows[0]
    student_info = (await db.query(`
     SELECT 
       name,
       lang 
     FROM 
       user_info 
     WHERE 
      id = $1
      `, [event.student_id])).rows[0]

    teacher_name = teacher_info.name
    student_name = student_info.name

    zoomInfo = await zoomApi.createMeeting("Teachly Lesson", duration)

    password = zoomInfo.password
    link = zoomInfo.start_url

    utils.sendAutomatedNotification("lesson started:student", { text: [teacher_info.name, subject], link: [link] }, studentId, student_info.lang)
    utils.sendAutomatedNotification("lesson started:teacher", { text: [student_info.name, subject], link: [link] }, studentId, teacher_info.lang)
  }

  else if (event.event_type = "end lesson") {

  }
}

async function getSoonEventsFromDbThenActivate() {
  fiveMinFromNow = () => {
    return Date.now() + 1000 * 60 * 5
  }

  events = (await db.query(`
    SELECT 
      *
    FROM 
      events 
    WHERE 
      is_timed_event = true AND
      (t1.body ->> 'start_time')::int < $1
    `,
    [req.params.id, fiveMinFromNow()])).rows


  for (let index = 0; index < events.length; index++) {
    const event = events[index];
    setTimeoutByDate(() => { activateEvent(event.body) }, event.body.start_time)
  }
}






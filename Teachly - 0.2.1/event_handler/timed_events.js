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
  t1.data, 
  t2.user_id,
  t2.name,
  description,
  created_at
FROM events t1
JOIN 
  user_info t2
  ON (t1.data ->> 'user_id')::int = t2.user_id
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
    if (event.data.is_global) {
      utils.sendAutomatedNotificationGlobal(event.data.notification_type, { text: [event.data.text_arr], link: [event.data.link_arr] }, {})
    }
    else {
      utils.sendAutomatedNotification(event.data.notification_type, { text: [event.data.text_arr], link: [event.data.link_arr] }, event.data.user_id, {}, event.data.lang)
    }
  }
  else if (event.event_type = "start lesson") {

    duration = (event.data.finish_time - event.data.start_time)
    subject = event.data.subject

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

    utils.sendAutomatedNotification("lesson started:student", { text: [teacher_info.name, subject], link: [link] }, studentId, {}, student_info.lang)
    utils.sendAutomatedNotification("lesson started:teacher", { text: [student_info.name, subject], link: [link] }, studentId, {}, teacher_info.lang)
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
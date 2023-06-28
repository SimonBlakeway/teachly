const jwt = require("jwt-simple")
const axios = require('axios');
const baseZoomUrl = "https://api.zoom.us/v2"
email = process.env.ZOOM_EMAIL
var access_token = "";

async function setToken() {
    try {
        url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`
        result = await axios.post(url, {}, {
            auth: {
                username: process.env.ZOOM_CLIENT_ID,
                password: process.env.ZOOM_SECRET_KEY
            }
        })
        access_token =  result.data.access_token
    } catch (error) {
        console.log(error)
    }
}
async function setup() {
    setToken()

setInterval(async () => {
    //refresh access token every 50 min
    setToken(access_token)
}, 1000 * 60 * 50);

}



async function createMeeting(topic, duration) {
    //now
    start_time = new Date().toISOString().substring(0, 18) //format 2023-06-03T12:56:03
    try {
        const result = await axios.post("https://api.zoom.us/v2/users/" + email + "/meetings", {
            "topic": topic,
            "type": 2, //single session
            "start_time": start_time,
            "duration": duration, //in minutes 60 min one hour
            "timezone": "Greenland", //UTC+0
            "password": "1234567", //password to enter meeting
            "agenda": topic,
            "settings": {
                "host_video": true,
                "participant_video": false, //true
                "cn_meeting": false,
                "in_meeting": true,
                "join_before_host": false,
                "mute_upon_entry": false,
                "watermark": false,
                "use_pmi": false,
                "approval_type": 2,
                "audio": "both",
                "auto_recording": "local",
                "enforce_login": false,
                "registrants_email_notification": false,
                "waiting_room": true,
                "allow_multiple_devices": true
            }
        }, {
            headers: {
                'Authorization': 'Bearer ' + access_token,
                'User-Agent': 'Zoom-api-Jwt-Request', //pos remove
                'content-type': 'application/json'
            }
        });
        retObj = {
            id: result.data.id,
            uuid: result.data.uuid,
            start_url: result.data.start_url,
            duration: result.data.duration,
            password: result.data.password,
            start_time: result.data.start_time

        }
        return retObj
    } catch (error) {
        console.log(error);
    }
}
async function updateMeeting(meetingId) {
    try {
        const result = await axios.patch("https://api.zoom.us/v2/meetings/" + meetingId, {
            "topic": "UPDATE: Discussion about today's Demo",
            "type": 2,
            "start_time": "2021-03-18T17:00:00",
            "duration": 20,
            "timezone": "India",
            "password": "1234567",
            "agenda": "Discussion about how to update zoome meeting programatically",
            "settings": {
                "host_video": true,
                "participant_video": true,
                "cn_meeting": false,
                "in_meeting": true,
                "join_before_host": false,
                "mute_upon_entry": false,
                "watermark": false,
                "use_pmi": false,
                "approval_type": 2,
                "audio": "both",
                "auto_recording": "local",
                "enforce_login": false,
                "registrants_email_notification": false,
                "waiting_room": true,
                "allow_multiple_devices": true
            }
        }, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
            }
        });
        sendResponse.setSuccess(200, 'Success', result.data);
        return sendResponse.send(res);
    } catch (error) {
        console.log(error.message);
        next();
    }
}
async function deleteMeeting(meetingId) {
    url = baseZoomUrl + `/meetings/${meetingId}`
    try {
        const result = await axios.delete(url, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
            }
        });
        console.log(result)
    } catch (error) {
        console.log(error);
    }
}
async function getMeetingDetails(meetingId) {
    try {
        const result = await axios.get("https://api.zoom.us/v2/meetings/" + meetingId, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
            }
        });
        console.log(result)
    } catch (error) {
        console.log(error);
    }
}
async function getMeetingRecording(meetingId) {
    url = `${baseZoomUrl}/meetings/past_meetings/${meetingId}/recordings`
    meetingId = encodeURI(meetingId)
    try {
        const result = await axios.get(url, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
            }
        });
        console.log(result)
    } catch (error) {
        console.log(error);
    }
}
async function deleteMeetingRecordings(meetingId) {
    url = baseZoomUrl + `/meetings/${meetingId}/recordings`
    meetingId = encodeURI(meetingId)
    //meetingId is supposed to be meetingUUID
    try {
        const result = await axios.delete(url, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
            }
        });
        console.log(result)
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingDetails,
    getMeetingRecording,
    deleteMeetingRecordings,
    setup,
}

/*
  this file is dedicated to 4 main routes
    1: custom resister/login
    2: google resister/login
    3: facebook resister/login
    4: refresh JWT cookie
    5: changing cookie settings

    there's also one logout route that works for all routes

    for the custom route, the data imputed won't be clean, 
    so it has to be manually cleaned

*/
const jwt = require("jwt-simple");
const dotenv = require('dotenv')
dotenv.config({ path: './config/config.env' })
const google = require('../util-APIs/google-util')
const facebook = require('../util-APIs/facebook-util')
const email = require('../util-APIs/email-util')
const utils = require('../utils')
const db = require('../config/db');
const { get } = require('axios');
//196 197
response = db.query(`INSERT INTO chat ( created_at, teacher_id, student_id ) VALUES ($1, $2, $3)`, [ Math.floor(Date.now() / 1000), 196, 196 ]);

async function ree() {
  result = await db.query(`
                  SELECT 
                    user_info.email,
                    user_info.id,
                    user_info.name,
                    user_info.lang,
                    chat.chat_id
                  FROM user_info
                  LEFT JOIN chat ON (user_info.id = chat.teacher_id OR user_info.id = chat.student_id)
                  WHERE user_info.id = $1`,[196] );

 return result.rows  
}
ree().then(res => {
 // utils.genUserCookie(res).rows
})

async function skree() {
  result = await db.query(`SELECT * FROM chat`, );

console.log(result.rows)    
}


//ree()

//skree()


//db.query(`DELETE FROM user_info`);

//this group is for manual login/signin, 

exports.login = async function (req, res) {
  user = req.body
  if (req.settings.isUser == true) { res.redirect("/") }

  user.name = user.name.trim()





  try {
    result = await db.query(`
    SELECT 
      user_info.email, 
      user_info.name,
      user_info.lang,
      user_info.cur, 
      user_info.id, 
      user_info.pass_hash,
      chat.chat_id
    FROM user_info
    JOIN chat ON (user_info.id = chat.teacher_id OR user_info.id = chat.student_id)
    WHERE name = $1`, [user.name]);


    if (result.rowCount == 0) {
      res.json({ "err": "invalid name" })
      return
    }
    isSame = await utils.compareHash(user.password, result.rows[0].pass_hash.trim())
    if (isSame == false) {
      res.json({ "err": "invalid password" })
      return
    }
    try {
     // console.log("reeee")
      userToken = await utils.genUserRefreshToken(result.rows[0].id)

      userCookie = await utils.genUserCookie(result.rows)
      res.cookie('userCookie', userCookie, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      res.cookie('user_refresh_token', userToken, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      res.sendStatus(200)

    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    console.log(error)
  }
};
exports.register = async function (req, res) {
  try {
    user = req.body


    try {
      result = await db.query(`SELECT email, name FROM user_info WHERE email = $1 OR name=$2`, [user.email, user.name]);
      if (result.rowCount != 0) {
        if (result.rows[0].name.trim() == user.name.trim()) {
          res.json({ "err": "name taken" })
          return
        }
        if (result.rows[0].email.trim() == user.email.trim()) {
          res.json({ "err": "email taken" })
          return
        }
      }
      user = await utils.cleanUserData(user)
      randInt = utils.genSafeRandomNum(100000, 1000000)
      console.log(randInt, "randint")

      try {
        response = await db.query(`INSERT INTO user_info ("name", "email", "profile_img", "lang", "created_at", "pass_hash", "email_code", "cur", "login_type", "user_refresh_token" ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [user.name, user.email, user.profileImage, req.settings.lang, Math.floor(Date.now() / 1000), user.password, "00" + randInt, req.settings.cur, "custom", [{}]]);
        //email.sendSignUpEmail(user.email, randInt, req.settings.lang)  
        res.sendStatus(200)
      } catch (error) {
        console.log(error)
      }
    } catch (error) {
      console.log(error)
    }
  } catch (err) {
    console.log(err)
  }
};
exports.emailValidation = async function (req, res) {
  if (req.settings.id) {
    res.redirect("/") //is user already has an account
    return
  }
  if (!(req.query.email_code && req.query.email)) {
    res.redirect("/") //make sure the right values are there
    return
  }
  email_code = parseInt(req.query.email_code)
  userEmail = decodeURI(req.query.email)



  try {
    result = await db.query(`
    SELECT
      user_info.email, 
      user_info.name,
      user_info.lang,
      user_info.cur, 
      user_info.id, 
      user_info.pass_hash,
      chat.chat_id
    LEFT JOIN chat ON (user_info.id = chat.teacher_id OR user_info.id = chat.student_id)
    FROM user_info WHERE email = $1`, [userEmail]);
    if (result.rowCount == 0) {
      res.redirect("/") //if the user with email address doesn't exist, redirect, only applicable to mal requests
      return
    }
    if (result.rows[0].email_code.trim() == "true") {
      res.redirect("/") //if the email address already exists, redirect, only applicable to mal requests
      return
    }
    if (parseInt(result.rows[0].email_code) > 9999999) {

      res.redirect("/") //if the user has tried to log in 9 times redirect
      return
    }
    if (result.rows[0].email_code.substring(2, 7) != email_code.toString()) {
      email_code = "0" + (parseInt(result.rows[0].email_code[1] + 1)) + result.rows[0].email_code.substring(2, 7);

      db.query(`UPDATE user_info email SET "email_code" = $1, WHERE WHERE email = $2;`, [email_code, userEmail])
      res.json({ "err": "wrong email_code" })
      return
    }
    userToken = await utils.genUserRefreshToken(result.rows[0].id)
    userCookie = await utils.genUserCookie(result.rows)
    db.query(`UPDATE user_info SET email_code = $1 WHERE email = $2;`, ["true", userEmail])

    res.cookie('userCookie', userCookie, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
    res.cookie('user_refresh_token', userToken, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
    res.sendStatus(200)

  } catch (error) {
    console.log(error)
  }
}



//this is for google
exports.getUrlGauth = async function (req, res) {
  let url = await google.getConnectionUrl();
  res.redirect(url)
}
exports.getUserDetailsG = async function (req, res) {
  user_details = awaitgoogle.getUserDetails(req.query.code);
  function getBase64(url) {
    return axios
      .get(url, {
        responseType: 'arraybuffer'
      })
      .then(response => Buffer.from(response.data, 'binary').toString('base64'))
  }

  res.send(user_details)

}
exports.googleLogin = async function (req, res) {
  const user_id = await google.getUserID(req.body.code);
}

//this is for facebook
exports.getUrlFauth = async function (req, res) {
  let url = await facebook.getConnectionUrl();
  res.redirect(url)
}
exports.getUserDetailsF = async function (req, res) {
  user_details = await facebook.getUserDetails(req.query.code)
  res.send(user_details)
}
exports.facebookLogin = async function (req, res) {
  const user_id = await facebook.getUserID(req.body.code);
}



exports.logout = async function (req, res) {

  try {
    let result = await db.query('select "user_refresh_token" FROM user_info WHERE id = $1', [req.settings.id]);


    newRefreshTokens = result.rows[0].user_refresh_token
    newRefreshTokens[req.settings.accountNumber] = {}
    db.query(`UPDATE user_info SET "user_refresh_token" = $1 WHERE id = $2`, [newRefreshTokens, req.settings.id]);

    res.clearCookie('userCookie');
    res.clearCookie('user_refresh_token');
    res.redirect("/")
  } catch (error) {
    console.log(error)
  }

};
exports.settings = function (req, res) {

  /**
   * this route is for relatively unimportant changes, like languge, name,
   *  font-size, profile image etc... 
   * 
   * no security changes
   */

  validSettings = ["lang", "cur"]

  try {
    change = req.body
    console.log(req.settings)

    if ((req.cookies.userCookie)) {
      if (validSettings.includes(change.settingName) && (Object.keys(change).length != 0)) {
        if (req.cookies.req.user_refresh_token) {
   
          userToken = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)
          userToken[`${change.settingName}`] = change.change
          user_refresh_token = jwt.decode(req.cookies.user_refresh_token, process.env.JWT_SECRET)

          db.query(`UPDATE user_info SET ${change.settingName} = $1 WHERE id = $2;`, [change.change, req.settings.id])
          res.cookie('userCookie', userToken, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
          res.cookie('user_refresh_token', user_refresh_token, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
        }
        else {
          userToken = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)

          userToken[`${change.settingName}`] = change.change
          settings = jwt.encode(userToken, process.env.JWT_SECRET)
          console.log(userToken)


          res.cookie('userCookie', settings, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
        }
      }
      else {
        res.sendStatus(400)
        return
      }

    }

    else {
      settings = {
        lang: req.settings.lang,
        cur: req.settings.cur
      }
      settings = jwt.encode(settings, process.env.JWT_SECRET)
      res.cookie('userCookie', settings, { sameSite: true, httpOnly: true, secure: utils.isTrue(process.env.SECURE), expires: new Date(Date.now() + (30 * 24 * 3600000)) })
    }



    res.sendStatus(200)

  } catch (error) {
    console.log(error)
    res.sendStatus(500)
    return
  }
}
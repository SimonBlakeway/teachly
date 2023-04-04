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



//this group is for manual login/signin, 
exports.login = async function (req, res) {
  user = req.body
  if (req.settings.isUser == true) { res.redirect("/") }

  //user.password = await utils.hashString(user.password)
  user.name = user.name.trim()


  try {
    result = await db.query(`SELECT email, name, lang, cur, id, "passHash", "userRefreshToken" FROM user_info WHERE name = $1`, [user.name]);
    if (result.rowCount == 0) {
      res.json({ "err": "invalid name" })
      return
    }
    console.log(result.rows[0].passHash.trim())
    if (result.rows[0].passHash.trim() != user.password) {
      res.json({ "err": "invalid password" })
      return
    }
    try {
      userToken = await utils.genUserRefreshToken(result.rows[0].id)
      userCookie = await utils.genUserCookie(result.rows[0])

      res.cookie('userCookie', userCookie, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      res.cookie('userRefreshToken', userToken, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      res.sendStatus(200)

    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    console.log(error)
  }



  db.query(`SELECT email, name, lang, cur, id, "passHash" FROM user_info WHERE name = $1`, [user.name], async (err, result) => {
    if (result.rowCount == 0) {
      res.json({ "err": "invalid name" })
      return
    }
    if (result.rows[0].passHash.trim() != user.password) {
      res.json({ "err": "invalid password" })
      return
    }


    db.query(`SELECT * FROM user_refresh_token WHERE id = $1`, [result.rows[0].id], (err, tokenResult) => {
      userToken = utils.genUserRefreshToken(result.rows[0].id)
      userCookie = utils.genUserCookie(result.rows[0])

      res.cookie('userCookie', userCookie, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      res.cookie('userRefreshToken', userToken, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      res.sendStatus(200)
      return

    })
  })




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
      console.log(randInt)

      try {
        response = await db.query(`INSERT INTO user_info ("name", "email", "profileImg", "lang", "createdAt", "passHash", "emailCode", "cur", "loginType", "userRefreshToken", "qualifications") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [user.name, user.email, user.profileImage, req.settings.lang, Math.floor(Date.now() / 1000), user.password, "00" + randInt, req.settings.cur, "custom", [{}], [{}]]);
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
  if (!(req.query.emailCode && req.query.email)) {
    res.redirect("/") //make sure the right values are there
    return
  }
  emailCode = parseInt(req.query.emailCode)
  userEmail = decodeURI(req.query.email)



  try {
    result = await db.query(`SELECT email, "emailCode", name, lang, cur, id FROM user_info WHERE email = $1`, [userEmail]);
    if (result.rowCount == 0) {
      res.redirect("/") //if the user with email address doesn't exist, redirect, only applicable to mal requests
      return
    }
    if (result.rows[0].emailCode.trim() == "true") {
      res.redirect("/") //if the email address already exists, redirect, only applicable to mal requests
      return
    }
    if (parseInt(result.rows[0].emailCode) > 9999999) {

      res.redirect("/") //if the user has tried to log in 9 times redirect
      return
    }
    if (result.rows[0].emailCode.substring(2, 7) != emailCode.toString()) {
      emailCode = "0" + (parseInt(result.rows[0].emailCode[1] + 1)) + result.rows[0].emailCode.substring(2, 7);

      db.query(`UPDATE user_info email SET "emailCode" = $1, WHERE WHERE email = $2;`, [emailCode, userEmail])
      res.json({ "err": "wrong emailCode" })
      return
    }
    userToken = await utils.genUserRefreshToken(result.rows[0].id)
    userCookie = await utils.genUserCookie(result.rows[0])
    db.query(`UPDATE user_info SET "emailCode" = $1 WHERE email = $2;`, ["true", userEmail])

    res.cookie('userCookie', userCookie, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
    res.cookie('userRefreshToken', userToken, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
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



exports.logout = function (req, res) {

  /**
   * when the user logs out we need to delete the refresh token, 
   * so after the user logsout a hacker can't use the cookie to get user access 
   * 
   * as well as just keeping the db clean
   */
  try {
    db.query(`UPDATE user_info SET "userRefreshToken" [$1] =  $2 WHERE id = $1`, [req.settings.accountNumber, req.settings.id]);
    res.clearCookie('userCookie');
    res.clearCookie('userRefreshToken');
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
        if (req.cookies.userRefreshToken) {

          userToken = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)
          userRefreshToken = jwt.decode(req.cookies.userRefreshToken, process.env.JWT_SECRET)


          res.cookie('userCookie', userToken, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
          res.cookie('userRefreshToken', userRefreshToken, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
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
      res.cookie('userCookie', settings, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
    }



    res.sendStatus(200)

  } catch (error) {
    console.log(error)
    res.sendStatus(500)
    return
  }
}
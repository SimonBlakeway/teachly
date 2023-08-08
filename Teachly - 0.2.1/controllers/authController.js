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
const google = require('../util-APIs/google.js')
const facebook = require('../util-APIs/facebook')
const email = require('../util-APIs/email')
const utils = require('../utils')
const db = require('../config/db');
const { get } = require('axios');


//this group is for manual login/signin, 

exports.login = async function (req, res) {
  user = req.body
  if (req.settings.isUser == true) { res.redirect("/") }
  user.name = utils.compiledConvert(user.name.trim())
  try {
    result = await db.query(`
    SELECT 
      user_info.email, 
      user_info.name,
      user_info.lang,
      user_info.cur, 
      user_info.id, 
      user_info.pass_hash,
      user_info.email_code
    FROM user_info
    WHERE user_info.name = $1`, [user.name]);
    if (result.rowCount == 0) {
      throw new Error("invalid name")
    }
    isSame = await utils.compareHash(user.password, result.rows[0].pass_hash.trim())
    if (isSame == false) {
      throw new Error("invalid password")
    }

    if (result.rows[0].email_code.trim() != "true") {
      throw new Error("invalid email")
    }
    try {
      userToken = await utils.genUserRefreshToken(result.rows[0].id)
      userCookie = await utils.genUserCookie(result.rows)
      res.cookie('userCookie', userCookie, { sameSite: true, httpOnly: true, secure: process.env.SECURE, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      res.cookie('user_refresh_token', userToken, { sameSite: true, httpOnly: true, secure: process.env.SECURE, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      res.sendStatus(200)

    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    res.send(error.message)
    console.log(error)
  }
};
exports.register = async function (req, res) {
  try {

    user = req.body



    result = await db.query(`SELECT email, name FROM user_info WHERE email = $1 OR name=$2`, [user.email, user.name]);
    if (result.rowCount != 0) {
      if (result.rows[0].name == user.name.trim()) {
        throw new Error("name taken")
      }
      if (result.rows[0].email == user.email.trim()) {
        throw new Error("email taken")
      }
    }
    user = await utils.cleanUserData(req.body)

    randInt = utils.genSafeRandomNum(100000, 1000000)
    console.log(randInt, "randint")

    response = await db.query(`INSERT INTO user_info ("name", "email", "profile_img", "lang", "created_at", "pass_hash", "email_code", "cur", "login_type", "user_refresh_token" ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [user.name, user.email, user.profileImage, req.settings.lang, Math.floor(Date.now() / 1000), user.password, "00" + randInt, req.settings.cur, "custom", [{}]]);
    //email.sendSignUpEmail(user.email, randInt, req.settings.lang)  
    res.sendStatus(200)
  } catch (err) {
    res.send({err: err.message})
    console.log(err)
  }
};
exports.emailValidation = async function (req, res) {
  try {
    if (req.settings.id) throw new Error("user already has an account active")

    if (!(req.query.emailCode && req.query.email)) throw new Error("missing values")
    email_code = parseInt(req.query.emailCode)
    userEmail = decodeURI(req.query.email)

    if ((isNaN(email_code)) || userEmail == "") throw new Error("invalid values")



    try {
      result = await db.query(`
      SELECT email, name, lang, cur, id, pass_hash, email_code
      FROM user_info WHERE email = $1`, [userEmail]);

      if (result.rowCount == 0) {
        throw new Error("validation result is empty")
      }
      if (result.rows[0].email_code.trim() == "true") {
        throw new Error("validation email_code is true")
      }
      if (parseInt(result.rows[0].email_code) > 9999999) {
        throw new Error("validation email_code has been tried 9 times")
      }
      if (result.rows[0].email_code.substring(2, 7) != email_code.toString()) {
        console.log(result.rows[0].email_code.substring(2, 7), "db email code")
        console.log(email_code.toString(), "client email code")
        throw new Error("wrong email_code")
      }
      userToken = await utils.genUserRefreshToken(result.rows[0].id)
      userCookie = await utils.genUserCookie(result.rows)
      db.query(`UPDATE user_info SET email_code = $1 WHERE email = $2;`, ["true", userEmail])

      res.cookie('userCookie', userCookie, { sameSite: true, httpOnly: true, secure: process.env.SECURE, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      res.cookie('user_refresh_token', userToken, { sameSite: true, httpOnly: true, secure: process.env.SECURE, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      console.log("all good")
      res.sendStatus(200)

    } catch (error) {
      console.log(error.message)

      if (error.message == "validation result is empty") { }
      else if (error.message == 'validation email_code is true') { }
      else if (error.message == 'validation email_code has been tried 9 times') { }
      else if (error.message == 'wrong email_code') {
        email_code = ((parseInt(result.rows[0].email_code[1] + 1)) + result.rows[0].email_code.substring(2, 7)).padStart(8, "0")
        db.query(`UPDATE user_info email SET email_code = $1 WHERE WHERE email = $2;`, [email_code, userEmail])
        res.json({ "err": "wrong email_code" })
      }
      else { res.sendStatus(200) }
    }
  } catch (error) {
    console.log(error.message)
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
    accountNumber = req.settings.accountNumber
    db.query(`UPDATE user_info SET user_refresh_token [${accountNumber}] = $1 WHERE id = $2;`, [{}, req.settings.id]);
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

  settings = {}
  encodedUserCookie = false
  encodedUserToken = false


  try {
    change = req.body

    if (encodedUserCookie) {
      if (validSettings.includes(change.settingName) && (Object.keys(change).length != 0)) {
        if (encodedUserToken) {

          userToken = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)
          userToken[`${change.settingName}`] = change.change
          user_refresh_token = jwt.decode(req.cookies.user_refresh_token, process.env.JWT_SECRET)

          db.query(`UPDATE user_info SET ${change.settingName} = $1 WHERE id = $2;`, [change.change, req.settings.id])
          res.cookie('userCookie', userToken, { sameSite: true, httpOnly: true, secure: process.env.SECURE, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
          res.cookie('user_refresh_token', user_refresh_token, { sameSite: true, httpOnly: true, secure: process.env.SECURE, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
        }
        else {
          userToken = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)

          userToken[`${change.settingName}`] = change.change
          settings = jwt.encode(userToken, process.env.JWT_SECRET)


          res.cookie('userCookie', settings, { sameSite: true, httpOnly: true, secure: process.env.SECURE, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
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

exports.refreshToken = async function (req, res) {
  if (req.settings.isUser == false) { res.sendStatus(404); return; } //if not user return

  try {
    accountNumber = req.settings.accountNumber
    id = req.settings.id
    client_refresh_string = req.settings.user_refresh_string
    client_token_create_at = req.settings.token_created_at


    client_token = {
      accountNumber: accountNumber,
      refresh_string: client_refresh_string,
      created_at: client_token_create_at
    }

    let result = await db.query(`select user_refresh_token [ ${accountNumber} ] FROM user_info WHERE id = $1`, [id]);

    if (result.rowCount == 0) {
      throw new Error('no token found');
    }
    db_token = result.rows[0].user_refresh_token

    if ((Math.floor(Date.now() / 1000) - db_token.created_at) < 30) {
      console.log((Math.floor(Date.now() / 1000) - db_token.created_at))
      //last refresh was less than 5 minutes ago 
      throw new Error('last update was less than 30 secs ago');
    }
    if (db_token.created_at != client_token.created_at) {
      console.log(db_token, "db_token")
      console.log(client_token, "client_token")
      throw new Error('client/db created_at are not the same');

    }
    if (db_token.user_refresh_string != client_token.refresh_string) {
      throw new Error('client/db user_refresh_string are not the same');
    }
    if (db_token.accountNumber != client_token.accountNumber) {
      throw new Error('client/db accountNumbers are not the same');
    }


    //create new token pair
    user_refresh_string = utils.genSafeRandomStr(20);
    date = Math.floor(Date.now() / 1000);

    updated_client_token = {
      user_refresh_string: user_refresh_string,
      id: id,
      accountNumber: accountNumber,
      created_at: date
    };

    updated_db_token = {
      user_refresh_string: user_refresh_string,
      accountNumber: accountNumber,
      created_at: date
    };

    allowedInterval = date - 60 * 5 //this limits the amount of updates to once every 5 min ago


    //won't update if last update was less than
    update_result = await db.query(`UPDATE user_info SET user_refresh_token [ ${accountNumber} ] = $1 WHERE
     id = $2
     AND   CAST ( user_refresh_token [ ${accountNumber} ] ->> 'created_at' AS INTEGER) < $3
     returning user_refresh_token [ ${accountNumber} ]
     `, [updated_db_token, id, allowedInterval]);





    if (update_result.rowCount == 1) { //successful update
      encoded_client_token = jwt.encode(updated_client_token, process.env.JWT_SECRET)
      res.cookie('user_refresh_token', encoded_client_token, { sameSite: true, httpOnly: true, secure: process.env.SECURE, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      res.sendStatus(200)
    }
    else {
      //if the update was unsuccesful due to the time limitation then
      // this is probably a concurrent refresh from the same user
      // so just ignore it
      res.sendStatus(200) //304 is treated as an error
    }

  } catch (error) {
    accountNumber = req.settings.accountNumber
    id = req.settings.id

    logout = () => {
      db.query(`UPDATE user_info SET user_refresh_token [ ${accountNumber} ] = $1 WHERE id = $2`, [{}, id]);
      res.clearCookie('user_refresh_token');
      res.clearCookie('userCookie');
      res.sendStatus(404)
    }

    if (error.message == "client/db created_at are not the same but time is less the 30 secs") { res.sendStatus(200) }
    else if (error.message == 'client/db created_at are not the same') logout()
    else if (error.message == 'client/db user_refresh_string are not the same') logout()
    else if (error.message == 'client/db accountNumbers are not the same') logout()
    else if (error.message == 'last update was less than 30 secs ago') { res.sendStatus(200) }
    else if (error.message == 'no token found') logout()
    else { res.sendStatus(200) }

  }
}
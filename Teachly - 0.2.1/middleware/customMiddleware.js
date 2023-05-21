const db = require('../config/db');
const utils = require('../utils');
const jwt = require("jwt-simple")


function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

function cookieSettings(req, res, next) {

  settings = {}

  if (req.cookies.userCookie) {
    if (req.cookies.user_refresh_token) {
      try {
        userToken = jwt.decode(req.cookies.user_refresh_token, process.env.JWT_SECRET)
        userCookie = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)

        if (typeof userToken.user_refresh_string == "undefined") {
          throw new Error("undefined cookie refresh token")
        }
        if (typeof userToken.created_at == "undefined") {
          throw new Error("undefined cookie created_at")
        }
        if (userToken.id != userCookie.id) {
          throw new Error("user token and cookie have different ids")
        }
        settings = userCookie
        settings.hasCookie = true
        settings.isUser = true
        settings.accountNumber = userToken.accountNumber
        settings.user_refresh_string = userToken.user_refresh_string
        settings.token_created_at = userToken.created_at

        req.settings = settings
        return next()
      }
      catch (err) {
        try {
          if (userToken) {
            db.query(`UPDATE user_info SET user_refresh_token [ ${userToken.accountNumber} ] = $1 WHERE id = $2;`, [{}, id]);
          }
        } catch (error) {

        }
        res.clearCookie('userCookie');
        res.clearCookie('user_refresh_token');
        res.redirect("/")
      }
    }
    try {
      userCookie = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)
      settings = userCookie
      settings.hasCookie = true
      settings.isUser = false

      req.settings = settings
      return next()
    }
    catch (err) {
      console.log(err)
      console.log("sgewhgbwehqeihghbhifbqihegbqhbg")
      malUserCookie = parseJwt(req.cookies.userCookie)
      res.clearCookie('userCookie');
      db.query('DELETE FROM user_refresh_token WHERE id = $1', [malUserCookie.id], (err, result) => {
        if (err) {
          console.log(err)
        }
      })
      res.redirect("/")
    }
  }
  else {
    lang = req.headers["accept-language"].split(",")[0]
    cur = utils.getCurrencyFromLanguageCode(lang)
    lang = lang.substring(0, 2)
    req.settings = {
      lang: lang,
      cur: cur,
      hasCookie: false,
      isUser: false
    }
  }
  return next()
}

async function refreshToken(req, res, next) {
  try {
    if (req.settings.isUser) {
      if ((Math.floor(Date.now() / 1000) - req.settings.token_created_at) >= 30) { //15 min 900
        try {
          userToken = await utils.refreshUserToken(req.settings.id, req.settings.user_refresh_string, req.settings.accountNumber, req.settings.token_created_at)
          res.cookie('user_refresh_token', userToken, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
          return next()
        } catch (error) {
          console.log("sfnwjvnjvnjwnvjvnjwnvjwnvjwvnwjvn")
          res.clearCookie('userCookie');
          res.clearCookie('user_refresh_token');
          res.redirect("/")
        }
      }
      else {
        return next()
      }
    }
    else {
      return next()
    }
  } catch (error) {
    return next()
  }
}

function redirectUnmatched(req, res) {
  res.redirect("/");
}


module.exports = {
  cookieSettings,
  refreshToken,
  redirectUnmatched
}




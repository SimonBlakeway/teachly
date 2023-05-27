const db = require('../config/db');
const utils = require('../utils');
const jwt = require("jwt-simple")


function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

function cookieSettings(req, res, next) {

  try {
    settings = {}

    if (req.cookies.userCookie) {
      if (req.cookies.user_refresh_token) {
        userToken = jwt.decode(req.cookies.user_refresh_token, process.env.JWT_SECRET)
        userCookie = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)

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
      else {
        userCookie = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)
        settings = userCookie
        settings.hasCookie = true
        settings.isUser = false
        req.settings = settings
        return next()
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
      return next()
    }

  } catch (error) {
    try {
      malUserCookie = parseJwt(req.cookies.userCookie)
      res.clearCookie('userCookie');
    } catch (error) {
    }
    try {
      malUserToken = parseJwt(req.cookies.user_refresh_token)
      res.clearCookie('user_refresh_token');
      db.query(`UPDATE user_info SET user_refresh_token [ ${malUserToken.accountNumber} ] = $1 WHERE id = $2;`, [{}, malUserToken.userId]);

    } catch (error) {
    }
  }
}

async function refreshToken(req, res, next) {
  try {
    if (req.settings.isUser) {
      if ((Math.floor(Date.now() / 1000) - req.settings.token_created_at) >= 900) { //15 min 900
        userToken = await utils.refreshUserToken(req.settings.id, req.settings.user_refresh_string, req.settings.accountNumber, req.settings.token_created_at)
        res.cookie('user_refresh_token', userToken, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
        return next()
      }
      else {
        return next()
      }
    }
    else {
      return next()
    }
  } catch (error) {
    if (error.message == 'client/db created_at are not the same but time is less the 30 secs') {
      console.log("success!!!!!!!")
      return next()
    }
    else {
      console.log("bad!!!!!!!!")
      await db.query(`UPDATE user_info SET user_refresh_token [ ${req.settings.accountNumber} ] = $1 WHERE id = $2;`, [{}, req.settings.id]);
      res.clearCookie('userCookie');
      res.clearCookie('user_refresh_token');
      res.redirect("/")
      return next()
    }
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
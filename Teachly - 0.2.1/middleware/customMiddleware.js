const db = require('../config/db');
const utils = require('../utils');
const jwt = require("jwt-simple")


function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

async function cookieSettings(req, res, next) {

  settings = {}
  encodedUserCookie = req.cookies.userCookie
  encodedUserToken = req.cookies.user_refresh_token

  try {

    if (encodedUserCookie) {
      if (encodedUserToken) {
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
        settings.cspNonce = res.locals.cspNonce

        req.settings = settings
        return next()
      }
      else {
        userCookie = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)
        settings = userCookie
        settings.hasCookie = true
        settings.isUser = false
        settings.cspNonce = res.locals.cspNonce
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
        isUser: false,
        cspNonce: res.locals.cspNonce
      }
      return next()
    }

  } catch (error) {
    try {
      res.clearCookie('userCookie');
      console.log("user kookie remoed")
    } catch (error) {
      console.log(err)
    }
    try {
      malUserToken = req.cookies.user_refresh_token
      res.clearCookie('user_refresh_token');
      parseJwt(req.cookies.user_refresh_token)
      try {
        await db.query(`UPDATE user_info SET user_refresh_token [ ${malUserToken.accountNumber} ] = $1 WHERE id = $2;`, [{}, malUserToken.userId]);

      } catch (error) {

      }
    } catch (error) {
      console.log(err)
    }
    res.sendStatus(400)
  }
}

async function mustHaveValidToken(req, res, next) {
  return next()
}

function redirectUnmatched(req, res) {
  res.redirect("/");
}

module.exports = {
  cookieSettings,
  mustHaveValidToken,
  redirectUnmatched
}
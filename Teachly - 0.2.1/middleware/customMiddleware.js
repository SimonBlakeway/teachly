const jwt = require("jwt-simple");
const db = require('../config/db');
const utils = require('../utils');

function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

function cookieSettings(req, res, next) {

  settings = {}

  if (req.cookies.userCookie) {
    if (req.cookies.userRefreshToken) {
      try {
        userToken = jwt.decode(req.cookies.userRefreshToken, process.env.JWT_SECRET)
        userCookie = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)
        if (userToken.id != userCookie.id) {
          console.log("the ids aren't the same, logging out")
          res.clearCookie('userCookie');
          res.clearCookie('userRefreshToken');
          res.redirect("/")
        }
        settings = userCookie
        settings.hasCookie = true
        settings.isUser = true
        settings.accountNumber = userToken.accountNumber
        settings.refreshString = userToken.userRefreshToken
        settings.tokenCreatedAt = userToken.createdAt

        req.settings = settings
        return next()
      }
      catch (err) {
        res.clearCookie('userCookie');
        res.clearCookie('userRefreshToken');
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
  if (req.settings.isUser) {
    if ((Math.floor(Date.now() / 1000) - req.settings.tokenCreatedAt) >= 900) { //15 min 900
      userToken = await utils.refreshUserToken(req.settings.id, req.settings.refreshString, req.settings.accountNumber, req.settings.tokenCreatedAt)
      if (userToken == false) {
        console.log("sfnwjvnjvnjwnvjvnjwnvjwnvjwvnwjvn")
        res.clearCookie('userCookie');
        res.clearCookie('userRefreshToken');
        res.redirect("/")
      }
      else {
      res.cookie('userRefreshToken', userToken, { sameSite: true, httpOnly: true, secure: true, expires: new Date(Date.now() + (30 * 24 * 3600000)) })
      return next()
      }
    }
    else {
      return next()
    }
  }
  else {
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




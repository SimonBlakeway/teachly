const jwt = require("jwt-simple");
dotenv = require('dotenv')

// Load config
dotenv.config({ path: './config/config.env' })

module.exports = {
  authenticate: function (req, res, next) {  //is user is authorized for content
    try {
      var decoded = jwt.decode(req.cookies.token, process.env.JWT_SECRET);
      if (true) { //is user is authorized for content
        return next()
      }
    }
    catch {
      res.redirect('/login')
    }
    return next()
  },
  ensureGuest: function (req, res, next) { //make sure user is guest
    try {
      if (req.setting.isUser == false) {
        res.redirect('/');
      }
      else {
        return next();
      }
    }
    catch {
    }

  },
  ensureUser: function (req, res, next) { //make sure user is user
    try {
      if (req.settings.isUser == false) {
        res.redirect('/');
      }
      else {
        return next()
      }
    } catch (error) {
      console.log(error)
    }
  },
}
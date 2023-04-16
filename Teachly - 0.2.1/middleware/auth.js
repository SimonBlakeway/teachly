const jwt = require("jwt-simple");
dotenv = require('dotenv')
/*
  I need to protect my webiste from CSRF,
  https://kerkour.com/csrf is an excellent 
  article, is should add enough potection
*/

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
      var decoded = jwt.decode(req.cookies.token, process.env.JWT_SECRET);
      res.redirect('/dashboard');
      return next();
    }
    catch {
      var decoded = jwt.decode(req.cookies.token, process.env.JWT_SECRET);
      res.redirect('/dashboard');
      return next();
    }

  },
  ensureUser: function (req, res, next) { //make sure user is user
    if (req.settings.isUser == false) {
      res.redirect('/dashboard');
      return next();
    }
    return next();
  },
  ensureSafe: function (req, res, next) {
    try {
      if (req.hostname != process.env.DOMAIN) { //if the request comes from a different domain it might be CSRF
        res.send("403 Forbidden")
      }
      else {
        return next();
      }
    }
    catch {
      res.send("400 Bad Request")
    }

  }, // I might need more auth functions
}
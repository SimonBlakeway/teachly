//all the main imports 
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//cors = require('cors'); // useful, but a security risk
const db = require('./config/db');
const customTimers = require('./customTimers');

//setting up procces.env
dotenv.config(dotenv.config({ path: './config/config.env' }));


//setting up the timers
customTimers.timerSetup()

// Body parser
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }))
//app.use(bodyParser.json({ limit: "10mb" }))


app.use(cookieParser());

// middleware
app.use(require('./middleware/customMiddleware.js').cookieSettings)
app.use(require('./middleware/customMiddleware.js').refreshToken)

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Handlebars Helpers
const {
  formatDate,
  linkSetup,
  currency,
} = require('./helpers/hbs');

// Handlebars
app.engine('.hbs', exphbs.engine({
  helpers: { //the list of helpers I want to be able to use in .hbs files
    formatDate,
    linkSetup,
    currency,
  },
  defaultLayout: 'main',
  extname: '.hbs', // this is where you can change the extension name
}));
app.set('view engine', '.hbs');
app.set('views', './views/webpage-templates/hbs-templates');


// Set global var, might be useless
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

// Static folders
//app.use(express.static(path.join(__dirname, 'public'), {
//  maxAge: 300
//}))


app.use('/', express.static(path.join(__dirname, 'public'), {
  setHeaders: function (res, path) {
    res.set("Cache-Control", "private, max-age=3000");
  }
}));




// general Routes
app.use('/', require('./routes/index'))

// learning Routes
app.use('/learn', require('./routes/learn'))

// teaching routes
app.use('/teach', require('./routes/teach'))

// resource/public routes
app.use('/get', require('./routes/get'))

//auth routes
app.use('/auth', require('./routes/auth'))

// user profile routes
app.use('/profile', require('./routes/profile'))


// if the url is unmatched, redirect to homepage
app.use(require('./middleware/customMiddleware.js').redirectUnmatched)


const PORT = process.env.PORT || 3000

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)

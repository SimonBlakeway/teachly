//all the main imports 
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // useful, but a security risk
const helmet = require('helmet');
const crypto = require('crypto')
const db = require('./config/db');
const customTimers = require('./customTimers');



app.use(helmet());

app.use((req, res, next) => {
  nonce = crypto.randomBytes(16).toString("hex");
  res.locals.cspNonce = nonce
  next();
});


app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "script-src": [
        "self",
        (req, res) => `'nonce-${res.locals.cspNonce}'`,
        "https://cdnjs.cloudflare.com"
      ]
      ,
      "style-src": [
        "self",
        (req, res) => `'nonce-${res.locals.cspNonce}'`
      ],
      "worker-src": [
        "'self'",
        "'unsafe-eval'",
        "'unsafe-inline'",
        'localhost',
      ],
      "img-src": [
        "'self'",
        "https: data:",
        "https://www.paypalobjects.com",
        'https://b.stripecdn.com'
      ],
    },
  })
);




app.use(cors())


//setting up procces.env
dotenv.config(dotenv.config({ path: './config/config.env' }));


//setting up the timers
//customTimers.timerSetup()

// Body parser
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }))
//app.use(bodyParser.json({ limit: "10mb" }))
app.use(cookieParser());

//app.use(require('./middleware/auth.js').ensureSafe) //breaks with ngrok
app.use(require('./middleware/customMiddleware.js').cookieSettings)

// Logging
if (process.env.NODE_ENV === 'development') {
  if (process.env.SECURE == "FALSE") process.env.SECURE = false
  else process.env.SECURE = true

  app.use(morgan('dev'))
}


// dependant vars
if (process.env.NODE_ENV === 'ngrok') {
  if (process.env.SECURE == "FALSE") process.env.SECURE = false
  else process.env.SECURE = true

  url = process.env.NGROK_URL

  process.env.DOMAIN = url
  process.env.SECURE = false
  process.env.COMPLETE_URL = url
  process.env.IP_ADDRESS_URL = url

  app.use(morgan('dev'))
}


// Handlebars Helpers
const {
  formatDate,
  json,
  currency,
  mathAdd,
  mathMultiply
} = require('./helpers/hbs');

// Handlebars
app.engine('.hbs', exphbs.engine({
  helpers: { //the list of helpers I want to be able to use in .hbs files
    formatDate,
    json,
    currency,
    mathAdd,
    mathMultiply
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


app.use('/', express.static(path.join(__dirname, 'public'), {
  // setHeaders: function (res, path) {
  //   res.set("Cache-Control", "private, max-age=0");
  // }
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

// stripe payment and webhooks Routes
app.use('/gateway/stripe', require('./routes/stripe'))


// stripe payment and webhooks Routes
app.use('/gateway/paypal', require('./routes/paypal'))

// if the url is unmatched, redirect to homepage
app.use(require('./middleware/customMiddleware.js').redirectUnmatched)


const http = require('http');
const server = http.createServer(app);  // this is to create http server with express for socket.io
const socketio = require('./socket.js');
const io = socketio.setIo(server);


// Static files
app.use(express.static("public"));

const zoomApi = require('./util-APIs/zoom')
const paypalApi = require('./util-APIs/paypal')
const stripeAPI = require('./util-APIs/stripe')

asyncSetup = [
  // zoomApi.setup(),
  //paypalApi.setup(),
  // stripeAPI.setup(),
]


//the server makes calls to varying apis to get tokens/info
//and this is a way to make sure that the calls will be completed
Promise.all(asyncSetup).then(() => {

  port = Number(process.env.PORT)
  server.listen(port, () => {
    console.log(`server listening on port ${port}`);
  })

}).catch(function (err) {
  console.log(err); // some coding error in handling happened
});


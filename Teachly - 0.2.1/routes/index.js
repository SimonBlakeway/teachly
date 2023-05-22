const express = require('express')
const router = express.Router()
const { contextSetup } = require(process.cwd() + '/utils.js');
const db = require('../config/db');




async function foo() {


  clientToken = {
    name: '12345',
    lang: 'en',
    cur: 'USD',
    id: 196,
    created_at: 1684778100,
    hasCookie: true,       
    isUser: true,
    accountNumber: 24,     
    user_refresh_string: 'ad8457e6b3122874ca13',
    token_created_at: 1684778825
  }


  try {
    result = await db.query(`SELECT user_refresh_token [ 24 ] FROM user_info`);
    db_token = result.rows[0].user_refresh_token
    console.log(db_token)
  } catch (error) {
    console.log(error)

  }
}


// @desc    Landing page
// @route   GET / 
router.get('/', async (req, res) => {
  //res.clearCookie('user_refresh_token')
  //res.clearCookie('userCookie')
  console.log(req.settings)
  res.render('landingPage', {
    layout: 'main',
    context: contextSetup(req.settings, ["navbar", "footer"], "landingPage"),
  })
})

// @desc    Login page
// @route   GET / login
router.get('/login', async (req, res) => {
  res.render('login', {
    layout: "main",
    context: contextSetup(req.settings, ["footer"], "login"),
  })
})


// @desc    Registration  page
// @route   GET / register
router.get('/register', async (req, res) => {
  res.render('register', {
    layout: "main",
    context: contextSetup(req.settings, ["footer"], "register"),
  })
})


// @desc    help page
// @route   GET /
router.get('/help', async (req, res) => {
  res.render('help')
})

// @desc    feedback page
// @route   GET /
router.get('/feedback', async (req, res) => {
  res.render('feedback')
})


// @desc    view user profile
// @route   GET /user/id
router.get('/user/:id', async (req, res) => {
  userId = req.params.id
  res.render('userProfile', {
    layout: "main",
    context: contextSetup(req.settings, ["footer"], "userProfile"),
  })
})


// @desc    view user profile
// @route   GET /user/id
router.get('/chat/', async (req, res) => {
  settings = {}
  settings = req.settings
  settings.messages = { "foo": "erer" }
  console.log(settings)
  res.render('chat', {
    layout: "main",
    context: contextSetup(settings, ["navbar"], "chat"),
  })
})

// @desc    view user profile
// @route   GET /user/id
router.get('/user-image/:userId', async (req, res) => {
  userId = req.params.chatroomId
  res.set("Cache-Control", "private, max-age=80000");



  res.sendFile("img-8.jpg", { root: `./public/images/`, })
  return



  try {
    result = await db.query(`SELECT profile_img, FROM user_info WHERE id = $1`, [userId]);
    if (result.rowCount == 0) {
      res.send("404")
      return
    }

    res.sendFile("img-8", { root: `./public/images/` })

    imgName = `${req.settings.id}.png`
    directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing
    img = utils.LZDecompress(result.rows[0].profile_img.trim())
    fs.writeFileSync(directoryPath + imgName, img, { encoding: 'base64' });
    res.sendFile(imgName, { root: directoryPath }, () => {
      fs.unlink(directoryPath + imgName, err => {
      })
    })

  } catch (error) {
    //console.log(error)

  }



})





module.exports = router

const express = require('express')
const router = express.Router()




// @desc    learn/Landing page
// @route   GET /
router.get('/cookiesPolicy', (req, res) => {
  res.render('termsofservice', {
    name: "user"
  })
})


module.exports = router
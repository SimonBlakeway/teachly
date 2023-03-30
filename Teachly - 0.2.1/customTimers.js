/*

*/

currencyApiTimer = require('./util-APIs/currency-conversion-util')
const db = require('./config/db');

exports.timerSetup = function() {

  /*
  this is an api timer, it gets the latest currency
  //conversion rates, and store them
  //in a global variable every half an hour, if at any time
  //this app gets a paid subscription to the api 
  the timer time would change to the shorter interval  
  */
  currencyApiTimer.CurrencyAPISetup()

  /*
    this timer deletes all user profiles that
    haven't entered their validation code
    before the cutoff time, these accounts 
    don't have any privlages and can't
    interact with anything, they're
    just stored here for easy of access and 
    stuff. it runs every 6 hours which means
    the absolute longest an unverified user 
    can stay in the db is 1 millisocon less than
    12 hours but after 6 hours their validation window 
    ends.
  */
  setInterval(() => {
    cutoffTime = Date.now() - 21600000 //six hours in miniseconds
    db.query('DELETE FROM user_info WHERE "emailCode" != 0 AND "createdAt" < $1', [cutoffTime], (err, result) => {
      if (err) {
        console.log(err)
      }
      console.log(result)
  })
  }, 21600000) // six hours in milliseconds

}
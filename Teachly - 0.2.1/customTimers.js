const fs = require('fs');
const db = require('./config/db');
const { CurrencyAPISetup } = require('./util-APIs/currency-conversion-util')
const { jsonToString } = require(process.cwd() + '/utils.js');


function activateThenInterval(func, time) {

  func()
  setInterval(function () {
    try {
      func()
    } catch (err) {
      console.log(err)
      console.log("activateThenInterval")
    }
  }, time)
}


function generateValidLanguagesStaticFile() {
  validLanguagesObj = JSON.parse(fs.readFileSync(`./private_resources/json/validLanguages.json`))
  validLanguagesArr = []
  for (i = 0; i < validLanguagesObj.fullName.length; i++) {
    validLanguagesArr[i] = [validLanguagesObj.fullName[i], validLanguagesObj.code[i]];
  }
  //const content = "langugeArr = " + validLanguagesArr
  const content = "languageArr = " +  " [ '" + validLanguagesArr.join("','") + "' ] ";
  fs.writeFile('./public/js/validLanguages.js', content, err => {
    if (err) {
      console.error(err);
    }
    else {
    }
  });
}

function generateValidCurrenciesStaticFile() {
  currenciesArr = global.currencyObj.conversion_rates
  if (currenciesArr === undefined) { return }
  currenciesArr = Object.keys(currenciesArr)
  const content = "currenciesArr = " +  " [ '" + currenciesArr.join("','") + "' ] ";
  fs.writeFile('./public/js/validCurrencies.js', content, err => {
    if (err) {console.error(err)}
    else {}
  });
}

async function cleanDB() {
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
  try {
    cutoffTime = ~~(Date.now() / 1000) - 21600000 //six hours in miliseconds
    result = await db.query(`DELETE FROM user_info WHERE ("emailCode" != '0') AND ("createdAt" < $1)`, [cutoffTime]);
  } catch (error) {
    console.log(error)
  }
}


exports.timerSetup = function () {
  halfAnHour = 1800000;
  sixHours = 21600000;

  activateThenInterval(CurrencyAPISetup, halfAnHour)

  activateThenInterval(generateValidLanguagesStaticFile, sixHours)

  activateThenInterval(generateValidCurrenciesStaticFile, sixHours) 

  activateThenInterval(cleanDB, sixHours) 

}
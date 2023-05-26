const fs = require('fs');
const db = require('./config/db');
const { CurrencyAPISetup } = require('./util-APIs/currency-conversion-util')
const { jsonToString } = require(process.cwd() + '/utils.js');

global.timerObj = {}

/**
 *   ./private_resources/userImagesForProccesing/
 *   
 *   so, to work with a large amount of requests for user assets
 *   such as images, videos, audios and possibly others,
 *   the server takes a request from the clients, parses it to
 *   check for any problems like authentication and invalid requests
 *   then it queries the database for the asset, converts the compressed base 64
 *   string into an image/video/audio, then sends it to the client and deletes the
 *   asset. This does work, bu the problem is that it's inefficient, it makes more reqests
 *   then is strictly necessary, and the conversion to file isn't free, and will add up
 *   if the server is ever employed on a large enought scale, somewhere around 1000 clients
 *   the overhead would be noticable and it would just get worse from there.
 *   
 *  
 *   the possible new implementaion is designed around timers and the flow is something
 *   like this:  
 * 
 *   the server has a global object that stores a timers delete the asset in an arbatrary
 *   amount of time, probably 15 minutes or something like that. the object exists for two 
 *   reasons, the first one it to let the sever check if the asset is in the file system and 
 *   update the timers as needed, its basically for timer storage 
 *   
 *   the timers are setTimouts, they delete the file and remove the timer from the object,
 *   which keeps the object clean.
 * 
 *   now that the components are explained, the request will go something like this:
 * 
 *   the client requests an asset from the server
 * 
 *   the server checks the times object to see if the asset is in the filesystem already,
 *   if it is, 
 *     then the server resets the timer and sends the client the asset in that order,
 * 
 *   if it is not, 
 *     then the server gets the asset from the database and converts it to a file,
 *     sends the file to the client, and set up a deletion timer in the timer obj
 * 
 *   this has better loading time, and better proccessing power usage as well.
 *   which makes sense because it's what a lot of big companies do for stuff like this,
 *   it's basically the "hot" data concept from google
 * 
 */


async function assetTimer(fileName) {
  filePath = "./private_resources/userImagesForProccesing/"
  try {
    await fs.promises.unlink(filePath + fileName)
    delete global.timerObj[`${fileName}`]
  } catch (error) {
    console.log(error)
  }

}

function createAssetTimer(fileName, time) {
  if (global.timerObj[`${fileName}`]) {
    //overwrites timer, used for resettings older timer
    clearTimeout(global.timerObj[`${fileName}`])
  }
  global.timerObj[`${fileName}`] = setTimeout(() => { assetTimer(fileName) }, time);
}



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
  const content = "languageArr = " + " [ '" + validLanguagesArr.join("','") + "' ] ";
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
  const content = "currenciesArr = " + " [ '" + currenciesArr.join("','") + "' ] ";
  fs.writeFile('./public/js/validCurrencies.js', content, err => {
    if (err) { console.error(err) }
    else { }
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

function timerSetup() {
  halfAnHour = 1800000;
  sixHours = 21600000;

  activateThenInterval(CurrencyAPISetup, halfAnHour)

  activateThenInterval(generateValidLanguagesStaticFile, sixHours)

  activateThenInterval(generateValidCurrenciesStaticFile, sixHours)

  activateThenInterval(cleanDB, sixHours)

}


module.exports = {
  timerSetup,
  createAssetTimer,
}

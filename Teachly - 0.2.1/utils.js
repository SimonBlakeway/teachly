const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const LZString = require('lz-string');
const db = require('./config/db');
const jwt = require("jwt-simple");
const { compile } = require('html-to-text');
const { text } = require('body-parser');
const { join } = require('path');
const { relativeTimeThreshold } = require('moment');
const options = { wordwrap: false, };
const compiledConvert = compile(options);


const companyEmailAddress = process.env.COMPANY_EMAIL_ADDRESS
const companyLocation = process.env.COMPANY_LOCATION
const companyPhoneNumber = process.env.COMPANY_PHONE_NUMBER
const companyPrintNumber = process.env.COMPANY_PRINT_NUMBER

const notificationMessages = JSON.parse(fs.readFileSync(`./private_resources/json/notificationMessages.json`))
const countryCodeToCurrency = JSON.parse(fs.readFileSync(`./private_resources/json/languageCodeToCurrency.json`))

const validspecialitiesObj = JSON.parse(fs.readFileSync(`./private_resources/json/validspecialities.json`))
const validSubjectObj = JSON.parse(fs.readFileSync(`./private_resources/json/validSubject.json`))
const validLanguagesObj = JSON.parse(fs.readFileSync(`./private_resources/json/validLanguages.json`))

const saltNum = Number(process.env.BCRYPT_SALT_NUM)
const hashAdd = process.env.HASH_ADD

const algorithm = 'aes-256-ctr'
const secretKey = Buffer.from(process.env.CRYPTO_ENCRYPT_KEY, "hex")
const iv = Buffer.from(process.env.CRYPTO_ENCRYPT_IV, 'hex')


function convertTimeToInteger(time) {
  //time format "11:22"
  let d = new Date(0);
  time += ":00"
  let newDate = new Date(d.toString().split(":")[0].slice(0, -2) + time);
  return newDate.getTime() / 1000
}

function convertIntegerToTime(int) {
  //int format "minutes from start of day"
  let d = new Date(int * 1000);
  str = `${d.getHours()}:${d.getMinutes()}`
  return str
}


function getUTCTimeStampNoHours(date = new Date()) {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ).getTime()
}

function getUTCTimeStampNoMilliseconds(date = new Date()) {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCMinutes(),
  ).getTime()
}


function getUTCTimeStampComplete(date = new Date()) {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCMilliseconds()
  ).getTime()
}

function formatToPGRange(input, rules = ["exclusive", "inclusive"]) {
  //arr: [start, finish]
  //rules: ["rule for start", "rule for finish"]
  //function only works with well formed input/rules
  ruleToVal = {
    "start": {
      "exclusive": "[",
      "inclusive": "("
    },
    "finish": {
      "exclusive": "]",
      "inclusive": ")"
    }
  }
  ranges = []
  if (input[0].constructor === Array) {
    for (let index = 0; index < input.length; index++) {
      const range = input[index];
      const start = range[0]
      const finish = range[1]
      newRange = `${ruleToVal.start[rules[0]]}${start},${finish}${ruleToVal.finish[rules[1]]}`
      ranges.push(newRange)
    }
  }
  else {
    const range = input
    const start = range[0]
    const finish = range[1]
    newRange = `${ruleToVal.start[rules[0]]}${start}, ${finish}${ruleToVal.finish[rules[1]]}`
    ranges.push(newRange)
  }
  return ranges
  // example '[0,5)'
}

function isInt(value) {
  var x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

function isTrue(input) {
  if (typeof input == 'string') {  //is basically just for reading bools from the .env file
    return input.toLowerCase() == 'true';
  }

  return !!input;
}

function escapeStr(str) {
  //char to be replaced as needed
  return unsafe.replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function unEscapeStr(str) {
  //char to be replaced as needed
  return unsafe.replaceAll('&quot;', '"').replaceAll("&#039;", "'");
}

function getCurrencyFromLanguageCode(code) {
  try {
    cur = countryCodeToCurrency[code]
    if (cur == undefined) { return "USD" }
    return cur
  }
  catch {
    return "USD"
  }
}

function contextSetup(settings, partials = [], pageName, dbQuery = {}, layout = "main") {
  try {
    context = {};
    context.companyInfo = {
      "companyEmailAddress": companyEmailAddress,
      "companyLocation": companyLocation,
      "companyPhoneNumber": companyPhoneNumber,
      "companyPrintNumber": companyPrintNumber,
    }
    try {
      settings.curRatio = global.currencyObj.conversion_rates[settings.cur] ? global.currencyObj.conversion_rates[settings.cur] : "USD"
    }
    catch {
      settings.curRatio = 1
    }
    context.settings = settings

    if (settings.hasCookie == false) {
      context.cookiesPopup = JSON.parse(fs.readFileSync(`./views/webpage-templates/langauge-templates/${settings.lang}/partials/cookiesPopup.json`))
    }
    if ((navIndex = partials.indexOf("navbar")) != -1) {
      if (settings.isUser) {
        context.userNavbar = JSON.parse(fs.readFileSync(`./views/webpage-templates/langauge-templates/${settings.lang}/partials/userNavbar.json`))
      }
      else {
        context.navbar = JSON.parse(fs.readFileSync(`./views/webpage-templates/langauge-templates/${settings.lang}/partials/navbar.json`))
      }
      partials.splice(navIndex, 1)
    }

    context.bodyContext = JSON.parse(fs.readFileSync(`./views/webpage-templates/langauge-templates/${settings.lang}/${pageName}.json`))
    context.dbQuery = dbQuery
    context.layoutContext = JSON.parse(fs.readFileSync(`./views/webpage-templates/langauge-templates/${settings.lang}/layouts/${layout}.json`))

    context.language = settings.lang
    for (i = 0; i < partials.length; i++) {
      context[`${partials[i]}`] = JSON.parse(fs.readFileSync(`./views/webpage-templates/langauge-templates/${settings.lang}/partials/${partials[i]}.json`))
    }
    return context
  }
  catch (err) {
    console.log("context setup err")
    console.log(err)
    return contextSetup({ cur: "USD", lang: "en" }, partials, pageName)
  }
}

async function ImagePrep(imgStr, name, dimensions = [1440, 1440], maxSize = 1048576) {
  //image stored as string, name to use as image name, dimension the the image will sit in [width, height], maxsize in bytes of image

  /*
    this function prepares the image to 
    be added into the database as a string,

    the rough ouline is

    1, convert the input string into an image file
    2, alter the image based of it's data, since images come in a variety of sizes and shapes there's no one size fits all function 

  */
  name = name.replaceAll(" ", "-")
  directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing
  fileName = `${name}.jpeg`
  alteredFileName = `${name}-altered.jpeg`
  base64Image = imgStr.split(';base64,').pop(); //the "cap" needs to be removed before it can be converted into an image


  imageQualityRatio = Math.round((maxSize / (base64Image.length * 0.75)) * 100)



  if (imageQualityRatio >= 1) {
    imageQualityRatio = 100
  }
  else {
    imageQualityRatio = imageQualityRatio * 100
  }

  fs.writeFileSync(directoryPath + fileName, base64Image, { encoding: 'base64' }); //converts string to image

  imgMetadata = await sharp(directoryPath + fileName).metadata(); // I need the metadata to get the heigth and width

  imageDimensions = [imgMetadata.width, dimensions.height]
  index = imageDimensions.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
  ratio = dimensions[index] / imageDimensions[index]


  // ratio = imgMetadata.height >= imgMetadata.width ? dimensions.height / imgMetadata.height : dimensions.width / imgMetadata.width





  await sharp(directoryPath + fileName)
    .resize({
      width: Math.round(imgMetadata.width * ratio),
      height: Math.round(imgMetadata.height * ratio)
    })
    .jpeg({ mozjpeg: true, quality: imageQualityRatio, })
    .toFile(directoryPath + alteredFileName);
  data = Buffer.from(fs.readFileSync(directoryPath + alteredFileName)).toString('base64');


  fs.unlink(directoryPath + fileName, err => {
    if (err) {
      throw err
    }
  })
  fs.unlink(directoryPath + alteredFileName, err => {
    if (err) {
      console.log(err)
      throw err
    }
  })


  comp = LZCompress(data) //compress image for storage
  return comp

}

function isValidLanguage(str, fullName = false) {
  subGroup = fullName ? "fullName" : "code"
  if (typeof str == "array") {
    for (i = 0; i < str.length; i++) {
      if (validLanguagesObj[subGroup].indexOf(str) == -1) { return false }
    }
  }
  return true
}

function isValidSubject(lang, subject) {
  try {
    return validSubjectObj["en"].includes(subject)
  }
  catch (err) {
    return false
  }
}

function isValidSubjectSpeciality(lang, subject, specialities) {
  try {
    if ((!!specialities) && (specialities.constructor === Array)) {
      for (i = 0; i < specialities.length; i++) {
        if (!(validspecialitiesObj["en"][subject].includes(specialities[i]))) {
          return false
        }
      }
      return true
    }
    else {
      if (!(validspecialitiesObj[lang][subject].includes(specialities))) {
        return false
      }
      return true
    }
  }
  catch (err) {
    console.log(err)
    return false
  }
}

function isValidSubjectSpecialityNoSubject(lang, speciality) {
  try {
    keys = Object.keys(validspecialitiesObj[lang])
    for (i = 0; i < keys.length; i++) {
      if (validspecialitiesObj[lang][keys[i]].includes(speciality)) { return keys[i] }
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}

function isValidAvailableTimes(arr) {
  days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  try {
    for (i = 0; i < arr.length; i++) {
      time = arr[i].split("_")
      day = time[1]
      time = time[0]
      if (days.includes(day) == false) { return false }
      firstInt = parseInt(time[0])
      secondInt = parseInt(time[2])
      if (0 >= firstInt >= 24) { return false }
      if (0 >= secondInt >= 24) { return false }
      if (((firstInt + 1) != secondInt)) { return false }

    }
    return true
  }
  catch (err) {
    console.log(err)
    return false
  }
}

async function hashString(str) {
  try {
    str = await bcrypt.hash(str + hashAdd, saltNum)
    console.log(str)
    return String(str)
  } catch (error) {
    console.log(error)
  }
  // Return null if error
  return null
}

async function compareHash(str, hash) {
  try {
    bool = await bcrypt.compare(str + hashAdd, hash)
    return bool

  } catch (error) {
    console.log(error)
  }
  // Return null if error
  return null
}

function encrypt(str) {
  try {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
    const encrypted = Buffer.concat([cipher.update(str), cipher.final()])
    return encrypted.toString('hex')
  } catch (err) {
    console.log(err)
    return err
  }
}

function decrypt(str) {
  try {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(Buffer.from(str, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.log(err)
    return err
  }
}

function LZCompress(string) {
  try {
    comp = LZString.compressToUTF16(string);
    return comp
  } catch (err) {
    console.log(err)
    return err
  }
}

function LZDecompress(string) {
  try {
    return LZString.decompressFromUTF16(string);
  } catch (err) {
    console.log(err)
    return err
  }
}

function stringToJson(string) {
  return JSON.parse(string);
}

function jsonToString(string) {
  return JSON.stringify(string);
}

function genSafeRandomStr(length) {
  return crypto.randomBytes(length).toString('hex').substring(0, length); //these functions don't return true random vals, but it's close enough for security usage
}

function genSafeRandomNum(min, max) {
  //these functions don't return true random vals, but it's close enough for security usage
  return crypto.randomInt(min, max) // this functio return one less than max, 
}

async function cleanUserData(user) {
  user.name = compiledConvert(user.name.trim())
  user.email = compiledConvert(user.email.trim())
  result = await Promise.all([ImagePrep(user.profileImage, user.name), hashString(user.password)])
  user.profileImage = result[0]
  user.password = result[1]
  return user
}

function genUserCookie(userInfo) {

  try {
    //the idea is it take a pg row and make the user cookie
    payload = {
      name: userInfo[0].name,
      lang: userInfo[0].lang,
      cur: userInfo[0].cur,
      id: userInfo[0].id,
      created_at: Math.floor(Date.now() / 1000),
      email: userInfo.email,
    }
    encodedCookie = jwt.encode(payload, process.env.JWT_SECRET)
    return encodedCookie
  } catch (error) {
    console.log(error)
    console.log()
    console.log(userInfo)
  }
}

async function genUserRefreshToken(id) {
  try {
    let result = await db.query(`SELECT user_refresh_token FROM user_info WHERE id = $1`, [id]);
    accountNumber = ""

    //get corect account number
    let arr = result.rows[0].user_refresh_token
    let index = arr.findIndex(obj => Object.keys(obj).length === 0);
    if (index != -1) {
      accountNumber = index + 1 //postgres indexes start at 1
    }
    else {
      accountNumber = result.rows[0].user_refresh_token.length + 1
    }

    //create db and client token pair
    date = Math.floor(Date.now() / 1000)
    user_refresh_string = genSafeRandomStr(20)
    client_token = {
      user_refresh_string: user_refresh_string,
      id: id,
      accountNumber: accountNumber,
      created_at: date
    }
    db_token = {
      user_refresh_string: user_refresh_string,
      accountNumber: accountNumber,
      created_at: date
    }

    encodedToken = jwt.encode(client_token, process.env.JWT_SECRET)
    try {
      db.query(`UPDATE user_info SET user_refresh_token [${accountNumber}] = $1 WHERE id = $2;`, [db_token, id]);
      return encodedToken
    } catch (error) {
      console.log(error)
      throw error
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

function langugeToLanguageCode(lang) {
  validLanguagesObj = JSON.parse(fs.readFileSync(`./private_resources/json/validLanguages.json`))
  try {
    index = validLanguagesObj["fullName"].indexOf(lang)
    if (index != -1) {
      return validLanguagesObj["code"][index]
    }
    return false
  }
  catch (err) {
    console.log(err)
    return false
  }
}

function convertTaughtInToQuery(languages) {
  //  console.log(languages, "retsaccacas")
  try {
    if (languages == []) { return "" }
    var queryString = `AND (`

    if (languages.constructor === Array) {

      for (i = 0; i < languages.length; i++) {

        str = "";
        if (i == 0) { str = ` ( '${languages[i]}' = ANY (taught_in) )` }
        else if (i == languages.length - 1) { str = ` ( '${languages[i]}' = ANY (taught_in) ) )` }
        else { str = ` OR ( '${languages[i]}' = ANY (taught_in) )` }
        queryString += str
      }
      if (queryString == "AND (") { return "" }
      return queryString + `) \r\n`


    }
    else {
      if (languages.length == 0) { return "" }//empty string

      //queryString = `AND ( '${languages[i]}' = ANY (taught_in) )`

      queryString += ` '${languages}' = ANY (taught_in) )`

      if (queryString == "AND (") { return false }
      return queryString + `) \r\n`

    }

  } catch (error) {
    console.log(error)
    return ""
  }
}



function convertTimeRangeToQuery(arr) {
  try {
    var queryString = `AND (`

    for (i = 0; i < arr.length; i++) {
      if (i == 0) {
        queryString += ` ( '[1, 2]' <@  = ANY (calender_times ) )`
      }
      else {
        queryString += ` OR ( '[1, 2]' <@ ANY (calender_times ) )`
      }
    }
    queryString += ` )`

    if (queryString == "AND ( )") { return "" }
    return queryString + `\r\n`
  } catch (error) {
    console.log(error)
    return ""
  }



}

function convertTimeRangeToQuery(obj) {

  queryString = `AND (`
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

  obj = {
    "sunday": [
      [0, 1130],
      [1440, 1440],
      [1440, 1440],

    ],
    "monday": [],
    "tuesday": [],
    "wednesday": [],
    "thursday": [],
    "friday": [],
    "saturday": [],
  }
  for (let index = 0; index < days.length; index++) {
    const key = days[index];
    if (obj[`${key}`].length > 0) {
      for (let j = 0; j < obj[`${key}`].length; j++) {
        let element = obj[`${key}`][j];
        let min = element[0]
        let max = element[1]
        addStr =
          `
          ${min} > ANY ( ${key} )  AND
          ${max} < ANY ( ${key} )  AND
        `
        queryString += addStr
      }
    }
  }
  split = queryString.split("AND")
  queryString = split.splice(0, split.length - 1).join("AND") + ` )`
  return queryString
}

function convertMinuteTimeRangeToQuery(arr, min, max) {
  if (arr.constructor !== Array || arr.length == 0) return ""
  if ((typeof min != "number") || (typeof max != "number")) return ""

  min = min * 1000
  max = max * 1000
  {
    /*
     
      WHERE
      
    (
        (calender_times = any(
        SELECT calender_times 
        FROM (SELECT generate_subscripts( calender_times , 1) AS s, calender_times FROM tes) foo
        WHERE ( 
          (
          40 > ( upper( calender_times [s]) - lower( calender_times [s]) ) AND
          60 < ( upper( calender_times [s]) - lower( calender_times [s]) ) AND
          calender_times [s] @> '[ 12, 15)'
          )
        )
      )) 
      OR
        (calender_times = any(
        SELECT calender_times 
        FROM (SELECT generate_subscripts( calender_times , 1) AS s, calender_times FROM tes) foo
        WHERE ( 
          (
          40 > upper( calender_times [s]) AND
          60 < lower( calender_times [s]) AND
          calender_times [s] @> '[ 10, 13)'
          )
        )
      )) 
    )
     
     */
  }
  queryStr = `
  (  `


  if (arr.length != 0) {

    for (let index = 0; index < arr.length; index++) {
      const range = arr[index];
      start = range[0]
      finish = range[1]

      if (index == 0) {
        queryStr += `
      (calender_times = any(
        SELECT calender_times 
        FROM (SELECT generate_subscripts( calender_times , 1) AS s, calender_times FROM tes) foo
        WHERE ( 
          (
          ${max} >= upper( calender_times [s]) AND
          ${min} <= lower( calender_times [s]) AND
          calender_times [s] @> '[ ${start}, ${finish})'
          )
        )
      ))
      `
      }
      else {
        queryStr += `
      OR
      (calender_times = any(
      SELECT calender_times 
      FROM (SELECT generate_subscripts( calender_times , 1) AS s, calender_times FROM tes) foo
      WHERE ( 
        (
        ${max} > ( upper( calender_times [s]) - lower( calender_times [s]) ) AND
        ${min} < ( upper( calender_times [s]) - lower( calender_times [s]) ) AND
        calender_times [s] @> '[ ${start}, ${finish})'
        )
      )
    )) `
      }
    }

    queryStr += `  
  )`
  }
  else {
    //the min max query would not work if there was no query times without this 

    /*
      possible problem

      does this mean that a querr like min = 10, max = 20

      will pull [10,11),[12,13),[14,15)

      but not   [9 ,11),[12,13),[14,21)

      even though [12,13) is a valid time it might skip

      must check in playgound online later

      might apply to for loop query as well

      >>>no problem detected



  select times from tes 
    WHERE
    times = any(
      SELECT times
        FROM (SELECT generate_subscripts(times, 1) AS s, times FROM tes) foo
          WHERE  
                (
                  11 >= upper( times[s] ) AND
                  2 <= lower( times[s] )
                )
              )



    */
    queryStr += `
      (calender_times = any(
        SELECT calender_times 
        FROM (SELECT generate_subscripts( calender_times , 1) AS s, calender_times FROM tes) foo
        WHERE ( 
          (
          ${max} >= upper( calender_times [s]) AND
          ${min} <= lower( calender_times [s]) AND
          )
        )
      ))
      `
  }
  return queryStr
}

function convertspecialityArrToQuery(lang, subjectName, specialities) {
  if (specialities == []) { return "" }
  var queryString = `AND (`
  try {
    for (i = 0; i < specialities.length; i++) {
      if (!(isValidSubjectSpeciality(lang, subjectName, specialities[i]))) { return "" }
      str = "";
      if (i == 0) { str = ` ( '${specialities[i]}' = ANY (specialities) )` }
      else { str = ` OR ( '${specialities[i]}' = ANY (specialities) )` }
      queryString += str
    }
    if (queryString == "AND (") { return "" }
    return queryString + ` ) \r\n`
  }
  catch (err) {
    console.log(err)
    return ""

  }
}

function convertOrderByToQuery(str) {
  var orderByValidTypes = {
    "Popularity": `  ORDER BY number_of_active_students ASC`,
    "Price: highest first": `  ORDER BY price_per_lesson ASC`,
    "Price: lowest first": `  ORDER BY price_per_lesson DESC`,
    "Number of reviews": `  ORDER BY numberOfReviews ASC`,
    "Best rating": `  ORDER BY rating ASC`,
  }
  if (typeof orderByValidTypes[str] != "undefined") {
    return orderByValidTypes[str] + "\r\n"
  }
  return ""
}

function convertSearchByKeywordToQuery(str) {
  try {
    if (str) {
      queryString = `AND ts_vector @@ to_tsquery('${str}') \n`
      return queryString
    }
    else {
      return ""
    }
  }
  catch (err) {
    return ""
  }
}

function sendNotification(text, id, lang) {
  try {
    notObj = {
      text: compiledConvert(text),
      created_at: Math.floor(Date.now() / 1000),
      userId: id,
      link: link,
      notification_type: "notification",
      lang: lang
    }
    db.query(`
    INSERT INTO notifications 
      (text, created_at, user_id, link, lang, notification_type)
    VALUES 
    ($1, $2, $3, $4, $5, $6)`,
      [notObj.text, notObj.created_at, notObj.userId, link, notObj.lang, notObj.notification_type]);

    global.io.to(`${id}-user`).emit("notification", notObj);
  }
  catch (err) {
    console.log(err)
    throw new Error(`error: ${err}`)
  }
}

function sendNotificationGlobal(id, text, lang) {
  try {
    notObj = {
      text: compiledConvert(text),
      created_at: Math.floor(Date.now() / 1000),
      userId: id,
      link: link,
      notification_type: "global notification",
      lang: lang
    }
    db.query(`
    INSERT INTO notifications 
      (text, created_at, user_id, link, lang, notification_type)
    VALUES 
    ($1, $2, $3, $4, $5, $6)`,
      [notObj.text, notObj.created_at, notObj.userId, link, notObj.lang, notObj.notification_type]);

    io.emit("notification", notObj);
  }
  catch (err) {
    console.log(err)
  }
}

async function sendAutomatedNotification(key, valObj, id, lang = false) {
  try {

    if (lang == false) {
      lang = (await db.query(
        `
      SELECT lang
      FROM user_info;
      WHERE id = $1  
      `, [id])).rows[0].lang
    }

    textLangArr = notificationMessages[`${lang}`][`${key}`].text
    linkLangArr = notificationMessages[`${lang}`][`${key}`].link
    textSpace = notificationMessages[`${lang}`]["textSpace"]
    for (let i = 0; i < valObj.text.length; i++) { textLangArr[textLangArr.indexOf(i)] = valObj["text"][i] }
    for (let i = 0; i < valObj.link.length; i++) { linkLangArr[linkLangArr.indexOf(i)] = valObj["link"][i] }
    let text = textLangArr.join(textSpace)
    let link = linkLangArr.join()


    notObj = {
      text: compiledConvert(text),
      created_at: Math.floor(Date.now() / 1000),
      userId: id,
      link: link,
      notification_type: "notification",
      lang: lang
    }


    db.query(`
    INSERT INTO notifications 
      (text, created_at, user_id, link, lang, notification_type)
    VALUES 
    ($1, $2, $3, $4, $5, $6)`,
      [notObj.text, notObj.created_at, notObj.userId, link, lang, notObj.notification_type]);


    io.in(`${id}-user`).emit("notification", notObj);

  }
  catch (err) {
    console.log(err)
  }
}

function sendAutomatedNotificationGlobal(lang, key, valObj) {
  try {
    textLangArr = notificationMessages[`${lang}`][`${key}`]
    textSpace = notificationMessages[`${lang}`]["textSpace"]
    textSpace = notificationMessages[`${lang}`]["textSpace"]

    for (let i = 0; i < valObj.text.length; i++) { textLangArr[textLangArr.indexOf(i)] = valObj["text"][i] }
    for (let i = 0; i < valObj.link.length; i++) { linkLangArr[linkLangArr.indexOf(i)] = valObj["link"][i] }
    let text = textLangArr.join(textSpace)
    let link = linkLangArr.join()


    notObj = {
      text: compiledConvert(text),
      created_at: Math.floor(Date.now() / 1000),
      userId: id,
      link: link,
      lang: lang,
      notification_type: "global notification",
    }
    db.query(`
    INSERT INTO notifications 
      (text, created_at, link, lang, notification_type)
    VALUES 
      ($1, $2, $3, $4, $5)`,
      [notObj.text, notObj.created_at, link, lang, notObj.notification_type]);

    io.emit("notification", notObj);

  }
  catch (err) {
    console.log(err)
    throw new Error(`error: ${err}`)
  }
}

async function sendMessage(user_id, text, chat_id, settings) {
  try {


    lang = (await db.query(`
    SELECT lang FROM user_info
  `)).rows[0].lang

    notObj = {
      text: compiledConvert(text),
      created_at: Math.floor(Date.now() / 1000),
      user_id: user_id,
      notification_type: "message",
      lang: lang
    }


    //send add message to db to user
    result = await db.query(`
    INSERT INTO messages (text, created_at, sender_id, chat_id) 
    VALUES ($1, $2, $3, $4) 
    WHERE chat_id = $2 AND (teacher_id = $3 OR student_id = $3);
     `, [text, created_at, settings.id, chat_id])

    //send message to user
    io.to(`${user_id}-user`).emit("send message", notObj);


    sendAutomatedNotification(lang, "message-notification", { text: [settings.name], link: [chat_id] })

  }
  catch (err) {
    console.log(err)
  }
}

function currencyFloatToInt(num) {
  return num

}

function timstampToLocalDate(lang, timestamp) {
  let date = new Date(timestamp * 1000)
  return new Intl.DateTimeFormat(lang).format(date)
}

function toLocalNumber(lang, number) {
  return new Intl.NumberFormat(lang).format(number)
}

module.exports = {
  getCurrencyFromLanguageCode,
  contextSetup,
  isValidLanguage,
  hashString,
  compareHash,
  ImagePrep,
  LZCompress,
  LZDecompress,
  stringToJson,
  jsonToString,
  genSafeRandomStr,
  genSafeRandomNum,
  cleanUserData,
  genUserCookie,
  genUserRefreshToken,
  encrypt,
  decrypt,
  sendMessage,
  isValidSubject,
  isValidSubjectSpeciality,
  isValidSubjectSpecialityNoSubject,
  convertTaughtInToQuery,
  convertTimeRangeToQuery,
  convertspecialityArrToQuery,
  convertOrderByToQuery,
  convertSearchByKeywordToQuery,
  convertMinuteTimeRangeToQuery,
  isTrue,
  isInt,
  langugeToLanguageCode,
  isValidAvailableTimes,
  sendNotification,
  sendNotificationGlobal,
  escapeStr,
  unEscapeStr,
  currencyFloatToInt,
  compiledConvert,
  sendAutomatedNotification,
  sendAutomatedNotificationGlobal,
  formatToPGRange,
  timstampToLocalDate,
  toLocalNumber
}
const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const LZString = require('lz-string');
const db = require('./config/db');
const jwt = require("jwt-simple");
const { compile } = require('html-to-text');
const { type } = require('os');
const options = { wordwrap: false, };
const compiledConvert = compile(options);





companyEmailAddress = process.env.COMPANY_EMAIL_ADDRESS
companyLocation = process.env.COMPANY_LOCATION
companyPhoneNumber = process.env.COMPANY_PHONE_NUMBER
companyPrintNumber = process.env.COMPANY_PRINT_NUMBER



countryCodeToCurrency = JSON.parse(fs.readFileSync(`./private_resources/json/languageCodeToCurrency.json`))

validspecialitiesObj = JSON.parse(fs.readFileSync(`./private_resources/json/validspecialities.json`))
validSubjectObj = JSON.parse(fs.readFileSync(`./private_resources/json/validSubject.json`))
validLanguagesObj = JSON.parse(fs.readFileSync(`./private_resources/json/validLanguages.json`))


const saltNum = Number(process.env.BCRYPT_SALT_NUM)
const hashAdd = process.env.HASH_ADD

const algorithm = 'aes-256-ctr'
const secretKey = Buffer.from(process.env.CRYPTO_ENCRYPT_KEY, "hex")
var iv = Buffer.from(process.env.CRYPTO_ENCRYPT_IV, 'hex')



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

function escapeStr(str)  {
  //char to be replaced as needed
  return unsafe.replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function unEscapeStr(str)  {
  //char to be replaced as needed
  return unsafe.replaceAll('&quot;', '"').replaceAll("&#039;","'");
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

function contextSetup(settings, partials = [], pageName, layout = "main") {
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




async function ImagePrep(imgStr, name, dimensions = {length: 1440, height: 1440}, maxSize = 2073600) {
  try {
    /*
      this function prepares the image to 
      be added into the database as a string,

      the rough ouline is

      1, convert the input string into an image file
      1 alter the image based of it's data, since images come in a variety of sizes and shapes there's no one size fits all function 

    */
    name = name.replaceAll(" ", "-")
    directoryPath = `./private_resources/userImagesForProccesing/`  //this is where the images go for proccesing
    fileName = `${name}.jpeg`
    alteredFileName = `${name}-altered.jpeg`
    base64Image = imgStr.split(';base64,').pop(); //the "cap" needs to be removed before it can be converted into an image
    //imageQualityRatio = ((414330 / (base64Image.length *  0.75)) * 100) > 100 ? 100 : Math.round( (414330 / (base64Image.length *  0.75)) * 100) // this is the quality percentage, so if an image has a very high quality this line will find the perfect percentage to get it into the tight range, if not it sets the quality percentate to max
    var val = maxSize
    qal = Math.round((maxSize / (base64Image.length * 0.75)) / 8)
    org = Math.round((maxSize / (base64Image.length * 0.75)) * 100)



    imageQualityRatio = org > 100 ? qal : org
    imageQualityRatio = imageQualityRatio > 100 ? 100 : imageQualityRatio
    imageQualityRatio = 100 // remove if image too big

    fs.writeFileSync(directoryPath + fileName, base64Image, { encoding: 'base64' }); //converts string to images

    imgMetadata = await sharp(directoryPath + fileName).metadata(); // I need the metadata to get the heigth and width
    ratio = imgMetadata.length >= imgMetadata.width ? dimensions.height / imgMetadata.length : dimensions.width / imgMetadata.width
    await sharp(directoryPath + fileName)
      .resize({
        width: Math.round(imgMetadata.width * ratio),
        height: Math.round(imgMetadata.height * ratio)
      })
      .jpeg({ mozjpeg: true, quality: imageQualityRatio, }) //,  quality: imageQualityRatio, })
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
    return LZCompress(data) //compress image for storage
  } catch (error) {
    console.log(error)
    return false
  }
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

function isValidAvailableTimes(obj) {
  days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",]
  try {
    function checkDay(day) {
      for (i = 0; i < day.length; i++) {
        if (day[i].length != 3) { return false }
        firstInt = parseInt(day[i][0])
        secondInt = parseInt(day[i][2])
        if (0 >= firstInt >= 24) { return false }
        if (0 >= firstInt >= 24) { return false }
        if (day[i][1] != "-") { return false }
        if (((firstInt + 1) != secondInt)) { return false }
      }
      return true
    }
    keys = Object.keys(obj)
    for (i = 0; i < keys.length; i++) {
      if (days.includes(keys[i])) {
        if (checkDay(obj[keys[i]]) == false) return false
      }
      else { return false }
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
    return LZString.compressToUTF16(string);
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
  // the idea behind this is that it takes the data from a PG row and return the user cookie
  chatIds = []
  for (i = 0; i < userInfo.length; i++) {
    chatIds.push(userInfo[i].chat_id);
  }
  payload = {
    name: userInfo[0].name.trim(),
    lang: userInfo[0].lang.trim(),
    cur: userInfo[0].cur,
    id: userInfo[0].id,
    created_at: Math.floor(Date.now() / 1000),
    chatIds: chatIds
  }
  encodedCookie = jwt.encode(payload, process.env.JWT_SECRET)
  return encodedCookie
}

async function genUserRefreshToken(id) {
  user_refresh_token = genSafeRandomStr(20)


  try {
    let result = await db.query(`SELECT user_refresh_token FROM user_info WHERE id = $1`, [id]);
    accountNumber = ""
    let arr = result.rows[0].user_refresh_token
    let index = arr.findIndex(obj => Object.keys(obj).length === 0);
    if (index != -1) {
      accountNumber = index + 1 //postgres indexes start at 1
    }
    else {
      accountNumber = result.rows[0].user_refresh_token.length + 1
    }

    date = Math.floor(Date.now() / 1000)
    token = {
      user_refresh_token: user_refresh_token,
      id: id,
      accountNumber: accountNumber,
      created_at: date
    }
    console.log(accountNumber)


    db_token = {
      user_refresh_token: user_refresh_token,
      accountNumber: accountNumber,
      created_at: date
    }

    encodedToken = jwt.encode(token, process.env.JWT_SECRET)
    try {
      // db.query(`UPDATE user_info SET user_refresh_token [${accountNumber}] = $1 WHERE id = $2;`, [db_token, id]);
      return encodedToken
    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    console.log(error)
  }
}

async function refreshUserToken(id, refreshString, accountNumber, created_at) {
  try {
    let result = await db.query('select "user_refresh_token" FROM user_info WHERE id = $1', [id]);
    if (result.rowCount == 0) {
      throw new Error('row count is 0');
    }
    if (result.rows[0].user_refresh_token[accountNumber].user_refresh_token != refreshString) {
      console.log("osaindoinsncao")
      newRefreshTokens = result.rows[0].user_refresh_token
      newRefreshTokens[accountNumber] = {}
      db.query(`UPDATE user_info SET "user_refresh_token" = $1 WHERE id = $2`, [newRefreshTokens, id]);
      throw new Error('user refresh tokens are not the same');
    }
    if (result.rows[0].user_refresh_token[accountNumber].created_at != created_at) {
      console.log("alsmasjcfn")
      newRefreshTokens = result.rows[0].user_refresh_token
      newRefreshTokens[accountNumber] = {}
      db.query(`UPDATE user_info SET "user_refresh_token" = $1 WHERE id = $2`, [newRefreshTokens, id]);
      return false
    }

    user_refresh_token = genSafeRandomStr(20)
    date = Math.floor(Date.now() / 1000)

    token = {
      user_refresh_token: user_refresh_token,
      id: id,
      accountNumber: accountNumber,
      created_at: date
    }

    user_refresh_token = result.rows[0].user_refresh_token
    user_refresh_token[accountNumber] = {
      user_refresh_token: user_refresh_token,
      accountNumber: accountNumber,
      created_at: date
    }

    try {
      console.log(typeof user_refresh_token)
      await db.query(`UPDATE user_info SET "user_refresh_token" = $1 WHERE id = $2;`, [user_refresh_token, id]);
      encodedToken = jwt.encode(token, process.env.JWT_SECRET)
      return encodedToken
    } catch (error) {
      console.log(error)
      console.log("error")
    }
  } catch (error) {
    console.log(error)
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

function convertTimeRangeToQuery(obj) {




  function convertDay(day, dayName) {
    var str = "";
    for (i = 0; i < day.length; i++) {
      if (day[i].length != 3) { return false }
      firstInt = Number(day[i][0])
      secondInt = Number(day[i][2])
      if (0 >= firstInt >= 24) { return false }
      if (0 >= firstInt >= 24) { return false }
      if (day[i][1] != "-") { return false }
      if (((firstInt + 1) != secondInt)) { return false }
      if (i > 0) { dayQuery = ` OR ( '${day[i]}' = ANY ("${dayName}") ) ` }
      else { dayQuery = ` ( '${day[i]}' = ANY ("${dayName}") )` }
      str += dayQuery
    }
    if (str == "") { return false }
    return str
  }
  try {
    var queryString = `AND (`
    if (Object.keys(obj).length != 7) {
      return false
    }
    queryArr = [1, 2, 3, 4, 5, 6]
    queryArr[0] = (convertDay(obj.monday, "mondayTimeTable"))
    queryArr[1] = (convertDay(obj.tuesday, "tuesdayTimeTable"))
    queryArr[2] = (convertDay(obj.wednesday, "wednesdayTimeTable"))
    queryArr[3] = (convertDay(obj.thursday, "thursdayTimeTable"))
    queryArr[4] = (convertDay(obj.friday, "fridayTimeTable"))
    queryArr[5] = (convertDay(obj.saturday, "saturdayTimeTable"))
    queryArr[6] = (convertDay(obj.sunday, "sundaysTimeTable"))
    for (i = 0; i < queryArr.length; i++) {
      if (queryArr[i] != false) {
        if (i == 0) {
          queryString += queryArr[i]
        }
        else {
          queryString += " OR " + queryArr[i]
        }
      }
    }
    queryString += ` )`

    if (queryString == "AND ( )") { return false }
    return queryString + `\r\n`
  } catch (error) {
    return false
  }
}

function convertspecialityArrToQuery(lang, subjectName, specialities) {
  if (specialities == []) { return "" }
  var queryString = `AND (`
  try {
    for (i = 0; i < specialities.length; i++) {
      if (!(isValidSubjectSpeciality(lang, subjectName, specialities[i]))) { return false }
      str = "";
      if (i == 0) { str = ` ( '${specialities[i]}' = ANY (specialities) )` }
      else { str = ` OR ( '${specialities[i]}' = ANY (specialities) )` }
      queryString += str
    }
    if (queryString == "AND (") { return false }
    return queryString + ` ) \r\n`
  }
  catch (err) {
    console.log(err)
    return false

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



  return orderByValidTypes[str] + "\r\n"

}

//ned wrk
function convertSearchByKeywordToQuery(str) {
  queryString = `tsvector @@`

  return false


}

function sendNotification(text, id) {
  try {
    notObj = {
      text: compiledConvert(text),
      created_at: Math.floor(Date.now() / 1000),
      userId: id,
    }
    db.query(`
    INSERT INTO notifications 
    (text, created_at, user_id)
    VALUES ($1, $2, $3)`,
      [notObj.text, notObj.created_at, notObj.userId]);
    global.io.to(`${id}-user`).emit("notification", notObj);

  }
  catch (err) {
    console.log(err)
    throw new Error(`error: ${err}`)
  }
}


function sendNotificationGlobal(id, text) {
  try {
    notObj = {
      text: compiledConvert(text),
      created_at: Math.floor(Date.now() / 1000),
      global: true,
    }
    db.query(`
    INSERT INTO notifications 
    (text, created_at, is_global)
    VALUES ($1, $2, $3)
    WHERE id = $4`,
      [notObj.text, notObj.created_at, notObj.is_global, id]);

    io.emit("notification", notObj);
  }
  catch (err) {
    console.log(err)
  }
}

//ned wrk
async function createChat(studintId, courseId) {


  try {
    result = await db.query(`
    SELECT *
    FROM teacher_course 
    FULL OUTER  JOIN  user_info  
      ON teacher_course.teacherId = user_info.id
    WHERE  teacher_course.courseId = $1;`, [courseId]);


    if (result.rowCount != 1) { //if there isn't a course, return
      return
    }
    if (result.rows[0].user_info == undefined) {
      //if the user doesn't exist, return 
      return
    }
    if (result.rows[0].teacher_course == undefined) {
      //if the course doesn't exist, return 
      return
    }
    if (result.rows[0].user_info.banned_users.inludes()) {
      //if the user is banned by the teacher, return
      return
    }


    try {
      db.query(`INSERT INTO chat (student_id, teacher_id, "created_at") 
                VALUES ($1, $2, $3) 
                RETURNING *`, [id, user_refresh_token, accountNumber]);
    } catch (error) {
      console.log(error)
    }
    try {
      db.query(`UPDATE user_info 
                SET chatIds  = array_append(chatIds , $1); 
                WHERE id = $2`, [result.rows[0].chatIds, id]);
    } catch (error) {
      console.log(error)
    }
    try {
      db.query(`UPDATE user_info 
                SET chatIds  = array_append(chatIds , $1);
                WHERE id = $2`, [result.rows[0].chatIds, id]);
    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    console.log(error)
  }
}
//ned wrk
async function sendMessage(id, text, chatId) {
  text = compiledConvert(text)
  messagesObj = {
    text: text,
    created_at: Math.floor(Date.now() / 1000),
    userId: id,
    chatId: chatId
  }
  try {
    db.query(`INSERT INTO message VALUES ($1) WHERE chatId = $2 AND (teacherId = $3 OR studentId = $3)`, [messagesObj, chatId, id], (err, result) => {
      if (err) {
        console.log(err)
      }
    })

  }
  catch (err) {
    console.log(err)
  }
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
  refreshUserToken,
  encrypt,
  decrypt,
  sendMessage,
  isValidSubject,
  isValidSubjectSpeciality,
  isValidSubjectSpecialityNoSubject,
  createChat,
  convertTimeRangeToQuery,
  convertspecialityArrToQuery,
  convertOrderByToQuery,
  convertSearchByKeywordToQuery,
  isTrue,
  isInt,
  langugeToLanguageCode,
  isValidAvailableTimes,
  sendNotification,
  sendNotificationGlobal,
  escapeStr,
  unEscapeStr,

}

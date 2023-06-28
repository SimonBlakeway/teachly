const { get } = require('axios');

//TODO IMPORTANT, the port number has change from 3001 to 8000, since 
//it's the better port for development
//on both facebook and 


/* 
  these functions are here so the more complicated 
  functions aren't clutered, they basically just generate 
  urls using variables from config and the usercode/refresh token,
  if there is a problem is might be because the facebook api has changed,
  check out https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
  if there is any problems
*/
function getUserDetailsUrl(access_token, user_id) {
  getDetailURL = `https://graph.facebook.com/${user_id}?fields=id,name,email,picture&access_token=${access_token}`
  return getDetailURL
  }
function getUserIDUrl(access_token) {
  getIDURL = `https://graph.facebook.com/debug_token?input_token=${access_token}&access_token=${process.env.FACEBOOK_APP_ACCESS_TOKEN}`
  return getIDURL
  }
function getAccessTokenUrl(code) {
  getTokenURL = `https://graph.facebook.com/v15.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${"http://localhost:3001/oauth2/redirect/facebook"}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`
  return  getTokenURL
  }
function getConnectionUrl() {
  return  `https://www.facebook.com/v15.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${'http://localhost:3001/oauth2/redirect/facebook'}&state=${"{st=state123abc,ds=123456789}"}`
  }



async function getAccessTokenFromCode(code) {
  //the code is originally immbeded in a url, but before calling this function I separatated it
  //the access token is used to get data from facebook, life email addresses
  //all the other functions call this one, that way the can all accept the code just, I thought doing it like this would be cleaner
  getTokenURL = getAccessTokenUrl(code)
  res = await get(getTokenURL)
  return res.data.access_token
}
async function getUserID(code) {
  access_token = await getAccessTokenFromCode(code) 
  user_ID_URL = getUserIDUrl(access_token)
  res = await get(user_ID_URL)
  return res.data.data.user_id
}
async function getUserDetails(code) {
  access_token = await getAccessTokenFromCode(code) 
  user_ID_URL = getUserIDUrl(access_token)
  res = await get(user_ID_URL)
  user_id = res.data.data.user_id
  getDetailsURL = getUserDetailsUrl(access_token, user_id) //to get userdetails you need both the user_id and the access_token
  res = await get(getDetailsURL)
  return res.data
}


module.exports = {
    getConnectionUrl,
    getUserDetails,
    getUserID,
};

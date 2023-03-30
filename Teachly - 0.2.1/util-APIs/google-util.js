const dotenv = require('dotenv')
dotenv.config({ path: './config/config.env' })
const axios = require('axios');

/*
  the google oauth is very similar to the facebook one
  the flow is almost exactly the same, if there's any isues 
  it might be because the right api hasn't been enabled, 
  if there's still an issue the API might have become legacy
  or 
*/

async function getConnectionUrl() {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Foauth2%2Fredirect%2Fgoogle`
  return url 
}

async function getAcccesToken(code) {
//to get any details from the google api you need the access token, so I decided it needs it's own function

// the api docs said POST request instead of GET, in practice is doesn't make too much difference
  res = await axios({
    method: 'post',
    url: 'https://oauth2.googleapis.com/token',
    data: {
        'code': code,
        'client_id': process.env.GOOGLE_CLIENT_ID,
        'client_secret': process.env.GOOGLE_CLIENT_SECRET,
        'redirect_uri': "http://localhost:3001/oauth2/redirect/google",
        'grant_type': 'authorization_code'
            },
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
  });
  return res.data.access_token
}
async function getUserDetails(code) {
    accessToken = await getAcccesToken(code) 
    const { data } = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return data

}
  async function getUserID(code) {
    accessToken = await getAcccesToken(code) 
    const { data } = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return data.id

}    

module.exports = {
    getConnectionUrl,
    getUserDetails,
    getUserID,
};
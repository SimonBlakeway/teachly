dotenv = require('dotenv')
dotenv.config({ path: './config/config.env' }) // to get api key
const { get } = require('axios');

//url for the currency api
Currency_API_URL = ` https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_API_KEY}/latest/USD`
global.currencyObj = {}


/*s
  the solution I'm using for the api is pretty straightforward,
  the only I'm making a GET request to an api that returns a json
  object containg all currency convertion ratios using USD as the 
  base, the same as how it's stored in the database, and I'm storing
  the json object as a global variable for easy access and easy updates,
  since the ratios will get updated a lot and by doing it like this instead 
  of anything else seemed to be the best implementation, if I find a better 
  one I'll do it
*/

function CurrencyAPISetup() {
  //the header is there to fix a bug
  get(Currency_API_URL, { headers: { "Accept-Encoding": "gzip,deflate,compress" } }).then((res, err) => {
    if (err) { console.log(err) }
    else { global.currencyObj = res.data }
  })
    .then(res => {
      setInterval(() => {
        get(Currency_API_URL, { headers: { "Accept-Encoding": "gzip,deflate,compress" } })
          .then(res => {
            global.currencyObj = res.data
          })
          .catch(err => {
            console.log("err 2")
            CurrencyAPISetup()
          });
      }, 1800000) // half an hour in milliseconds
    })
    .catch(err => {
      console.log("err")
      CurrencyAPISetup()
    })
  /*
      the timeout time is worked out by how often I can make a call to the api,
      on the free version it's 1500/month, and the number chosen uses of as 
      many of those as possible paced evenly, while also being a whole number
  */
}



exports.CurrencyAPISetup = CurrencyAPISetup

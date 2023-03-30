const dotenv = require('dotenv');
dotenv.config(dotenv.config({ path: './config/config.env' }));
const { Pool } = require('pg');
 
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER_INFO_USER,
  password: process.env.POSTGRES_USER_INFO_PASSWORD,
  })
 
console.log("connected to postgeSQL database " + process.env.POSTGRES_DATABASE)  

module.exports = {
  async query(text, params) {
    //const start = Date.now()
    const res = await pool.query(text, params)
    //const duration = Date.now() - start
    //console.log('executed query', { text, duration, rows: res.rowCount })
    return res
  },
}




/**
 * 
 * When an async function or Promise throws an uncaught error, or when the catcher also throws, such as with your

throw error;
this means that the caller of the function will be faced with a rejected Promise to deal with. If you're using await in the caller, then you'll also have to use try/catch in the caller in order to catch the errors properly:

app.get('/all_users', async (req, res) => {
  try {
    const users = await queries.getAllUsers();
    console.log(users);
  } catch(e) {
    // handle errors
  }
});
Another way to resolve the error without having to use try/catch in the consumer would be not to throw the error in your catch:

async function getAllUsers() {
  let response;
  try {
    result = await db.query('select * FROM users');
  
    
    
  } catch (error) {
    console.log(error)
  }
}
but this will make it harder for the consumer to know when there was an error.

In this particular case, the async/await/try/catch constructions add a lot of syntax noise without much benefit IMO - for the moment, you might consider using plain Promises instead:

const getAllUsers = () => pool.query('select * FROM users')
  .then(response => response.rows);

// and:
app.get('/all_users', (req, res) => {
  queries.getAllUsers()
    .then((users) => {
      console.log(users);
    })
    .catch((err) => {
      // handle errors
    });
});
async and await shines when you have a few .thens that you'd like to look flatter in your code. If there's only one .then, IMO there's not much benefit to transforming it into async/await syntax. Of course, it's up to you.
 */





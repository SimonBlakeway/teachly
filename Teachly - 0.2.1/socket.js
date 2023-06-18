const jwt = require('jwt-simple');
const { Server } = require('socket.io');
const db = require('./config/db');
const cookieParser = require('cookie-parser');
const { token } = require('morgan');


function cookiePrep(str) {

  /*
  arr = str.split("; ").map(x => {
    return x.split("=")
  })
  obj = {}
  for (i = 0; i < arr.length; i++) {

    try {
      obj[`${arr[i][0]}`] = jwt.decode(arr[i][1], process.env.JWT_SECRET)
    } catch (error) {
      obj[`${arr[i][0]}`] = arr[i][1]

    }
  }
  return obj

  */


  arr = str.split("; ").map(x => {
    return x.split("=")
  }).flat()

  obj = {}

  obj.user_refresh_token = jwt.decode(arr[((arr.indexOf("user_refresh_token")) + 1)], process.env.JWT_SECRET)
  obj.userCookie = jwt.decode(arr[arr.indexOf("userCookie") + 1], process.env.JWT_SECRET)

  return obj


}
//result = await db.query(`select * FROM notifications WHERE user_id = $1 OR is_global = $2`, [id, true]);

async function sendNotifications(id) {
  try {
    result = await db.query(`select * FROM notifications WHERE user_id = $1 OR (is_global = $2 AND $3 != ANY(deleted_by))`, [id, true, id]);
    if (result.rowCount != 0) {
      io.to(`${id}-user`).emit("old notifications", result.rows);
    }
  } catch (error) {
    console.log(error)
  }

}





//socketio.js
module.exports = {
  setIo: (server) => {
    const io = new Server(server);




    io.engine.use(cookieParser())
    io.engine.use((req, res, next) => {
      try {
        now = Math.floor(Date.now() / 1000)
        userToken = jwt.decode(req.cookies.user_refresh_token, process.env.JWT_SECRET)
        userCookie = jwt.decode(req.cookies.userCookie, process.env.JWT_SECRET)

        if (userToken.id != userCookie.id) { throw new Error("user token and cookie have different ids") }
        else if (((now - userToken.created_at) > (60 * 15))) {
          return
        } //if expired just ignore
        else { next() }

      } catch (error) {
        console.log(error)
        try {
          res.clearCookie('userCookie');
        } catch (error) {
        }
        try {
          malUserToken = req.cookies.user_refresh_token
          res.clearCookie('user_refresh_token');
          parseJwt(req.cookies.user_refresh_token)
          db.query(`UPDATE user_info SET user_refresh_token [ ${malUserToken.accountNumber} ] = $1 WHERE id = $2;`, [{}, malUserToken.userId]);

        } catch (error) {
        }
      }
    });


    io.on("connection", function (socket) {
      
      try {
        cookies = cookiePrep(socket.handshake.headers.cookie)
        id = cookies.user_refresh_token.id
        socket.join(`${id}-user`)
        sendNotifications(id)


        socket.on("get messages", () => {
          //activeUsers.delete(socket.userId);
          //io.emit("user disconnected", socket.userId);
        });

        socket.on("message user", function (data) {
          //io.emit("chat message", data);
        });

        socket.on("send message", async function (data) {
          try {
            console.log("success")
            console.log(data)
            //sendMessage(id = cookies.user_refresh_token.id, data.text, data.chatId)


          } catch (error) {
            console.log(error)
          }
        });

        socket.on("delete notification", async function (data) {
          try {
            result = await db.query(`DELETE FROM notifications WHERE notification_id = $1 AND user_id = $2 AND is_global = $3;`, [data, cookies.user_refresh_token.id, false]);


            result = await db.query(`UPDATE notifications SET deleted_by = array_append( deleted_by, $1) WHERE notification_id = $2  AND is_global = $3)`, [cookies.user_refresh_token.id, data, false]);
          } catch (error) {
            console.log(error)
          }
        });

        socket.on("disconnect", (reason) => {
          // ...
        });

      }
      catch (err) {
        console.log(err)
        socket.disconnect()
        return
      }



    });

    global.io = io
  }
}
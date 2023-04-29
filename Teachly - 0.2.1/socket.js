const jwt = require('jwt-simple');
const { Server } = require('socket.io');
const db = require('./config/db');

function cookiePrep(str) {
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
}

async function sendNotifications(id) {
  try {
    result = await db.query(`select * FROM notifications WHERE user_id = $1 OR is_global = $2`, [id, true]);
    if (result.rowCount != 0) {
      io.to(`${id}-user`).emit("old notifications", result.rows);
    }
  } catch (error) {
    console.log(error)
  }
}

async function sendMessagesNotifications(id) {
  try {
    result = await db.query(`
    SELECT 
      messages.text, 
      messages.created_at, 
      messages.chat_id,
      user_info.name 
    FROM messages
    JOIN user_info ON messages.user_id = user_info.id
    WHERE messages.user_id = $1`, [id])
    if (result.rowCount != 0) {
      io.to(`${id}-user`).emit("old messages", result.rows); // WHERE 'messages.userId' = $1`, [id])
    }
  } catch (error) {
    console.log(error)
  }
}

//socketio.js
module.exports = {
  setIo: (server) => {
    const io = new Server(server);
    io.on("connection", function (socket) {
      console.log("user connected")
      let cookies = {}
      try {
        cookies = cookiePrep(socket.handshake.headers.cookie)
        if (Object.keys(cookies.user_refresh_token) == 0) {
          socket.disconnect()
          return
        }
        id = cookies.user_refresh_token.id
        rooms = cookies.userCookie.chatIds

        socket.join(`${id}-user`)
        for (let i = 0; i < rooms.length; i++) {
          socket.join(`${rooms[i]}-chat`)
        }
        sendMessagesNotifications(id)
        sendNotifications(id)



        socket.on("get messages", () => {
          //activeUsers.delete(socket.userId);
          //io.emit("user disconnected", socket.userId);
        });

        socket.on("message user", function (data) {
          //io.emit("chat message", data);
        });

        socket.on("delete notification", async function (data) {
          try {
            result = await db.query(`DELETE FROM notifications WHERE notification_id = $1 AND user_id = $2 ;`, [data, cookies.user_refresh_token.id]);
          } catch (error) {
            console.log(error)
          }
        });


        socket.on("disconnect", (reason) => {
          // ...
        });

      }
      catch (err) {
        socket.disconnect()
        return
      }



    });

    global.io = io
  }
}
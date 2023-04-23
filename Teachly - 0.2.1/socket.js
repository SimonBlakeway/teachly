const jwt = require('jwt-simple');
const { Server } = require('socket.io');


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

function sendNotifications() {
  
}

//socketio.js
module.exports = {
  setIo: (server) => {
    const io = new Server(server);
    io.on("connection", function (socket) {
      cookies = cookiePrep(socket.handshake.headers.cookie)
      console.log("ree")
      if (Object.keys(cookies.userRefreshToken) == 0) { socket.disconnect() }

/*
      socket.on("new user", function (data) {
        socket.userId = data;
        activeUsers.add(data);
        io.emit("new user", [...activeUsers]);
      });

      socket.on("disconnect", () => {
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", socket.userId);
      });

      socket.on("chat message", function (data) {
        io.emit("chat message", data);
      });

      socket.on("typing", function (data) {
        socket.broadcast.emit("typing", data);
      });

      */
    });
    
    global.io = io
  }
}
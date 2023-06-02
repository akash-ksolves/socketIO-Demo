require("dotenv").config();
const fs = require("fs");
const app = require("express")();

const secureOptions = {
  key: fs.readFileSync("./Keys/private_key.pem", "utf-8"), // need to pass path for secret key amd certificate file
  cert: fs.readFileSync("./Keys/certificate.pem", "utf-8"),
};

const corsOptions = {
  cors: {
    origin: "*",
  },
};

const https = require("https").createServer(secureOptions, app);
const io = require("socket.io")(https, corsOptions);

const PORT = process.env.PORT || 8088;

// Handle WebSocket connections

io.on("connection", (socket) => {
  console.log("WebSocket connected");

  const room = (Math.random() + 1).toString(36).substring(7);

  socket.join(room);

  // socket.on("create", (room) => {
  //   // There is no arguments for creating room as of now, but we can provide room name as per client side requests
  //   socket.join(room); //here room is passed as a room name we can make it dynamic also
  // });

  // Handle WebSocket messages
  socket.on("message", (message) => {
    console.log(`Received message: ${message}`);
    // socket.to(room).emit("message", message);

    // to normal users
    // socket.broadcast.emit("message", message);
    // io.emit("message", message);

    // to only in rooms
    io.sockets.in(room).emit("message", message);
    // console.log("rooms", io.sockets.adapter.rooms);
    // console.log(io.sockets.adapter.rooms.get(socket.id));
  });

  // Handle WebSocket disconnections
  socket.on("disconnect", () => {
    socket.leave(room); // Remove the socket from the room
    console.log("WebSocket disconnected");
  });
});

// Start HTTPS server
https.listen(PORT, () => console.log(`server is listening on ${PORT}`));

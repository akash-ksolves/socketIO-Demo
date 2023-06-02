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

  // Handle WebSocket messages
  socket.on("message", (message) => {
    io.sockets.in(room).emit("message", message);
  });

  // Handle WebSocket disconnections
  socket.on("disconnect", () => {
    socket.leave(room); // Remove the socket from the room
    console.log("WebSocket disconnected");
  });
});

// Start HTTPS server
https.listen(PORT, () => console.log(`server is listening on ${PORT}`));

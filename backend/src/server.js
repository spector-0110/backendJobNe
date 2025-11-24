// src/server.js
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initGridFS } from "./config/gridfs.js";
import socketHandler from "./sockets/socket.handler.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  console.log("Starting server...");
  
  try {
    await connectDB();
    console.log("Database connected successfully");
    
    // Initialize GridFS after DB connection
    initGridFS();
    console.log("GridFS initialized successfully");
  } catch (err) {
    console.warn("⚠️  Database connection failed:", err.message);
    console.warn("⚠️  Server will start without database functionality");
  }

  try {
    // Create HTTP server (required for Socket.IO)
    const server = http.createServer(app);

    // Create socket server
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_ORIGIN || "*",
        methods: ["GET", "POST"],
      },
    });

    // Register socket events
    io.on("connection", (socket) => socketHandler(socket, io));

    server.listen(PORT, () => {
      console.log(`🚀 Server running with real-time on port ${PORT}`);
      console.log(`📡 Socket.IO enabled`);
      console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_ORIGIN || "*"}`);
      console.log(`💡 Visit: http://localhost:${PORT}/health to check server status`);
    });
  } catch (err) {
    console.error("❌ Error starting HTTP server:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  }
};

startServer();
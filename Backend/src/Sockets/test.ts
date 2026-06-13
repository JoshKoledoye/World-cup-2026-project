import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // On frontend this'll be process.env.VITE_API_URL

socket.on("connect", () => {
  console.log("connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("disconnected");
});

// Basic testing done, next up is proper building. 
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { SOCKET_EVENTS } from "../Config/constants";

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    // Now that we know the basics, we wanna register our handlers and stuff.

    // So go ahead and plan the architechture bro :)

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`❌ ${socket.id} disconnected`);
    });
  });

  return io;
};

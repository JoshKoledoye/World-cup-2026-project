import app from "./app";
import http from "http";
import { env } from "./Config/env";
import { initSocket } from "./Sockets/socket";
import connectDB from "./DB/Connections/mongo";

const server = http.createServer(app);

initSocket(server);
connectDB();

const PORT = env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

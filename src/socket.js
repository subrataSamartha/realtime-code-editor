import { io } from "socket.io-client";
// const dotenv = require("dotenv");
// dotenv.config();

export const initSocket = async () => {
  console.log("i am in");
  const options = {
    "force new connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 1000,
    transports: ["websocket"],
  };

  return io(process.env.REACT_APP_BACKEND_URL, options);
};

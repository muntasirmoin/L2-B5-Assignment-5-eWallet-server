import { Server } from "http";

export const gracefulShutdown = (server: Server | null, code = 1) => {
  if (server) {
    server.close(() => {
      console.log("Server closed. Exiting process.");
      process.exit(code);
    });
  } else {
    console.log("No server instance found. Exiting process.");
    process.exit(code);
  }
};

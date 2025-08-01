import { Server } from "http";
import mongoose from "mongoose";

import { envVars } from "./app/config/env";
import app from "./app";
import { gracefulShutdown } from "./app/utils/gracefulShutdown";
import { seedAdmin } from "./app/utils/seedAdmin ";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);

    console.log("Connected to eWallet DataBase!");
    server = app.listen(envVars.PORT, () => {
      console.log(`eWallet Server is listening on port: ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await startServer();
  await seedAdmin();
})();

process.on("unhandledRejection", (err) => {
  console.log("unhandled rejection detected... server shuting down..:", err);
  gracefulShutdown(server, 1);
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception Detected! server shuting down!!!", err);
  gracefulShutdown(server, 1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM Signal Received! server shuting down!!!");
  gracefulShutdown(server, 0);
});

process.on("SIGINT", () => {
  console.log("SIGINT Signal Received! Server Shutting down gracefully.!!!");
  gracefulShutdown(server, 0);
});

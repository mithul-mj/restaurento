import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import allRoutes from "./routes/index.js";
import { setupReservation } from "./socket/reservationSocket.js";
import { initExpiryListener } from "./services/expiryListener.js";
import { seedAdmin } from "./utils/seedAdmin.js";
import { env } from "./config/env.config.js";
import { setupNotifications } from "./socket/notificationSocket.js";
import { globalLimiter } from "./middlewares/rateLimiter.middleware.js";

connectDB();
seedAdmin();
// API System Initialized

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
  },
});

app.use(morgan("dev"));

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(globalLimiter);

app.use(allRoutes);

setupReservation(io);
initExpiryListener(io);
setupNotifications(io);
app.set("io", io)

server.listen(env.PORT, () => {
  console.log("Server & Sockets running on ", env.PORT);
});

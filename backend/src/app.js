import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import allRoutes from "./routes/index.js";
import { seedAdmin } from "./utils/seedAdmin.js";
import { env } from "./config/env.config.js";

connectDB();
seedAdmin();

const app = express();
app.use(morgan("dev"));

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(allRoutes);

app.listen(env.PORT, () => {
  console.log("server running");
});

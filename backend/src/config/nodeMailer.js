import { env } from "./env.config.js";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export default transporter;

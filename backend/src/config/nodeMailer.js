import { env } from "./env.config.js";
import nodemailer from "nodemailer";
import brevoTransport from "nodemailer-brevo-transport";

const transporter = nodemailer.createTransport(
  new brevoTransport({
    apiKey: env.BREVO_API_KEY,
  })
);

export default transporter;

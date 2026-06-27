import transporter from "../config/nodeMailer.js";
import { env } from "../config/env.config.js";

export const sendEmail = async (to, subject, text, html) => {
  const info = await transporter.sendMail({
    from: env.SENDER_EMAIL,
    to,
    subject,
    text,
    html,
  });

  return info;
};

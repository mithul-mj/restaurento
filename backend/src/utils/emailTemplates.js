export const getOtpEmailTemplate = (otp, userName = "Foodie") => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        /* Resets to ensure consistent rendering across clients */
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; }
        table { border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background-color: #ff6b6b; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px; }
        .content { padding: 40px 30px; color: #333333; text-align: center; }
        .otp-box { background-color: #fff0f0; border: 2px dashed #ff6b6b; border-radius: 8px; padding: 15px 30px; margin: 25px 0; display: inline-block; }
        .otp-code { font-size: 32px; font-weight: bold; color: #ff6b6b; letter-spacing: 5px; margin: 0; }
        .footer { background-color: #333333; padding: 20px; text-align: center; font-size: 12px; color: #cccccc; }
        .footer a { color: #ff6b6b; text-decoration: none; }
      </style>
    </head>
    <body>
      
      <table>
        <tr>
          <td class="header">
            <h1>Restaurento 🍽️</h1>
          </td>
        </tr>

        <tr>
          <td class="content">
            <h2 style="margin-top: 0; color: #333;">Email Verification</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #555;">
              Hi ${userName},<br><br>
              Welcome to <b>Restaurento</b>! We are excited to have you on board. Please use the One-Time Password (OTP) below to verify your email address and start booking your favorite tables.
            </p>

            <div class="otp-box">
              <p class="otp-code">${otp}</p>
            </div>

            <p style="font-size: 14px; color: #777; margin-top: 20px;">
              This code is valid for <b>2 minutes</b>. Do not share this code with anyone.
            </p>
            
            <p style="font-size: 14px; color: #999; margin-top: 30px;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </td>
        </tr>

        <tr>
          <td class="footer">
            <p>&copy; ${new Date().getFullYear()} Restaurento Inc. All rights reserved.</p>
            <p>123 Foodie Lane, Flavor Town, FT 56789</p>
            <p><a href="#">Privacy Policy</a> | <a href="#">Contact Support</a></p>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
};

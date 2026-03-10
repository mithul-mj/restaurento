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

export const getPreApprovalEmailTemplate = (userName = "Restaurant Partner") => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Received</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; }
        table { border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background-color: #ff6b6b; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px; }
        .content { padding: 40px 30px; color: #333333; text-align: center; }
        .status-box { background-color: #fff0f0; border: 2px dashed #ff6b6b; border-radius: 8px; padding: 15px 30px; margin: 25px 0; display: inline-block; }
        .status-text { font-size: 24px; font-weight: bold; color: #ff6b6b; margin: 0; }
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
            <h2 style="margin-top: 0; color: #333;">Application Received</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #555;">
              Hi ${userName},<br><br>
              Thank you for completing your pre-approval application! We have successfully received your details and documents. Our team is currently reviewing them.
            </p>

            <div class="status-box">
              <p class="status-text">Status: Pending</p>
            </div>

            <p style="font-size: 14px; color: #777; margin-top: 20px;">
              You will be notified via email once the verification is complete. This usually takes 24-48 hours.
            </p>
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p>&copy; ${new Date().getFullYear()} Restaurento Inc. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const getVerificationStatusEmailTemplate = (
  userName = "Restaurant Partner",
  status,
  reason = ""
) => {
  const isApproved = status === "approved";
  const title = isApproved ? "Application Approved! 🎉" : "Application Status Update";
  const statusColor = isApproved ? "#28a745" : "#dc3545";
  const statusBg = isApproved ? "#e6ffed" : "#ffe6e6";
  const statusBorder = isApproved ? "#28a745" : "#dc3545";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; }
        table { border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background-color: #ff6b6b; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px; }
        .content { padding: 40px 30px; color: #333333; text-align: center; }
        .status-box { background-color: ${statusBg}; border: 2px dashed ${statusBorder}; border-radius: 8px; padding: 15px 30px; margin: 25px 0; display: inline-block; }
        .status-text { font-size: 24px; font-weight: bold; color: ${statusColor}; margin: 0; text-transform: capitalize; }
        .reason-box { background-color: #f8f9fa; border-left: 4px solid ${statusBorder}; padding: 15px; margin-top: 20px; text-align: left; }
        .footer { background-color: #333333; padding: 20px; text-align: center; font-size: 12px; color: #cccccc; }
        .footer a { color: #ff6b6b; text-decoration: none; }
        .action-button { background-color: #ff6b6b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 20px; }
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
            <h2 style="margin-top: 0; color: #333;">${title}</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #555;">
              Hi ${userName},<br><br>
              ${isApproved
      ? "Congratulations! Your restaurant verification has been approved. You can now access your dashboard and start managing your restaurant."
      : "We have reviewed your application and unfortunately, we cannot approve it at this time."
    }
            </p>

            <div class="status-box">
              <p class="status-text">Status: ${status}</p>
            </div>

            ${!isApproved && reason
      ? `
              <div class="reason-box">
                <p style="margin: 0; font-weight: bold; color: #555;">Rejection Reason:</p>
                <p style="margin: 5px 0 0 0; color: #666; font-style: italic;">"${reason}"</p>
              </div>
              <p style="font-size: 14px; color: #777; margin-top: 20px;">
                Please address the issues mentioned above and resubmit your application.
              </p>
            `
      : ""
    }

            ${isApproved
      ? `<a href="#" class="action-button" style="color: #ffffff;">Go to Dashboard</a>`
      : `<a href="#" class="action-button" style="color: #ffffff;">Resubmit Application</a>`
    }
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p>&copy; ${new Date().getFullYear()} Restaurento Inc. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const getBookingConfirmationEmailTemplate = (booking, restaurant, userName = "Valued Guest") => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.checkInToken || 'invalid'}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmed!</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background-color: #ff5e00; padding: 40px 20px; text-align: center; color: white; }
        .qr-section { padding: 40px 20px; text-align: center; background-color: #ffffff; border-bottom: 1px dashed #eee; }
        .details-section { padding: 30px; color: #4b5563; }
        .detail-item { margin-bottom: 20px; display: flex; align-items: start; }
        .footer { background-color: #1f2937; padding: 25px; text-align: center; font-size: 12px; color: #9ca3af; }
        .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; background-color: #f0fdf4; color: #16a34a; font-weight: bold; font-size: 12px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0; font-size: 28px;">Booking Confirmed! 🎉</h1>
          <p style="margin:10px 0 0 0; opacity: 0.9;">We're excited to see you at ${restaurant.restaurantName}</p>
        </div>

        <div class="qr-section">
          <div class="badge">SECURE CHECK-IN CODE</div>
          <div style="margin: 20px auto; width: 220px; padding: 10px; border: 1px solid #eee; border-radius: 12px;">
            <img src="${qrCodeUrl}" alt="Check-in QR Code" style="width: 100%; display: block;">
          </div>
          <p style="font-size: 14px; color: #6b7280; max-width: 250px; margin: 0 auto;">Present this QR code at the restaurant to check-in instantly.</p>
        </div>

        <div class="details-section">
          <h3 style="color: #111827; margin-top: 0;">Reservation Details</h3>
          <p style="font-size: 15px; margin: 8px 0;"><b>Date:</b> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
          <p style="font-size: 15px; margin: 8px 0;"><b>Guests:</b> ${booking.guests} People</p>
          <p style="font-size: 15px; margin: 8px 0;"><b>Address:</b> ${restaurant.address}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
            <p style="font-size: 13px; color: #9ca3af;">Booking Reference: #BK${booking._id.toString().slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div class="footer">
          <p style="margin:0;">&copy; ${new Date().getFullYear()} Restaurento. All rights reserved.</p>
          <p style="margin:10px 0 0 0;">Need help? <a href="#" style="color: #ff5e00; text-decoration: none;">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

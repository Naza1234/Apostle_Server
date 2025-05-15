const nodemailer = require("nodemailer");
require("dotenv").config();

const EMAIL = process.env.EMAIL_USER;
const PASSWORD = process.env.EMAIL_PASS;



const ContactUsEmail = (data) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  // Define mail options
  const mailOptions = {
    from: EMAIL,
    to: EMAIL,
    subject: "New Contact Form Submission from Apostle Website",
    html: `
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#F5F5F5;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:16px 24px 16px 24px;text-align:center">
                <img
                  alt="Sample product"
                  src="https://i.im.ge/2025/05/14/vgKDWX.Apostle.png"
                  width="100"
                  style="width:100px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:0px 24px 0px 24px"
              >
                Hi Admin,
              </h3>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  A new message has been submitted through the Contact Us form.
                  Here are the details:
                </p>
              </div>
              <div style="font-weight:normal;padding:0px 24px 0px 24px">
                <p>
                  Name: ${data.UserName}<br />Email: ${data.Email}<br />Phone
                  Number: ${data.PhNo}<br />Subject: ${data.Subject}<br />Message:<br />${Data.Massage}
                </p>
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  Please follow up with the user as soon as possible if action
                  is required.
                </p>
                <p>Regards,</p>
              </div>
              <div
                style="font-size:14px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>Apostle Website Notification System</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};


const SendCustomMessages = (to,UserName,Subject,Message) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  // Define mail options
  const mailOptions = {
    from: EMAIL,
    to: to,
    subject: `${Subject}`,
    html: `
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#F5F5F5;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:16px 24px 16px 24px;text-align:center">
                <img
                  alt="Sample product"
                  src="https://i.im.ge/2025/05/14/vgKDWX.Apostle.png"
                  width="100"
                  style="width:100px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:0px 24px 0px 24px"
              >
                Hi ${UserName},
              </h3>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  This is a message from the Apostle team regarding your account
                  or recent activity.
                </p>
              </div>
              <div style="font-weight:normal;padding:16px 24px 16px 24px">
                ${Message}
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  We’re here to help and ensure your experience with Apostle
                  remains smooth and reliable.
                </p>
                <p>Warm regards,</p>
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>The Apostle Team<br />[Website URL]</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};


const SendReserveEmail = (to,UserName,data) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  // Define mail options
  const mailOptions = {
    from: EMAIL,
    to: to,
    subject: " Your Apostle Power Bank Reservation Is Confirmed",
    html: `
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#F5F5F5;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:16px 24px 16px 24px;text-align:center">
                <img
                  alt="Sample product"
                  src="https://i.im.ge/2025/05/14/vgKDWX.Apostle.png"
                  width="100"
                  style="width:100px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:12px 24px 0px 24px"
              >
                Hi ${UserName},
              </h3>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  We&#39;ve received your reservation for a ${data.Type} Apostle
                  power bank
                </p>
              </div>
              <div
                style="font-size:14px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>
                  We’ll hold it for you until:<br />⏰ Reservation Expiry Time:
                  ${data.Time}
                </p>
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  Please make sure to collect it before this time, or the
                  reservation will be canceled and the power bank released back
                  into availability.
                </p>
                <p>
                  If you need help or have any questions, feel free to contact
                  us.
                </p>
                <p>Thanks for choosing Apostle!</p>
              </div>
              <div
                style="font-size:14px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>Best regards,<br />The Apostel Team</p>
              </div>
              <div
                style="font-size:12px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                [Website URL]
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};



const ForGotPassword = (to,UserName,WebsiteUrl) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  // Define mail options
  const mailOptions = {
    from: EMAIL,
    to: to,
    subject: "Reset Your Apostle Account Password",
    html: `
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#F5F5F5;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:16px 24px 16px 24px;text-align:center">
                <img
                  alt="Sample product"
                  src="https://i.im.ge/2025/05/14/vgKDWX.Apostle.png"
                  width="100"
                  style="width:100px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:0px 24px 0px 24px"
              >
                Hi ${UserName},
              </h3>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  We received a request to reset the password for your Apostle
                  account.<br />If you made this request, click the button below
                  to set a new password:
                </p>
              </div>
              <div style="text-align:center;padding:0px 24px 0px 24px">
                <a
                  href="${WebsiteUrl}"
                  style="color:#FFFFFF;font-size:16px;font-weight:bold;background-color:#0891B2;border-radius:4px;display:block;padding:12px 20px;text-decoration:none"
                  target="_blank"
                  ><span
                    ><!--[if mso
                      ]><i
                        style="letter-spacing: 20px;mso-font-width:-100%;mso-text-raise:30"
                        hidden
                        >&nbsp;</i
                      ><!
                    [endif]--></span
                  ><span>Reset My Password</span
                  ><span
                    ><!--[if mso
                      ]><i
                        style="letter-spacing: 20px;mso-font-width:-100%"
                        hidden
                        >&nbsp;</i
                      ><!
                    [endif]--></span
                  ></a
                >
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  This link will expire in 30 minutes for your security.<br />If
                  you didn’t request a password reset, you can safely ignore
                  this email.
                </p>
                <p>Stay secure,</p>
              </div>
              <div
                style="font-size:14px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>The Apostle Team<br />[Website URL]</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};


const RentalReturned = (to,UserName,data) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  // Define mail options
  const mailOptions = {
    from: EMAIL,
    to: to,
    subject: "Power Bank Return Confirmed – Thank You!",
    html:`
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#F5F5F5;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:16px 24px 16px 24px;text-align:center">
                <img
                  alt="Sample product"
                  src="https://i.im.ge/2025/05/14/vgKDWX.Apostle.png"
                  width="100"
                  style="width:100px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:0px 24px 0px 24px"
              >
                Hi ${UserName},
              </h3>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  We’ve successfully received the return of your ${data.Type}
                  Apostle power bank.
                </p>
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  Details:<br />🔋 Serial Number:${data.SnNo}<br />📦 Return
                  Date &amp; Time:${data.Time}<br />✅ Status: Returned
                </p>
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  Thank you for returning the power bank on time. You can view
                  your full rental history and billing details by logging into
                  your Apostle account.
                </p>
                <p>
                  We appreciate you using our service and look forward to
                  keeping you powered up again soon!
                </p>
                <p>Best regards,</p>
              </div>
              <div
                style="font-size:14px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>The Apostle Team<br />[Website URL]</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};


const SendRentalEmail = (to ,UserName,data) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  // Define mail options
  const mailOptions = {
    from: EMAIL,
    to: to,
    subject: "Your Apostle Power Bank Rental Has Started",
    html: `
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#F5F5F5;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:16px 24px 16px 24px;text-align:center">
                <img
                  alt="Sample product"
                  src="https://i.im.ge/2025/05/14/vgKDWX.Apostle.png"
                  width="100"
                  style="width:100px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:12px 24px 0px 24px"
              >
                Hi ${UserName},
              </h3>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  our rental for a ${data.Type} Apostle power bank has
                  officially started.
                </p>
              </div>
              <div
                style="font-size:14px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>
                  Details:<br />🔋 Power Bank Serial Number: ${data.SnNo}<br />🕒
                  Start Time: ${data.StartTime}<br />⏰ Return Before:
                  ${data.EndTime}
                </p>
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  Please ensure you return the power bank before the return time
                  to avoid any late fees.
                </p>
                <p>
                  You can track your rental status and return location anytime
                  by logging into your Apostle account.
                </p>
                <p>Thanks for renting with us!</p>
              </div>
              <div
                style="font-size:14px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>Best regards,<br />The Apostel Team</p>
              </div>
              <div
                style="font-size:12px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                [Website URL]
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};



const SendReserveEndingEmail = (to ,UserName,data) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  // Define mail options
  const mailOptions = {
    from: EMAIL,
    to: to,
    subject: "Your Apostle Power Bank Reservation Is Ending Soon",
    html: `
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#F5F5F5;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:16px 24px 16px 24px;text-align:center">
                <img
                  alt="Sample product"
                  src="https://i.im.ge/2025/05/14/vgKDWX.Apostle.png"
                  width="100"
                  style="width:100px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:12px 24px 0px 24px"
              >
                Hi ${UserName},
              </h3>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  Just a quick reminder that your reservation for a ${data.Type}
                  Apostle power bank is about to expire.
                </p>
              </div>
              <div
                style="font-size:14px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>
                  Details:<br />⏰
                  Reservation End Time: ${data.Time}
                </p>
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  Please make sure to collect the power bank before the end
                  time. After that, the reservation will be automatically
                  canceled and made available to other users.
                </p>
                <p>If you have any questions, we’re just a message away.</p>
                <p>Thank you for choosing Apostle!</p>
              </div>
              <div
                style="font-size:14px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>Best regards,<br />The Apostel Team</p>
              </div>
              <div
                style="font-size:12px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                [Website URL]
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};


const SendRentalEndingEmail = (to,UserName,data) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  // Define mail options
  const mailOptions = {
    from: EMAIL,
    to: to,
    subject: "Reminder: Your Apostle Power Bank Rental Ends Soon",
    html: `
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#F5F5F5;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:16px 24px 16px 24px;text-align:center">
                <img
                  alt="Sample product"
                  src="https://i.im.ge/2025/05/14/vgKDWX.Apostle.png"
                  width="100"
                  style="width:100px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:12px 24px 0px 24px"
              >
                Hi ${UserName},
              </h3>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  This is a friendly reminder that your Apostle power bank
                  (${data.Type}) rental is nearing its end.
                </p>
              </div>
              <div
                style="font-size:14px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>
                  Details:<br />🔋 Power Bank Serial Number: ${data.SnNo}<br />⏰
                  Rental End Time: ${data.Time}
                </p>
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  Please ensure you return the power bank before the end time to
                  avoid any additional charges.
                </p>
                <p>
                  If you have any questions or need assistance, feel free to
                  reach out.
                </p>
                <p>Thanks for using Apostle!</p>
              </div>
              <div
                style="font-size:14px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>Best regards,<br />The Apostel Team</p>
              </div>
              <div
                style="font-size:12px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                [Website URL]
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};


const VerificationEmail = (to,UserName,websiteLogInUrl) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  // Define mail options
  const mailOptions = {
    from: EMAIL,
    to: to,
    subject: "Verify Your Email to Activate Your Apostle Account",
    html: `
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#F5F5F5;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:16px 24px 16px 24px;text-align:center">
                <img
                  alt="Sample product"
                  src="https://i.im.ge/2025/05/14/vgKDWX.Apostle.png"
                  width="100"
                  style="width:100px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:12px 24px 0px 24px"
              >
                Hi ${UserName},
              </h3>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>Welcome to Apostle!</p>
                <p>
                  Please confirm your email address to activate your account:
                </p>
              </div>
              <div style="text-align:center;padding:0px 24px 0px 24px">
                <a
                  href="${websiteLogInUrl}"
                  style="color:#FFFFFF;font-size:15px;font-weight:bold;background-color:#0891B2;border-radius:4px;display:block;padding:8px 12px;text-decoration:none"
                  target="_blank"
                  ><span
                    ><!--[if mso
                      ]><i
                        style="letter-spacing: 12px;mso-font-width:-100%;mso-text-raise:18"
                        hidden
                        >&nbsp;</i
                      ><!
                    [endif]--></span
                  ><span>verify my email</span
                  ><span
                    ><!--[if mso
                      ]><i
                        style="letter-spacing: 12px;mso-font-width:-100%"
                        hidden
                        >&nbsp;</i
                      ><!
                    [endif]--></span
                  ></a
                >
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  If you didn’t create an account with us, feel free to ignore
                  this message.
                </p>
                <p>Thanks,</p>
              </div>
              <div style="font-weight:bold;padding:0px 24px 0px 24px">
                <p>Best regards,<br />The Apostel Team</p>
              </div>
              <div
                style="font-size:12px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                [Website URL]
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};



const SingUpEmail = (to,UserName) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  // Define mail options
  const mailOptions = {
    from: EMAIL,
    to: to,
    subject: "Welcome to Apostle – You're All Set to Power Up!",
    html: `
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#F5F5F5;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:16px 24px 16px 24px;text-align:center">
                <img
                  alt="Sample product"
                  src="https://files.oaiusercontent.com/file-3c6LzBYSpbLW4jXcTDhQq6?se=2025-05-13T19%3A58%3A01Z&amp;sp=r&amp;sv=2024-08-04&amp;sr=b&amp;rscc=max-age%3D299%2C%20immutable%2C%20private&amp;rscd=attachment%3B%20filename%3DApostle.png&amp;sig=nDEC94GzkHacT0SvoTKzXnyRnjZEA6EaLKIEQD/YCeM%3D"
                  width="100"
                  style="width:100px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:12px 24px 0px 24px"
              >
                Hi ${UserName},
              </h3>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  Welcome to the Apostle family! 🎉 We&#39;re excited to have
                  you on board.
                </p>
                <p>
                  Apostle is your reliable partner for power bank rentals,
                  designed to keep you charged and connected wherever you go.
                  With your new account, you can now:
                </p>
              </div>
              <div style="padding:0px 0px 0px 0px">
                <hr
                  style="width:100%;border:none;border-top:4px solid #0284C7;margin:0"
                />
              </div>
              <div
                style="font-size:17px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>
                  🔋 Track your rental history<br />💳 View and manage your
                  active bills and payments<br />📅 Reserve power banks for
                  later collection<br />📲 And much more, all in one place!
                </p>
              </div>
              <div style="padding:0px 0px 0px 0px">
                <hr
                  style="width:100%;border:none;border-top:4px solid #0284C7;margin:0"
                />
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                To get started, simply log in to your account, update your profile, and visit any nearby store to activate your account.
                </p>
                <p>
                  If you have any questions or need assistance, feel free to
                  reply to this email or contact our support team—we’re always
                  happy to help.
                </p>
                <p>Thanks for joining us. Let’s keep you powered up!</p>
              </div>
              <div style="font-weight:bold;padding:0px 24px 0px 24px">
                <p>Best regards,<br />The Apostle Team</p>
              </div>
              <div
                style="font-size:12px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                [Website URL]
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};


const LogInEmail = (to,UserName) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  // Define mail options
  const mailOptions = {
    from: EMAIL,
    to: to,
    subject: " You Just Logged In to Your Apostle Account",
    html: `
    <!doctype html>
<html>
  <body>
    <div
      style='background-color:#F5F5F5;color:#262626;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="padding:16px 24px 16px 24px;text-align:center">
                <img
                  alt="Sample product"
                  src="https://i.im.ge/2025/05/14/vgKDWX.Apostle.png"
                  width="100"
                  style="width:100px;outline:none;border:none;text-decoration:none;vertical-align:middle;display:inline-block;max-width:100%"
                />
              </div>
              <h3
                style="font-weight:bold;margin:0;font-size:20px;padding:12px 24px 0px 24px"
              >
                Hi ${UserName},
              </h3>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  We noticed a successful login to your Apostle account just
                  now.<br />If that was you—awesome! You&#39;re all set to
                  continue using our power bank rental services.
                </p>
                <p>Here’s what you can do next:</p>
              </div>
              <div style="padding:0px 0px 0px 0px">
                <hr
                  style="width:100%;border:none;border-top:4px solid #0284C7;margin:0"
                />
              </div>
              <div
                style="font-size:17px;font-weight:bold;padding:0px 24px 0px 24px"
              >
                <p>
                  🔋 View your rental history<br />💳 Check your active bills
                  and payments<br />📅 Reserve power banks for later
                  collection<br />⚙️ Manage your account settings
                </p>
              </div>
              <div style="padding:0px 0px 0px 0px">
                <hr
                  style="width:100%;border:none;border-top:4px solid #0284C7;margin:0"
                />
              </div>
              <div
                style="font-size:14px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                <p>
                  If you didn’t log in, please secure your account by changing
                  your password or reaching out to our support team right away.
                </p>
                <p>
                  Thanks for choosing Apostle. We’re glad to have you with us!
                </p>
                <p>Stay powered,</p>
              </div>
              <div style="font-weight:bold;padding:0px 24px 0px 24px">
                <p>Best regards,<br />The Apostel Team</p>
              </div>
              <div
                style="font-size:12px;font-weight:normal;padding:0px 24px 0px 24px"
              >
                [Website URL]
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};



// Export function
module.exports = { 
  ContactUsEmail , SendCustomMessages , SendRentalEmail , SendReserveEmail , SendReserveEndingEmail ,
  VerificationEmail , SingUpEmail , LogInEmail ,SendRentalEndingEmail , ForGotPassword , RentalReturned
};

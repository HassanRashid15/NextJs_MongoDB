const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log("sendEmail called with options:", options);
  console.log("Email config:", {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD ? "***" : "NOT SET",
  });

  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: "Your App Name <hello@yourapp.com>",
    to: options.email,
    subject: options.subject,
    text: options.text, // Fallback for non-HTML clients
    html: options.html, // The main HTML content
  };

  console.log("Mail options:", mailOptions);

  // 3) Actually send the email
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};

module.exports = sendEmail;

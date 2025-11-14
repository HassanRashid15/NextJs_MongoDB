const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
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

  // 3) Actually send the email
  try {
    console.log(`Attempting to send email to: ${options.email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${options.email}`);
    return result;
  } catch (error) {
    console.error(`Failed to send email to ${options.email}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;

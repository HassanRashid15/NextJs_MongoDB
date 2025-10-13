import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define the email options
  const mailOptions = {
    from: 'Your App Name <hello@yourapp.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // Send the email
  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw error;
  }
};

import nodemailer from 'nodemailer'; // using nodemailer for email sending

// SMTP configuration
const smtpServer = "email-smtp.eu-west-2.amazonaws.com";
const port = 587; // Use 587 for TLS
const username = "AKIAWMQXFPATKI7SMGPR";
const password = "BHbx5v+pI8tO3K6VDT4jteZ2ACegYt9sfQXiWLXCnqg0";

// Email details
const senderEmail = "info@cogentro.com";
const receiverEmail = "numanqamar16@gmail.com";
const subject = "Test Email";
const body =
  "This is a test email sent from a Node.js script using Amazon SES SMTP.";

// Create a transporter object
export const transporter = nodemailer.createTransport({
  host: smtpServer,
  port: port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: username,
    pass: password,
  },
});

// Create the email options
export const mailOptions = {
  from: senderEmail,
  to: receiverEmail,
  subject: subject,
  text: body,
};


const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendEmail(email, subject, text, phone, html) {
  try {
    // Send email
    await transporter.sendMail({
      from: "recrutement@xsustain.io",
      to: email,
      subject: subject,
      text: text,
      phone: phone,
      html: html,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
async function contactUs( email, name, subject, text, phone) {
  try {
    // Ensure 'from' email is authorized in your SMTP server or email service
    await transporter.sendMail({
      from: "recrutement@xsustain.io", // This email must be authorized to send messages
      to: email,
      subject: name,
      text: `${subject}\n${phone}\n${text}`,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

module.exports = {
  sendEmail,
  contactUs,
};

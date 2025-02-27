const config = require('../config');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport(config.email);

const send = async ({ recipients, subject, text, html }) => {
  try {
    const to = recipients.filter(recipient => recipient !== null)
    const mail = { from: `TMS <${config.email.auth.user}>`, to, subject, text, html }
    const info = await transporter.sendMail(mail);
    return info;

  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = {
  send,
}

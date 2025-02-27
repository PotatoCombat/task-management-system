const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport(config.email);

const send = async ({ to, subject, text, html }) => {
  try {
    const mail = { from: `TMS <${config.email.auth.user}>`, to, subject, text, html }
    const info = await transporter.sendMail(mail);
    return info;

  } catch (error) {
    return null;
  }
}

module.exports = {
  send,
}

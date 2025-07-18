const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Gửi email
 * @param {string} to - Địa chỉ email nhận
 * @param {string} subject - Tiêu đề
 * @param {string} text - Nội dung
 */
function sendMail(to, subject, text) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
}

module.exports = { sendMail }; 
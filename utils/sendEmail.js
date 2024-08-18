const nodemailer = require('nodemailer');
const sendEmail = async(options) => {
    // 1) Create gmail transporter service
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    // 2) Define email options
    const mailOpts = {
        from: "Ecommerse App",
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    // 3) Send Email
    await transporter.sendMail(mailOpts);
}

module.exports = sendEmail;
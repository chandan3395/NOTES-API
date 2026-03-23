const transporter = require("../config/emailClient") ;
const logger = require("./logger") ;

const sendEmail = async ({to, subject, html}) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html 
        }) ;
        logger.info(`Email sent to ${to} - subject: "${subject}"`) ;
    } catch(err) {
    // we log but don't throw — a failed email shouldn't crash the whole request
        logger.error(`Email failed to ${to}: ${err.message}`) ;
    }
};

module.exports = sendEmail ;
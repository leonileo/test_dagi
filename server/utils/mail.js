const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const URL = process.env.CLIENT_HOST_URL;
const API_KEY = process.env.ELASTIC_EMAIL_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

const axios = require('axios');
const { activationTemplate, forgotPasswordTemplate, userRoleChangedEmailTemplate, userBlockEmailTemplate } = require("./mailTemplates");

const sendEmail = async ({ to, subject, html }) => {
    const data = {
        from: SENDER_EMAIL,
        to,
        subject,
        html
    };
    try {
        await axios.post('https://api.elasticemail.com/v2/email/send', data, {
            params: {
                apiKey: API_KEY
            }
        });
        console.log(`${subject} Emailu Sent...`);
    } catch (err) {
        console.log(err);
    }
};

// Sends Email For Activate Account
const activationEmail = async ({ to, token }) => {
    await sendEmail({
        to,
        subject: 'Activate your account',
        html: activationTemplate(URL, token)
    });
    console.log("done?")
};

// Sends Email For Reset Password
const forgotPasswordEmail = async ({ to, token }) => {
    await sendEmail({
        to,
        subject: 'Reset your Password',
        html: forgotPasswordTemplate(URL, token)
    });
};

// Sends Email when user role changed
const userRoleChangedEmail = async ({ to, isAdminNow }) => {
    await sendEmail({
        to,
        subject: 'Your role has been changed',
        html: userRoleChangedEmailTemplate(URL, isAdminNow)
    });
};

// Sends Email when user is blocked/unblocked
const userBlockEmail = async ({ to, isBlockNow }) => {
    await sendEmail({
        to,
        subject: 'Your status has been changed',
        html: userBlockEmailTemplate(URL, isBlockNow)
    });
};

module.exports = {
    activationEmail,
    forgotPasswordEmail,
    userRoleChangedEmail,
    userBlockEmail
};

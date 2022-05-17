const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const twilio = {};

twilio.sendVerificationCode = (code, country_code, number) => {

    client.messages
        .create({
            body: `Stackchat - Verification code: ${code}`,
            from: '+19549941213',
            to: `${country_code}${number}`
        })
        .then(message => console.log(message.sid))
        .catch(err => console.error(err));

}

module.exports = twilio;
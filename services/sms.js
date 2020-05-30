const accountSid = process.env.TWILIO_ACCOUNT_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const sendSms = () => {
  client.messages
    .create({
      body: "You have succesfully loggedIn. Welcome.",
      from: process.env.FROM_PHONE_NUMBER,
      to: process.env.TO_PHONE_NUMBER,
    })
    .then((message) => console.log(message.sid));
};

module.exports = sendSms;

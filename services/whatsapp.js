require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const sendWhatsappMessage = (message) => {
  client.messages
    .create({
      from: "whatsapp:" + process.env.FROM_PHONE_NUMBER_WHATSAPP,
      body: "Hello there! You have successfully logged in. Welcome.",
      to: "whatsapp:" + process.env.TO_PHONE_NUMBER,
    })
    .then((message) => console.log(message.sid));
};

module.exports = sendWhatsappMessage;

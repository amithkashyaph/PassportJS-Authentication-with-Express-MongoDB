const mail = require("@sendgrid/mail");
mail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = () => {
  const msg = {
    from: "nocturnalcoder2020@gmail.com",
    to: "h.amithkashyapleo94@gmail.com",
    subject: "Testing Email with Twilio",
    text: "You have logged in using your Google account",
  };

  mail.send(msg);
};

module.exports = sendMail;

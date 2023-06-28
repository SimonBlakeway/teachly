dotenv = require('dotenv')
dotenv.config({ path: './config/config.env' })
nodemailer = require("nodemailer");
exphbs = require('express-handlebars');
const fs = require('fs');



/*
 this is an hbs instance, I did it this way because
 I want to use exphbs for both the emails and 
 the serverside html and using an engine for 
 the server and an instance for emails seemed 
 like a good way to do it
*/
const hbs = exphbs.create({
  helpers: {}
});

/*
the nodemailer code should be pretty easy 
to understand, if not check the docs, 
they're good
*/

let transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", // hostname
  secureConnection: false, // use SSL
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
    },
});


async function sendSignUpEmail(emailAddress, code, lang) {
  //get the language specific context
  context = JSON.parse(
    fs.readFileSync(
      `./views/email-templates/language-templates/${lang}/signin-email.json`
      )
    )
  //use the hbs instace to generate the html
  GeneratedHtml = await hbs.render(
    './views/email-templates/hbs-templates/signin-email.hbs',
    {randCode: code, context}, 
    )

  transporter.sendMail({
    from: process.env.EMAIL_ADDRESS, 
    to: emailAddress,
    subject: "Teachly signin",
    html: GeneratedHtml,
    //text:`code is ${code}`,
    onError: (e) => console.log(e),
    onSuccess: (i) => console.log(i)
  });
}
async function sendNotificationEmail(emailAddress, code,) {

  let info = await transporter.sendMail({
    from: process.env.EMAIL_ADDRESS,
    to: emailAddress,
    subject: "reee",
    html: `code is ${code}`,
    text:`code is ${code}`,
    onError: (e) => console.log(e),
    onSuccess: (i) => console.log(i)
  });
}
async function sendEmailWithAtachments(emailAddress, code,) {

  let info = await transporter.sendMail({
    from: process.env.EMAIL_ADDRESS,
    to: emailAddress,
    subject: "reee",
    html: `code is ${code}`,
    text:`code is ${code}`,
    onError: (e) => console.log(e),
    onSuccess: (i) => console.log(i)
  });
}
async function sendPromotionEmail(emailAddresses, code,) {

  let info = await transporter.sendMail({
    from: process.env.EMAIL_ADDRESS,
    to: emailAddress,
    subject: "reee",
    html: `code is ${code}`,
    text:`code is ${code}`,
    onError: (e) => console.log(e),
    onSuccess: (i) => console.log(i)
  });
}


module.exports = {
  sendSignUpEmail,
  sendNotificationEmail,
  sendEmailWithAtachments,

};
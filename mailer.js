var nodemailer = require('nodemailer');

// Nodemailer
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var transporter = nodemailer.createTransport('smtp://support@studentpreneur.co:Baksoenak1989@mail.studentpreneur.co');
var mailOptions = {
    from: '"Fred Foo 👥" <support@studentpreneur.co>',
    to: 'asrul.hanafi@studentpreneur.co',
    subject: 'Hello World✔',
    text: 'Hello world 🐴',
    html: '<b>Hello world 🐴</b>'
};
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
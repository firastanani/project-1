const nodemailer = require("nodemailer");
const config = require("config");
const fs = require('fs');
var handlebars = require('handlebars');

var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};
module.exports = async function sendEmail(email, URL) {
  const Transport = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: config.get('email'),
        pass: config.get('password')
    }
  });

  readHTMLFile('D:/fullstack/forGithub/project1-master/util/forConfirmEmail/indexForConfirm.html',  function(err, html) {
    var template = handlebars.compile(html);
    var replacements = {
         URL
    };
    var htmlToSend = template(replacements);
    var message = {
        from: config.get("email"),
        to : email,
        subject : 'SayHey confirm email',
        html : htmlToSend
     };
     Transport.sendMail(message);
  });
};


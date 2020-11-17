module.exports = class extends think.Service {
	    sendMail(subject, html) {
        var nodemailer = require('nodemailer');
        var smtpTransport = require('nodemailer-smtp-transport');
        smtpTransport = nodemailer.createTransport(smtpTransport({
            service: think.config('email.service'),
            auth: {
                user: think.config('email.user'),
                pass: think.config('email.pass')
            }
        }));
        smtpTransport.sendMail({ from: think.config('email.user'), to: think.config('email.recipient'), subject: subject, html: html }, function(error, response) {
            if (error) {
                console.log('mail_fail:' + error);
            }
            console.log('mail_success');
        });
    }
}
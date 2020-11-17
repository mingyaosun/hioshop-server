/**
 *
 * @Description 邮件发送 
 * 调用方法:sendMail('amor_zhang@qq.com','这是测试邮件', 'Hi Amor,这是一封测试邮件');
 * @Author Amor
 * @Created 2016/04/26 15:10
 * 技术只是解决问题的选择,而不是解决问题的根本...
 * 我是Amor,为发骚而生!
 *
 */

/**
 * @param {String} recipient 收件人
 * @param {String} subject 发送的主题
 * @param {String} html 发送的html内容
 */

function sendMail(service, user, pass, recipient, subject, html) {
        var nodemailer = require('nodemailer');
        var smtpTransport = require('nodemailer-smtp-transport');
        smtpTransport = nodemailer.createTransport(smtpTransport({
            service: service,
            auth: {
                user: user,
                pass: pass
            }
        }));
        smtpTransport.sendMail({ from: user, to: recipient, subject: subject, html: html }, function(error, response) {
            if (error) {
                console.log('mail_fail:' + error);
            }
            console.log('mail_success');
        });
    }
module.exports = sendMail;
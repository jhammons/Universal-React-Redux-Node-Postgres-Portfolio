var models = require('../models/index.js');
var nodemailer = require('nodemailer');
var config = require('../../config/APPconfig');

exports.handleContactSubmit = function(req, res) {
    models.Contact.create({
        name: req.body.name || null,
        email: req.body.email || null,
        phone: req.body.phone || null,
        message: req.body.message || null
    })
        .then(() => {
            var textarea = req.body.message;
            textarea = textarea.replace(/\r?\n/g, '<br />');

            config.mailoptions.replyTo = req.body.email;
            config.mailoptions.html = `
        <h3>New Contact</h3>
        From: ${req.body.name}<br>
        email: ${req.body.email}<br>
        phone: ${req.body.phone || 'n/a'}<br><br>
        ${textarea}
    `;

            var transporter = nodemailer.createTransport(config.smtpConfig);

            transporter.sendMail(config.mailoptions, function(error, info) {
                if (error) {
                    console.log(error);
                    res.json({ result: error });
                } else {
                    res.json({ result: 'Success', info: info.response });
                }
            });
        })
        .catch(err => {
            console.error('Contact db insertion failure: ' + err);
            res.status(500).json({
                result: 'Error',
                info: err.status || 500
            });
        });
};

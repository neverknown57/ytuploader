const express = require('express')
var xhub = require('express-x-hub');
const { msg } = require("./insta")
require('dotenv')
var app = express();
const webhook = express.Router();
// app.set('port', (process.env.PORT || 5000));

webhook.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
webhook.use(express.json());



var token = process.env.TOKEN || 'token';
var received_updates = [];

webhook.get('/', function (req, res) {
    // console.log(req);
    res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

webhook.get(['/facebook', '/instagram', '/threads'], function (req, res) {
    if (
        req.query['hub.mode'] == 'subscribe' &&
        req.query['hub.verify_token'] == token
    ) {
        res.send(req.query['hub.challenge']);
    } else {
        res.sendStatus(400);
    }
});
webhook.post('/instagram', async (req, res) => {
    console.log('Instagram request body:');
    // console.log(req.body);
    // Process the Instagram updates here
    try {

        await msg(req.body.entry)
    } catch (e) {
        console.error(e);
    }
    received_updates.unshift(req.body);
    res.sendStatus(200);
    console.e
});

module.exports = {
    webhook
}
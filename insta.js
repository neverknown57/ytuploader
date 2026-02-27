const { send } = require("process");
const { ytuploader, setCred } = require("./auth")
const { title_func, hashtags } = require("./uploader")
const axios = require('axios');
require("dotenv")

const allowed_sender = ["887957197333087", "1885917932054540"];
const reply_status = async (id, message) => {
    try {
        const url = "https://graph.instagram.com/v25.0/17841403955423740/messages"
        console.log(message)
        await axios.post(url,
            {
                "message": { "text": message },
                "recipient": { "id": id }
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.access_token}`,
                    'Content-Type': 'application/json'
                },
            })
        console.log('send message')
    } catch (e) {
        console.error('Not able to reply ', e.message)
    }
}
// reply_status(allowed_sender[0], "How are you");
const msg = async (entry) => {
    const msg = entry[0].messaging[0];
    const sender_id = msg.sender['id'];
    console.log("msg = ", sender_id);
    if (allowed_sender.includes(sender_id)) {
        const message = msg.message
        console.log('saurabh is sender')
        // console.log(message?.attachments)
        if (message?.attachments?.[0]["type"] === 'ig_reel') {
            const { url, title } = message.attachments[0]['payload'];
            console.log('ig_reel');
            let reply = 'not able to upload';
            try {
                await setCred();
                const { data: { id } } = await ytuploader({
                    vid_link: url,
                    title: title_func(title),
                    description: title,
                    tag: hashtags(title),

                })
                console.log(id);
                reply = `youtube.com/shorts/${id}`
            } catch (e) {
                console.error(e);
                reply = e.message

            }
            await reply_status(sender_id, reply);

        }
        else {
            console.log('wrong attachment')
        }
    } else {
        console.log('unrecognised event')
    }

}
// const fs = require('fs');
// setTimeout(() => {
//     const updates = fs.readFileSync('./tmp/notfic.json');
//     const rcv = JSON.parse(updates);
//     const entry = rcv[0].entry
//     msg(entry);

// }, 5000)
module.exports = {
    msg,
}
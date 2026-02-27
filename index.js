const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { igdl } = require('ab-downloader');
const { meta_data } = require('./uploader')
const { ytuploader, authRoute, setCred } = require('./auth');
const { webhook } = require('./webhook');
require('dotenv').config();


const app = express();
app.use('/wb', webhook)

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', authRoute);


app.get('/', (req, res) => {
    console.log(process.env.token)
    res.sendFile(path.join(__dirname + '/public/index.html'));
});
//rough work

app.post('/video', async (req, res) => {
    const { reelUrl } = req.body
    try {
        await setCred();
        if (reelUrl && !reelUrl.includes('reel'))
            throw new Error('send valid reel link')
        const { vid_link, title, description, tag } = await meta_data(reelUrl);
        // console.log(description)
        if (vid_link == null)
            throw new Error('unable to get meta data')
        const details = await ytuploader({ vid_link, title, description, tag })
        res.json({ ...details })
    } catch (e) {
        // console.log(e);
        res.status(500).send(e.message);
    }
})
const PORT = process.env.PORT | 3000;
app.listen(PORT, () => {
    console.log('Server started :', PORT)
    // set();
});


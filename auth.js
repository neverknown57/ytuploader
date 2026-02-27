const fs = require('fs');
const axios = require("axios");
const { google } = require('googleapis');
const { error } = require('console');
const express = require('express');
const path = require('path');
const { get, put } = require("@vercel/blob")
require('dotenv').config();

const id = process.env.id;
const secret = process.env.secret
const url = process.env.url;
const authRoute = express.Router();
const oauth2Client = new google.auth.OAuth2(
    id,
    secret,
    url
);
// Step 1: Redirect user to Google consent screen
authRoute.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // ensures refresh token
        scope: ['https://www.googleapis.com/auth/youtube.upload'],
        prompt: 'consent'
    });
    res.redirect(url);
});

// Step 2: Handle callback and exchange code for tokens
authRoute.get('/oauth2callback', async (req, res) => {
    try {

        const { code } = req.query
        // console.log(code)
        const { tokens } = await oauth2Client.getToken(code);
        const t = JSON.stringify(tokens)
        // fs.writeFileSync('./tmp/token.json',)
        const blob_url = await put('token.json', t, {
            access: 'private',
            allowOverwrite: 'true',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });
        // console.log("blob -->", blob_url);
        await oauth2Client.setCredentials(
            tokens
        );
        res.redirect('../')
    } catch (e) {
        console.log(e);
        res.status(500).send('Authorization Fail!', e.message);
    }
});

const { text } = require('stream/consumers');
const setCred = async () => {
    try {
        const result = await get('token.json', {
            access: 'private',
            token: process.env.BLOB_READ_WRITE_TOKEN
        })
        const jsonText = await text(result.stream);
        const tokenData = JSON.parse(jsonText);
        // console.log(tokenData)
        await oauth2Client.setCredentials(
            tokenData
        );
        console.log("success full credentials set")
    } catch (e) {

        console.error(e);
        // throw new Error('Authenticate First',e.message);
    }
}
setCred();
const pwd = path.join(__dirname + '/tmp/out.mp4')

const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
});
const ytInsert = async ({ title, tag, description }) => {
    try {

        return detail = await youtube.videos.insert({
            part: 'id, snippet,status',
            requestBody: {
                snippet: {
                    title,
                    description,
                    tags: tag,
                    categoryId: '22'
                },
                // status: {
                //     privacyStatus: 'private'
                // }
            },
            media: {
                body: fs.createReadStream(pwd)
            }
        }, { uploadType: 'resumable' })
        console.log('uploaded video');
    } catch (e) {
        console.log('error', e)
        // throw new Error(e);
    }
}
const uploader = async ({ vid_link, title, description, tag }) => {
    // console.log(vid_link)
    console.log('from upload')
    console.log('axios url get video ')
    try {
        const response = await axios.get(
            vid_link, {
            responseType: 'stream',
            headers: {
                'Accept': 'video/mp4,application/octet-stream;q=0.9,*/*;q=0.8',
                'Referer': 'https://www.instagram.com/',
                'Range': 'bytes=0-',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' + 'AppleWebKit/537.36 (KHTML, like Gecko) ' + 'Chrome/110.0.0.0 Safari/537.36',
            }
        }

        )
        var vs = response.data;
        console.log('fetching');
        // Create a write stream to save the file
        const writeStream = fs.createWriteStream(pwd);
        // // Handle events
        return await new Promise((resolve, reject) => {
            response.data.pipe(writeStream);

            writeStream.on('finish', () => {
                console.log('All data has been written to file.');
                try {
                    const youtubeRes = ytInsert({ title, description, tag, });
                    resolve(youtubeRes)
                    // resolve();
                } catch (e) {
                    reject(e)
                }
            });

            writeStream.on('error', (err) => {
                console.error('Error writing to file:', err);
                reject(err); // Fail the await
            })
        })

    } catch (err) {
        console.error('Download failed:', err);
        return err
    }
    console.log('downloaded')


}
module.exports = {
    ytuploader: uploader,
    authRoute,
    setCred
}

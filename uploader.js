const axios = require('axios')
const fs = require('node:fs')
const url = 'https://www.instagram.com/reels/DST9MR5DuuC/'
// scrap(url);
const title_func = (s) => {
    let idx = s.indexOf('.')
    let idx2 = s.indexOf('\n')
    idx = idx == -1 ? 100 : idx;
    idx2 = idx2 == -1 ? 100 : idx2;
    let len = Math.min(idx, idx2, 50);
    return s.slice(0, len);
}
const hashtags = (s) => {
    const arr = ["shorts", "ytshorts"];
    const n = s.length;
    let i = 0;
    while (i < n) {
        if (s[i++] == '#') {
            let tag = "";
            while (i < n && s[i] != " ")
                tag = tag + s[i++];
            arr.push(tag);
        }
    }
    return arr
}
const { instagramGetUrl } = require("instagram-url-direct");
const meta_data = async (url) => {
    console.log(url);
    try {
        let data = await instagramGetUrl(url)
        console.log('Meta fatched');
        return {
            vid_link: data.url_list[0],
            title: title_func(data.post_info.caption),
            description: data.post_info.caption,
            tag: hashtags(data.post_info.caption),

        };
    } catch (e) {
        console.log(e.name);
        throw new Error('Invalid reel URL');

    }
}
module.exports = {
    meta_data,
    title_func,
    hashtags
}
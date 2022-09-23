const { downloadImage } = require("./dowloadImage");
const { blur } = require("./imageEditor/blurImage");
const needle = require("needle");
const fs = require("fs");

const bearerToken = "c63bfca0a28657570551238b2c092cbf79e063de";

const options = {
    headers: {
        "User-Agent": "tweeterGame",
        authorization: `Bearer ${bearerToken}`
    }
};

const textCorrection = tweet => {
    tweet.text = tweet.text.replace('&amp;', '&');
}

const blurImages = async tweet => {
    for (let i = 0 ; i < tweet.images.length ; i++) {
        const url = tweet.images[i];
        await downloadImage(url, 'imageEditor/image.jpg');
        await blur();
        const file = {
            image: fs.readFileSync('imageEditor/blurred_image.jpg', {encoding: 'base64'}),
            type: 'base64'
        };
        const apiUrl = `https://api.imgur.com/3/upload`;
        const resp = await needle('POST', apiUrl, file, options);
        tweet.images[i] = resp.body.data.link;
    }
}

module.exports = { textCorrection, blurImages };
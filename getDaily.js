const fs = require("fs");
const { textCorrection } = require("./tweetTools");

const getDaily = () => {
    const resp = JSON.parse(fs.readFileSync("json_files/daily.json"));
    for (let i = resp.users.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [resp.users[i], resp.users[j]] = [resp.users[j], resp.users[i]];
        j = Math.floor(Math.random() * (i + 1));
        [resp.tweets[i], resp.tweets[j]] = [resp.tweets[j], resp.tweets[i]];
    }
    for (let i = 0 ; i < resp.tweets.length ; i++) {
        textCorrection(resp.tweets[i]);
    }
    return resp;
}

module.exports = { getDaily };
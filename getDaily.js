const fs = require("fs");

const getDaily = (req, res) => {
    const resp = JSON.parse(fs.readFileSync("daily.json"));
    for (let i = resp.users.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [resp.users[i], resp.users[j]] = [resp.users[j], resp.users[i]];
        j = Math.floor(Math.random() * (i + 1));
        [resp.tweets[i], resp.tweets[j]] = [resp.tweets[j], resp.tweets[i]];
    }
    res.send(resp);
}

module.exports = { getDaily };
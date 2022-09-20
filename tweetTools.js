const textCorrection = tweet => {
    tweet.text = tweet.text.replace('&amp;', '&');
}

module.exports = { textCorrection };
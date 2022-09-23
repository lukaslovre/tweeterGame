const fs = require('fs');
const request = require('request');

const download = (uri, filename) => new Promise((resolve, reject) => {
  request.head(uri, (err, res, body) => {
      request(uri).pipe(fs.createWriteStream(filename)).on('finish', resolve);
  });
});

const downloadImage = async (url, path) => {
  await download(url, path);
}

module.exports = { downloadImage };
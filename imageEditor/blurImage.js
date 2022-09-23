const jimp = require('jimp') ;

const blur = () => new Promise((resolve, reject) => {
   
    jimp.read('imageEditor/image.jpg').then(image => {
        const blurPixels = Math.floor((image.getHeight() + image.getWidth()) * 0.01);
        //console.log(blurPixels);
        image.blur(blurPixels).write('imageEditor/blurred_image.jpg', resolve);
    });

});

module.exports = { blur };
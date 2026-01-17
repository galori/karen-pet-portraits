const https = require('https');
const fs = require('fs');
const path = require('path');

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                response.resume();
                reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`));
            }
        }).on('error', reject);
    });
};

const images = [
  'https://static.wixstatic.com/media/9bc9f8_48d6e371f7c84880b05c6b4aaf8f67d3~mv2.jpg/v1/fit/w_902,h_703,q_90,enc_avif,quality_auto/9bc9f8_48d6e371f7c84880b05c6b4aaf8f67d3~mv2.jpg',
  'https://static.wixstatic.com/media/9bc9f8_a1eeafbb06b24c708c64e68620b89b25~mv2.jpg/v1/fit/w_677,h_522,q_90,enc_avif,quality_auto/9bc9f8_a1eeafbb06b24c708c64e68620b89b25~mv2.jpg',
  'https://static.wixstatic.com/media/9bc9f8_55718f6c97784dce81b7b2b1219afc97~mv2.jpg/v1/fit/w_1944,h_2116,q_90,enc_avif,quality_auto/9bc9f8_55718f6c97784dce81b7b2b1219afc97~mv2.jpg',
  'https://static.wixstatic.com/media/9bc9f8_2a8661320af742019bc8319481b72b69~mv2.jpg/v1/fit/w_1082,h_1484,q_90,enc_avif,quality_auto/9bc9f8_2a8661320af742019bc8319481b72b69~mv2.jpg',
  'https://static.wixstatic.com/media/9bc9f8_a7342ffc49504f10b5f700e3db7b3e94~mv2.png/v1/fit/w_858,h_658,q_90,enc_avif,quality_auto/9bc9f8_a7342ffc49504f10b5f700e3db7b3e94~mv2.png',
  'https://static.wixstatic.com/media/9bc9f8_eb5bd6de7818454098f3db4b2f542dc1~mv2.png/v1/fit/w_830,h_839,q_90,enc_avif,quality_auto/9bc9f8_eb5bd6de7818454098f3db4b2f542dc1~mv2.png',
  'https://static.wixstatic.com/media/9bc9f8_add25e5c802848f883c7c63b169c35ef~mv2.jpg/v1/fit/w_1944,h_1458,q_90,enc_avif,quality_auto/9bc9f8_add25e5c802848f883c7c63b169c35ef~mv2.jpg',
  'https://static.wixstatic.com/media/9bc9f8_01d3e82a2f32403b8b60c0cd591fd8cc~mv2.png/v1/fit/w_522,h_574,q_90,enc_avif,quality_auto/9bc9f8_01d3e82a2f32403b8b60c0cd591fd8cc~mv2.png',
  'https://static.wixstatic.com/media/9bc9f8_866a8e3223bd4c3aae504b42be846c50~mv2.png/v1/fit/w_1126,h_999,q_90,enc_avif,quality_auto/9bc9f8_866a8e3223bd4c3aae504b42be846c50~mv2.png',
  'https://static.wixstatic.com/media/9bc9f8_52a7302e285f49e6a115b955b5f54582~mv2.jpg/v1/fit/w_975,h_1235,q_90,enc_avif,quality_auto/9bc9f8_52a7302e285f49e6a115b955b5f54582~mv2.jpg',
  'https://static.wixstatic.com/media/9bc9f8_5100f1b57be7433791fdb173c71b5456~mv2.jpg/v1/fit/w_1110,h_1414,q_90,enc_avif,quality_auto/9bc9f8_5100f1b57be7433791fdb173c71b5456~mv2.jpg',
  'https://static.wixstatic.com/media/9bc9f8_cd7db30ec76f4cd1b1ea0139f43e6bc4~mv2.jpg/v1/fit/w_1153,h_925,q_90,enc_avif,quality_auto/9bc9f8_cd7db30ec76f4cd1b1ea0139f43e6bc4~mv2.jpg',
  'https://static.wixstatic.com/media/9bc9f8_75fc1afd35c0453383932d8294024e6d~mv2.jpg/v1/fit/w_988,h_1143,q_90,enc_avif,quality_auto/9bc9f8_75fc1afd35c0453383932d8294024e6d~mv2.jpg',
];

// Create the directory if it doesn't exist
const dir = path.join(__dirname, 'images', 'happy-clients');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Download all images
(async () => {
    for (let i = 0; i < images.length; i++) {
        const filepath = path.join(dir, `client${i + 1}.jpg`);
        try {
            await downloadImage(images[i], filepath);
            console.log(`Downloaded ${filepath}`);
        } catch (err) {
            console.error(`Error downloading ${images[i]}: ${err.message}`);
        }
    }
})();

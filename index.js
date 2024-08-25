// expressモジュールを読み込む
const express = require('express');
const app = express();

// ポート番号を設定
const PORT = process.env.PORT || 3000;

// Twitとfsモジュールを読み込む
const Twit = require('twit');
const fs = require('fs');

// Twitter APIに接続するためのオブジェクトを作成
const T = new Twit({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// 画像をツイートする関数
function tweetImage(imagePath) {
  const b64content = fs.readFileSync(imagePath, { encoding: 'base64' });
  T.post('media/upload', { media_data: b64content }, (err, data, response) => {
    if (err) {
      console.log('画像のアップロードに失敗しました: ' + err);
      return;
    }
    const mediaIdStr = data.media_id_string;
    const params = { status: 'botからのツイート🐶', media_ids: [mediaIdStr] };
    T.post('statuses/update', params, (err, data, response) => {
      if (err) {
        console.log('ツイートに失敗しました: ' + err);
      } else {
        console.log('ツイートに成功しました！');
      }
    });
  });
}

// 複数の画像をツイートする関数
function tweetImages(imagePaths) {
  const mediaIds = [];
  let uploadedCount = 0;

  imagePaths.forEach(imagePath => {
    const b64content = fs.readFileSync(imagePath, { encoding: 'base64' });
    T.post('media/upload', { media_data: b64content }, (err, data, response) => {
      if (err) {
        console.log('画像のアップロードに失敗しました: ' + err);
        return;
      }
      mediaIds.push(data.media_id_string);
      uploadedCount++;

      // すべての画像がアップロードされたらツイートする
      if (uploadedCount === imagePaths.length) {
        const params = { status: 'botからのツイート🐶', media_ids: mediaIds };
        T.post('statuses/update', params, (err, data, response) => {
          if (err) {
            console.log('ツイートに失敗しました: ' + err);
          } else {
            console.log('ツイートに成功しました！');
          }
        });
      }
    });
  });
}

// すべての画像パスを格納する配列
const allImagePaths = [];

// singleフォルダ内の話数フォルダを走査して、すべての画像パスを追加
fs.readdirSync('./images/single/').forEach(episodeName => {
  fs.readdirSync(`./images/single/${episodeName}/`).forEach(fileName => {
    allImagePaths.push(`./images/single/${episodeName}/${fileName}`);
  });
});

// multiフォルダ内の画像セットを走査して、すべての画像パスを追加
fs.readdirSync('./images/multi/').forEach(setName => {
  fs.readdirSync(`./images/multi/${setName}/`).forEach(fileName => {
    allImagePaths.push(`./images/multi/${setName}/${fileName}`);
  });
});

// 1時間ごとにランダムな画像をツイートする処理
setInterval(() => {
  // ランダムなインデックスを取得
  const randomIndex = Math.floor(Math.random() * allImagePaths.length);

  // ランダムに選ばれた画像パス
  const imagePath = allImagePaths[randomIndex];

  // 画像をツイート
  tweetImage(imagePath);
}, 60 * 60 * 1000); 

// GETリクエストを受け取ったときに「bot、起動中！」と返す
app.get('/', (req, res) => {
  res.send('bot、起動中！');
});

// ポート番号で待機
app.listen(PORT, () => {
  console.log(`ポート ${PORT} で待機中...`);
});
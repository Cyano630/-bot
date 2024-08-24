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
  // (省略)
}

// 複数の画像をツイートする関数
function tweetImages(imagePaths) {
  // (省略)
}

// 1枚の画像のパスを格納する配列
const singleImagePaths = [];

// singleフォルダ内のエピソードフォルダを走査
fs.readdirSync('./images/single/').forEach(episodeName => {
  // 各エピソードフォルダ内の画像パスをsingleImagePathsに追加
  fs.readdirSync(`./images/single/${episodeName}/`).forEach(fileName => {
    singleImagePaths.push(`./images/single/${episodeName}/${fileName}`);
  });
});

// 複数枚セットの画像パスの配列を自動生成
const multiImageSets = fs.readdirSync('./images/multi/').map(setName => {
  return fs.readdirSync(`./images/multi/${setName}/`).map(fileName => `./images/multi/${setName}/${fileName}`);
});

// 1時間ごとに実行するための呪文！
setInterval(function () { 
  // 1枚の画像と複数枚セットをまとめた配列
  const allImageOptions = [
    ...singleImagePaths.map(path => [path]), // 修正点
    ...multiImageSets
  ];

  // ランダムなインデックスを取得
  const randomIndex = Math.floor(Math.random() * allImageOptions.length);

  // ランダムに選ばれた画像または画像セット
  const selectedImages = allImageOptions[randomIndex];

  // 画像または画像セットをツイート
  if (selectedImages.length === 1) {
    // 1枚の画像の場合
    tweetImage(selectedImages[0]);
  } else {
    // 複数枚セットの場合
    tweetImages(selectedImages);
  }

}, 60 * 60 * 1000); // 1時間に1回実行 (1000ミリ秒 = 1秒) 
app.get('/', (req, res) => {
  res.send('いぬかいさんbot、起動中！'); 
});
// ポート番号で待機
app.listen(PORT, () => {
  console.log(`ポート ${PORT} で待機中...`);
});

// キュアップ・ラパパ！botさん動いて～～
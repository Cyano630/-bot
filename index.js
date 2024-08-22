const Twit = require('twit');
const fs = require('fs');

const T = new Twit({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

function tweetImage(imagePath) {
  // 画像を読み込む
  const b64content = fs.readFileSync(imagePath, { encoding: 'base64' });

  // Twitter APIに画像をアップロード
  T.post('media/upload', { media_data: b64content }, function (err, data, response) {
    if (err) {
      console.log('画像のアップロードに失敗しました: ' + err);
      return;
    }

    // 画像IDを取得
    const mediaIdStr = data.media_id_string;

    // ツイートする
    const params = { status: '', media_ids: [mediaIdStr] };
    T.post('statuses/update', params, function (err, data, response) {
      if (err) {
        console.log('ツイートに失敗しました: ' + err);
      } else {
        console.log('ツイートに成功しました！');
      }
    });
  });
}

function tweetImages(imagePaths) {
  // 画像IDを格納する配列
  const mediaIds = [];

  // 複数の画像をアップロード
  imagePaths.forEach(imagePath => {
    const b64content = fs.readFileSync(imagePath, { encoding: 'base64' });

    T.post('media/upload', { media_data: b64content }, function (err, data, response) {
      if (err) {
        console.log('画像のアップロードに失敗しました: ' + err);
        return;
      }

      // 画像IDを配列に追加
      mediaIds.push(data.media_id_string);

      // すべての画像がアップロードされたらツイートする
      if (mediaIds.length === imagePaths.length) {
        const params = { status: '', media_ids: mediaIds };
        T.post('statuses/update', params, function (err, data, response) {
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
setInterval(function () { // ← これを追加！

  // 1枚の画像と複数枚セットをまとめた配列
  const allImageOptions = [
    ...singleImagePaths.map(path => ['./images/single/' + path]),
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

}, 60 * 60 * 1000); // 1時間に1回実行 (1000ミリ秒 = 1秒)  ← これを追加！
// キュアップ・ラパパ！botさん動いて～～
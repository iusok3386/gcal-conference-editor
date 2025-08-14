const fs = require('fs');
const prompts = require('prompts');

if (fs.existsSync('.clasp.json')) {
  console.log('✅ .clasp.json は既に存在します。作業は不要です。');
  return;
}

const questions = [
  {
    type: 'text',
    name: 'scriptId',
    message: 'Google Apps Script の ID を入力してください:',
    validate: id => id ? true : 'スクリプト ID は空にできません。'
  }
];

(async () => {
  console.log('🚀 ようこそ！ローカル環境のセットアップを開始します。');
  console.log('script.google.com で新しいプロジェクトを作成し、そのスクリプト ID をコピーしてください。');

  const response = await prompts(questions);

  if (response.scriptId) {
    const claspConfig = {
      scriptId: response.scriptId,
      rootDir: "./src", // src ディレクトリを指します
      filePushOrder: [] // その他の適切なデフォルト値
    };
    fs.writeFileSync('.clasp.json', JSON.stringify(claspConfig, null, 2));
    console.log('✨ .clasp.json を正常に作成しました！');
    console.log('"npx clasp push" を実行して、ファイルをアップロードしてください。');
  } else {
    console.log('セットアップがキャンセルされました。');
  }
})();

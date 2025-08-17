const fs = require('fs');
const prompts = require('prompts');

const TEMPLATE_PATH = '.clasp.json.template';
const OUTPUT_PATH = '.clasp.json';

if (fs.existsSync(OUTPUT_PATH)) {
  console.log(`✅ ${OUTPUT_PATH} は既に存在します。作業は不要です。`);
  return;
}

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error(`❌ テンプレートファイル (${TEMPLATE_PATH}) が見つかりません。`);
  return;
}

const questions = [
  {
    type: 'text',
    name: 'scriptId',
    message: 'Google Apps ScriptのIDを入力してください:',
    validate: id => id ? true : 'スクリプトIDは空にできません。'
  }
];

(async () => {
  console.log('🚀 ようこそ！ローカル環境のセットアップを開始します。');
  console.log('script.google.com で新しいプロジェクトを作成し、そのスクリプトIDをコピーしてください。');

  const response = await prompts(questions);

  if (response.scriptId) {
    const templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    const finalContent = templateContent.replace('__SCRIPT_ID__', response.scriptId);
    fs.writeFileSync(OUTPUT_PATH, finalContent);
    console.log(`✨ ${OUTPUT_PATH} を正常に作成しました！`);
    console.log('"npx clasp push" を実行して、ファイルをアップロードしてください。');
  } else {
    console.log('セットアップがキャンセルされました。');
  }
})();

const fs = require('fs');
const prompts = require('prompts');

// .clasp.jsonが既に存在する場合は何もしない
if (fs.existsSync('.clasp.json')) {
  console.log('✅ .clasp.json already exists. Nothing to do.');
  return;
}

const questions = [
  {
    type: 'text',
    name: 'scriptId',
    message: 'Please enter your Google Apps Script ID:',
    validate: id => id ? true : 'Script ID cannot be empty.'
  },
  {
    type: 'text',
    name: 'rootDir',
    message: 'Enter the root directory for your source files:',
    initial: '.' // Default to current directory
  }
];

(async () => {
  console.log('🚀 Welcome! Let\'s set up your local environment.');
  console.log('Please create a new project on script.google.com and copy its Script ID.');

  const response = await prompts(questions);

  if (response.scriptId && response.rootDir) {
    const claspConfig = {
      scriptId: response.scriptId,
      rootDir: response.rootDir
    };
    fs.writeFileSync('.clasp.json', JSON.stringify(claspConfig, null, 2));
    console.log('✨ Successfully created .clasp.json!');
  } else {
    console.log('Setup cancelled.');
  }
})();

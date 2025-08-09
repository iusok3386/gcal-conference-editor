const fs = require('fs');
const prompts = require('prompts');

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
  }
];

(async () => {
  console.log('🚀 Welcome! Let\'s set up your local environment.');
  console.log('Please create a new project on script.google.com and copy its Script ID.');

  const response = await prompts(questions);

  if (response.scriptId) {
    const claspConfig = {
      scriptId: response.scriptId,
      rootDir: "./src", // Point to the src directory
      filePushOrder: [] // Add other sensible defaults
    };
    fs.writeFileSync('.clasp.json', JSON.stringify(claspConfig, null, 2));
    console.log('✨ Successfully created .clasp.json!');
    console.log('Please run "npx clasp push" to upload your files.');
  } else {
    console.log('Setup cancelled.');
  }
})();

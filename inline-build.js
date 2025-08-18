const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'dist', 'angular-build');
const outputDir = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(buildDir, 'index.html');
const outputHtmlPath = path.join(outputDir, 'index.html');

if (!fs.existsSync(buildDir)) {
  console.error(`Build directory not found: ${buildDir}`);
  process.exit(1);
}

// 1. Read index.html
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// 2. Inline styles
const styleFile = fs.readdirSync(buildDir).find(f => f.endsWith('.css'));
if (styleFile) {
  const styleContent = fs.readFileSync(path.join(buildDir, styleFile), 'utf8');
  const styleTag = `<style>${styleContent}</style>`;
  indexHtml = indexHtml.replace(/<link rel="stylesheet".*?>/, styleTag);
  console.log(`Inlined styles from ${styleFile}`);
} else {
  console.log('No CSS file found to inline.');
}


// 3. Inline scripts
const scriptFiles = ['runtime.js', 'polyfills.js', 'main.js'];
let scriptContent = '';
scriptFiles.forEach(fileName => {
    const filePath = path.join(buildDir, fileName);
    if(fs.existsSync(filePath)) {
        scriptContent += fs.readFileSync(filePath, 'utf8') + '\\n';
        console.log(`Inlined script: ${fileName}`);
    } else {
        console.warn(`Script file not found: ${fileName}`);
    }
});

const scriptTag = `<script>\\n${scriptContent}\\n</script>`;

// Remove old script tags and add the new inlined one
indexHtml = indexHtml.replace(/<script src=".*?"><\/script>/g, '');
indexHtml = indexHtml.replace('</body>', `${scriptTag}</body>`);

// 4. Write the final output
fs.writeFileSync(outputHtmlPath, indexHtml, 'utf8');

console.log(`Successfully created single-file build at ${outputHtmlPath}`);

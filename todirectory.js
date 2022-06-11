const fs = require('fs');

const basePath = './src/pages/posts';
const files = fs.readdirSync(basePath);

files.forEach((file) => {
  if (fs.existsSync(`${basePath}/${file}/${file}.md`)) {
    fs.renameSync(`${basePath}/${file}/${file}.md`, `${basePath}/${file}/index.md`);
  }
});

console.log(files);

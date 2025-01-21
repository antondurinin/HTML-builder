const { readdir } = require('node:fs/promises');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('node:stream');
const { error } = require('node:console');

async function readDir(dirPath) {
  try {
    return readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    console.log(error);
  }
}

async function getDataFromFiles(dirStylePath) {
  const data = [];
  try {
    const files = await readDir(dirStylePath);
    const promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        if (file.isFile() && path.extname(file.name).trim() === '.css') {
          const filePath = path.join(file.path, file.name);
          const stream = fs.createReadStream(filePath);
          stream.on('data', (chunk) => {
            data.push(chunk);
          });
          stream.on('end', resolve);
          stream.on('error', reject);
        } else {
          resolve();
        }
      });
    });
    await Promise.all(promises);
  } catch (error) {
    console.log(error);
  }
  return data;
}

(async () => {
  try {
    const dirToName = 'project-dist';
    const fileToName = 'bundle.css';
    const dirStylePath = path.join(__dirname, 'styles');
    const dirFileTo = path.join(__dirname, dirToName, fileToName);
    const data = await getDataFromFiles(dirStylePath);
    const streamTo = fs.createWriteStream(dirFileTo);
    pipeline(data, streamTo, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Made ${fileToName} in ${dirToName}`);
      }
    });
  } catch (error) {
    console.log(error);
  }
})();

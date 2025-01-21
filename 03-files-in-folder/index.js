const { readdir, stat } = require('node:fs/promises');
const path = require('path');

async function readFilesInDir(dirPath) {
  try {
    return await readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    console.error(error);
  }
}

const dirName = 'secret-folder';
const dirPath = path.join(__dirname, dirName);

(async () => {
  try {
    const files = await readFilesInDir(dirPath);
    for (let i = 0; i < files.length; i++) {
      const element = files[i];
      (async () => {
        const elPath = path.join(element.path, element.name);
        try {
          const stats = await stat(elPath);          
          if (stats.isFile()) {
            const { name, ext } = path.parse(elPath);
            console.log(`${name}-${ext.slice(1)}-${stats.size/1000}kb`);
          }
        } catch (error) {
          console.error(error);
        }
      })();
    }
  } catch (error) {
    console.error(error);
  }
})();

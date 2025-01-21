const { readdir, copyFile, mkdir } = require('node:fs/promises');
const path = require('path');

async function readDir(dirPath) {
  try {
    return readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    console.log(error);
  }
}

(async () => {
  try {
    const dirname = 'files';
    const dirPathFrom = path.join(__dirname, dirname);
    const dirPathTo = path.join(__dirname, `${dirname}-copy`);
    await mkdir(dirPathTo, { recursive: true });

    const files = await readDir(dirPathFrom);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const pathFrom = path.join(file.path, file.name);
      const pathTo = path.join(dirPathTo, file.name);
      (async () => {
        try {
          copyFile(pathFrom, pathTo);
        } catch (error) {
          console.log(error);
        }
      })();
      }
      console.log(
        `Directory ${dirname} with files successfully copied to directory ${dirname}-copy`,
      );
  } catch (error) {
    console.log(error);
  }
})();

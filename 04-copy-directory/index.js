const { readdir, copyFile, mkdir, rm } = require('node:fs/promises');
const path = require('path');

async function readDir(dirPath) {
  try {
    return readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    console.error(error);
  }
}
async function removeRoot(pathToRoot) {
  try {
    await rm(pathToRoot, { recursive: true, force: true });
  } catch (error) {
    err(error);
  }
}
(async () => {
  try {
    const dirname = 'files';
    const dirPathFrom = path.join(__dirname, dirname);
    const dirPathTo = path.join(__dirname, `${dirname}-copy`);
    await removeRoot(dirPathTo);
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
          console.error(error);
        }
      })();
    }
    console.error(
      `Directory ${dirname} with files successfully copied to directory ${dirname}-copy`,
    );
  } catch (error) {
    console.error(error);
  }
})();

const { readdir, mkdir, copyFile, writeFile } = require('node:fs/promises');
const pathFs = require('path');
const { createReadStream,  } = require('node:fs');

let pathToRoot = '';

function log(msg) {
  console.log(msg);
}

function err(msg) {
  console.error(msg);
}

async function newDir(path) {
  try {
    const dir = await mkdir(path, { recursive: true });
    log(`New dir ${path} created`);
    return dir;
  } catch (error) {
    err(error);
  }
}

async function readFromDir(dirs, path) {
  try {
    const foundFiles = await readdir(path, { withFileTypes: true });
    const filteredFiles = filterFromRoot(dirs, foundFiles);
    log(`Files in dir ${path} red`);
    return filteredFiles;
  } catch (error) {
    err(error);
  }

  async function filterFromRoot(dirs, files) {
    function equality(dirs, element) {
      for (let i = 0; i < dirs.length; i++) {
        if (element.name === dirs[i]) {
          return true;
        }
      }
      return dirs.length === 0;
    }
    return files.filter((element) => {
      return equality(dirs, element);
    });
  }
}

async function copyTargetFiles(path, pathTo) {
  try {
    await copyFile(path, pathTo);
    log(`File ${path} copied to dir ${pathTo}`);
  } catch (error) {
    err(error);
  }
}

async function copyFileDir(file, pathTo) {
  try {
    const elementToCopy = pathFs.join(file.path, file.name);
    const dirToCopy = pathFs.join(pathTo, file.name);
    if (file.isFile()) {
      await copyTargetFiles(elementToCopy, dirToCopy);
    } else {
      await newDir(dirToCopy);
      await copy([], elementToCopy, dirToCopy);
    }
  } catch (error) {}
}

async function copy(dirs = [], path, pathTo) {
  try {
    const files = await readFromDir(dirs, path);
    for (const file of files) {
      await copyFileDir(file, pathTo);
    }
    log(`All files copied to dir ${pathTo}`);
  } catch (error) {
    err(error);
  }
}

async function compile(path) {
  try {
    const files = await readFromDir([], path);
    const data = [];
    for (const file of files) {
      await compileFiles(file, data, path);
    }
    const compiledFilePath = pathFs.join(path, 'style.css');
    await fillFile(compiledFilePath, data);
    console.log(`Made ${compiledFilePath} in ${path}`);
  } catch (error) {
    err(error);
  }
}

async function fillFile(compiledFilePath, data) {
  try {
    const content = Buffer.concat(data);
    await writeFile(compiledFilePath, content);
    console.log(`Filled ${compiledFilePath}`);
  } catch (error) {
    err(error);
  }
}

async function compileFiles(file, data, dirPath) {
  try {
    if (file.isFile() && pathFs.extname(file.name).toLowerCase() === '.css' && file.name !== 'style.css') {
      const filePath = pathFs.join(dirPath, file.name);
      const stream = createReadStream(filePath);
      for await (const chunk of stream) {
        data.push(chunk);
      }
      return data;
    }
  } catch (error) {
    err(error);
  }
}

(async () => {
  try {
    pathToRoot = pathFs.join(__dirname, 'project-dist');
    await newDir(pathToRoot);
    const dirsToCopy = ['assets', 'styles'];
    await copy(dirsToCopy, __dirname, pathToRoot);
    const pathToCompileDir = pathFs.join(pathToRoot, 'styles');
    await compile(pathToCompileDir);
  } catch (error) {
    err(error);
  }
})();

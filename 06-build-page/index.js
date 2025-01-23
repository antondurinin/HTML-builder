const {
  readdir,
  mkdir,
  copyFile,
  writeFile,
  readFile,
  rm,
  rmdir,
  access,
} = require('node:fs/promises');
const pathFs = require('path');
const { createReadStream } = require('node:fs');

let pathToRoot = '';

function log(msg) {
  // console.log(msg);
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
    const compiledFilePath = pathFs.join(pathToRoot, 'style.css');
    await fillFile(compiledFilePath, data);
    log(`Made ${compiledFilePath} in ${pathToRoot}`);
  } catch (error) {
    err(error);
  }
}

async function fillFile(compiledFilePath, data) {
  try {
    const content = Buffer.concat(data);
    await writeFile(compiledFilePath, content);
   log(`Filled ${compiledFilePath}`);
  } catch (error) {
    err(error);
  }
}

async function compileFiles(file, data, dirPath) {
  try {
    if (
      file.isFile() &&
      pathFs.extname(file.name).toLowerCase() === '.css' &&
      file.name !== 'style.css'
    ) {
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

async function replacePlaceholders(templatePath, indexPath, componentsPath) {
  try {
    let templateContent = await readFile(templatePath, 'utf8');
    const files = await readFromDir([], componentsPath);
    for await (const file of files) {
      const filePath = pathFs.join(componentsPath, file.name);
      const componentContent = await readFile(filePath, 'utf8');
      const placeholder = pathFs.parse(filePath).name;
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      templateContent = templateContent.replace(regex, componentContent);
    }indexPath
    await writeFile(indexPath, templateContent);
    log(`All files copied to dir ${pathTo}`);
  } catch (error) {}
}
   async function removeRoot(pathToRoot) {
     if ( await access(pathToRoot)) {
      await rmdir(pathToRoot);    
     }
   }
(async () => {
  try {
    pathToRoot = pathFs.join(__dirname, 'project-dist');
    await removeRoot(pathToRoot);
    await newDir(pathToRoot);
    await copy(['assets'], __dirname, pathToRoot);
    const pathToCompileDir = pathFs.join(__dirname, 'styles');
    await compile(pathToCompileDir);
    const componentsPath = pathFs.join(__dirname, 'components');
    const templatePath = pathFs.join(__dirname, 'template.html');
    const indexPath = pathFs.join(pathToRoot, 'index.html');
    await replacePlaceholders(templatePath, indexPath, componentsPath);
  } catch (error) {
    err(error);
  }
})();

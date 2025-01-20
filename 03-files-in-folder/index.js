import { readdir } from 'node:fs/promises';
import { path } from "path";

const dirName = 'secret-folder';
const dirPath = path.join(__dirname, dirName);

try {
  const files = await readdir(dirPath, { withFileTypes: true });
  files.array.forEach((element) => {
    console.log(element);
  });
} catch (error) {
  console.error(error);
}

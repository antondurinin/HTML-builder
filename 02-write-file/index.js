const fs = require('fs');
const path = require('path');
const readline = require('readline');
const input = process.stdin;
const output = process.stdout;

const pathToDir = path.join(__dirname, 'text.txt');
const writableStream = fs.createWriteStream(pathToDir, { flags: 'a' });
const rl = readline.createInterface({ input, output });

console.log(`Greetings traveler!`);

writableStream.on('error', (error) => {
  console.error('Error writing to file:', error);
});

rl.on('line', (data) => {
  if (data.toString().trim() === 'exit') {
    rl.close();
  }
  writableStream.write(`${data}\n`, (error) => {
    if (error) {
      console.error('Error writing to file:', error);
    }
  });
});

rl.on('close', () => {
  process.exit();
});
process.on('SIGINT', () => {
  rl.close();
});
process.on('SIGTERM', () => {
  rl.close();
});
process.on('exit', () => {
  console.log(`Farewell traveler!`);
});

const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

const pathToFile = path.join(__dirname, 'text.txt');
const stream = fs.createReadStream(pathToFile, 'utf-8');

pipeline(stream, process.stdout, (error) => { 
    if (error) {
        console.error('Print failed.', error.message)
    } 
})
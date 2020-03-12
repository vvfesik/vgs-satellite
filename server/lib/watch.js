var chokidar = require('chokidar');
var path = require('path');
var fs = require('fs');
var db = require('./db');

const dirPath = process.env.MITM_DIR || path.join(__dirname, '../../mitm-requests');

function getFilename(filePath) {
  return filePath.split(dirPath)[1];
}

function watch() {
  const watcher = chokidar.watch(dirPath);
  watcher
    .on('add', filePath => {
      const entry = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }));
      entry.log.id = getFilename(filePath);
      db.get('logs')
        .push(entry)
        .write();
    })
    .on('unlink', filePath => {
      db.get('logs')
        .remove(entry => entry.log.id === getFilename(filePath))
        .write();
    });
}

module.exports = watch;

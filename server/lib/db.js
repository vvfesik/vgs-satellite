var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ logs: [] }).write();
db.get('logs')
  .remove()
  .write();

module.exports = db;

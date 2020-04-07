const sql = require('sqlite');
const path = require('path');

sql.open(path.join(__dirname, './db.sqlite'));

exports.sql = sql;
exports.reputation = require('./lib/reputation.js');
exports.repreward = require('./lib/repreward.js');
exports.backup = require('./lib/backup.js');
exports.feed = require('./lib/feed.js');

const sql = require('../db.js').sql;



exports.BackupUser = async (UserId, ServerId, Id, Reputation) => {
  return sql.run(`INSERT INTO repbackup (UserId, ServerId, Id, Reputation) VALUES ("${UserId}", "${ServerId}", "${Id}", ${Reputation})`)
}


exports.GetById = async (ServerId, Id) => {
  return sql.all(`SELECT * FROM repbackup WHERE ServerId = "${ServerId}" AND Id = "${Id}"`)
}
const sql = require('../db.js').sql;
let reputation = require('./reputation.js');


exports.CheckRewards = async (UserId, ServerId) => {
  var waitForData = new Promise(function(resolve, reject) {
    reputation.HandleUser(UserId, ServerId).then(userData => {
      exports.AllRewards(ServerId).then(allRewards => {
        if (!allRewards) return resolve(false);
        let all = [];
        for (n in allRewards) {
          var thisReward = allRewards[n];
          if ((thisReward.Required <= 0 && userData.Reputation <= thisReward.Required) || (thisReward.Required >= 0 && userData.Reputation >= thisReward.Required)) {
            all.push(thisReward.RoleId);
          }
        }
        resolve(all);
      });
    });
  });
  return waitForData;
}





exports.GetRewardByRoleId = async (ServerId, RoleId) => {
  var waitForData = new Promise(function(resolve, reject) {
    sql.get(`SELECT * FROM reputationrewards WHERE ServerId = "${ServerId}" AND RoleId = "${RoleId}"`).then(data => {
      resolve(data);
    }).catch(reject);
  })
  return waitForData;
}



exports.AddReward = async (ServerId, Required, RoleId) => {

  var waitForData = new Promise(function(resolve, reject) {
    exports.GetRewardByRoleId(ServerId, RoleId).then(gD => {
      if (!gD) {
        sql.run(`INSERT INTO reputationrewards (ServerId, Required, RoleId) VALUES ("${ServerId}", ${Required}, "${RoleId}")`).then(() => {
          resolve(true);
        }).catch(reject);

      } else {
        sql.run(`UPDATE reputationawards SET Required = ${Required} WHERE ServerId = "${ServerId}" AND RoleId = "${RoleId}"`).then(() => {
          resolve(true);
        }).catch(reject);
      }
    })
  })
  return waitForData;
}

exports.DeleteReward = async (ServerId, RoleId) => {

  var waitForData = new Promise(function(resolve, reject) {
    exports.GetRewardByRoleId(ServerId, RoleId).then(gD => {
      if (!gD) return resolve(false);
      sql.run(`DELETE FROM reputationrewards WHERE ServerId = "${ServerId}" AND RoleId = "${RoleId}"`).then(() => {
        resolve(true);
      }).catch(reject);
    })
  })
  return waitForData
}




exports.AllRewards = async (ServerId) => {
  var waitForData = new Promise(function(resolve, reject) {
    sql.all(`SELECT * FROM reputationrewards WHERE ServerId = "${ServerId}"`).then(rows => {
      resolve(rows);
    }).catch(reject);
  })
  return waitForData;
}

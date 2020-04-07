const sql = require('../db.js').sql;



exports.SetFeedChannel = async (ServerId, ChannelId) => {
  var waitForData = new Promise(function(resolve, reject) {
    sql.run(`DELETE FROM feedchannel WHERE ServerId = "${ServerId}"`).then(() => {
      sql.run(`INSERT INTO feedchannel (ServerId, ChannelId) VALUES ("${ServerId}", "${ChannelId}")`).then(() => {
        resolve(true);
      }).catch(reject);
    }).catch(reject);
  });
  return waitForData;
}


exports.DeleteFeedChannel = async (ServerId) => {
  return sql.run(`DELETE FROM feedchannel WHERE ServerId = "${ServerId}"`);
}


exports.GetFeedChannel = async (ServerId) => {
  return sql.get(`SELECT * FROM feedchannel WHERE ServerId = "${ServerId}"`);
}
exports.AddFeed = async (ServerId, Feedname) => {
  var waitForData = new Promise(function(resolve, reject) {
    exports.GetFeed(ServerId, Feedname).then(getFeed => {
      if (!getFeed) {
        sql.run(`INSERT INTO feeds (ServerId, Feed) VALUES ("${ServerId}", "${Feedname}")`).then(() => {
          resolve(true);
        })
      } else return resolve(false);
    })
  })
}


exports.DeleteFeed = async (ServerId, Feedname) => {
  return sql.run(`DELETE FROM feeds WHERE ServerId = "${ServerId}" AND Feed = "${Feedname}"`);
}



exports.GetFeeds = async (ServerId) => {
  return sql.all(`SELECT * FROM feeds WHERE ServerId = "${ServerId}"`)
}


exports.GetFeed = async (ServerId, Feedname) => {
  return sql.get(`SELECT * FROM feeds WHERE ServerId = "${ServerId}" AND Feed = "${Feedname}"`);
}
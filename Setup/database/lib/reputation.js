const sql = require('../db.js').sql;


exports.CreateUser = async (UserId, ServerId) => {
  // Creates a promise,
  var waitForData = new Promise(function(resolve, reject) {

    exports.GetUser(UserId, ServerId).then(userData => {
      if (!userData) {
        // If there wasn't any data for that user in that server, then create it!
        sql.run(`INSERT INTO reputation (UserId, ServerId, Reputation) VALUES ("${UserId}", "${ServerId}", 0)`).then(() => {
          // Successfully inserted to the database, then resolve the promise
          resolve(true);
        }).catch(reject); // If it failed, then reject the promise
      } else {
        // Data already exists, tell that we didn't create data
        return resolve(false);
      }
    });
  });

  // Return the promise
  return waitForData
}



exports.GetUser = async (UserId, ServerId) => {
  var waitForData = new Promise(function(resolve, reject) {
    sql.get(`SELECT * FROM reputation WHERE ServerId = "${ServerId}" AND UserId = "${UserId}"`).then(row => {
      resolve(row);
    })
  })
  return waitForData
}



// This function will return the saved user, or create new and then return it
exports.HandleUser = async (UserId, ServerId) => {
  var waitForData = new Promise(function(resolve, reject) {

    exports.GetUser(UserId, ServerId).then(userData => {
      if (!userData) {
        // Data doesn't exist, create new and then return it
        exports.CreateUser(UserId, ServerId).then(() => {
          exports.GetUser(UserId, ServerId).then(newData => {
            console.log(newData);
            resolve(newData);
          })
        })
      } else {
        resolve(userData);
      }
    })
  })

  return waitForData;
}

exports.GetAll = async (ServerId) => {
  return sql.all(`SELECT * FROM reputation WHERE ServerId = "${ServerId}"`)
}

exports.SetUser = async (UserId, ServerId, NewRep) => {
  var waitForData = new Promise(function(resolve, reject) {
    exports.HandleUser(UserId, ServerId).then(userData => {
      var cRep = userData.Reputation || 0;
      cRep = NewRep;
      sql.run(`UPDATE reputation SET Reputation = ${cRep} WHERE UserId = "${UserId}" AND ServerId = "${ServerId}"`).then(() => {
        resolve(true);
      }).catch(reject);
    }).catch(reject);
  })
  return waitForData;
}



exports.AddRep = async (UserId, ServerId, Amount) => {
  var waitForData = new Promise(function(resolve, reject) {
    sql.run(`UPDATE reputation SET Reputation = Reputation + ${Amount} WHERE UserId = "${UserId}" AND ServerId = "${ServerId}"`).then(row => {
      resolve(row);
    })
  })
  return waitForData;
}




exports.MinRep = async (UserId, ServerId, Amount) => {
  var waitForData = new Promise(function(resolve, reject) {
    sql.run(`UPDATE reputation SET Reputation = Reputation - ${Amount} WHERE UserId = "${UserId}" AND ServerId = "${ServerId}"`).then(row => {
      resolve(row);
    })
  })
  return waitForData
}

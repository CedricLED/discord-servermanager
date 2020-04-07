var Twitter = require('twit');
const db = require('../database/db.js');
const config = require('../../config.js');

var client = new Twitter(config.Twitter);


var streams = {};
let queuedMessages = {};
var botClient = null;

exports.SetClient = (c) => {
  botClient = c;
};


exports.StartStream = async () => {
  if (!botClient) {
    return console.log("Bot client not set yet!");
  }

  botClient.guilds.forEach(guild => {
    if (streams && streams[guild.id]) streams[guild.id].stop();
    let wholeList = [];
    console.log(guild.name);
    db.feed.GetFeeds(guild.id).then(bb => {
      if (bb.length > 0) {
        bb.forEach(lol => wholeList.push(lol.Feed));
        console.log(bb);
        streams[guild.id] = client.stream('statuses/filter', {
          track: wholeList
        });
        console.log("Server stream");
        console.log(streams[guild.id]);


        streams[guild.id].on('tweet', function(tweet) {
          console.log("New Tweet");
          //console.log(tweet);
          //streams[guild.id].stop();

          NewTweet(tweet, guild);
        });
      }

    });

  });
};


exports.StopServerStream = async (ServerId) => {
  if (streams[ServerId]) streams[ServerId].stop();
  return true
}


exports.StartServerStream = async (guild) => {


  if (streams && streams[guild.id]) streams[guild.id].stop();
  let wholeList = [];
  console.log(guild.name)
  db.feed.GetFeeds(guild.id).then(bb => {
    if (bb.length > 0) {
      bb.forEach(lol => wholeList.push(lol.Feed))
      console.log(bb);
      streams[guild.id] = client.stream('statuses/filter', {
        track: wholeList
      })
      console.log("Server stream")
      console.log(streams[guild.id]);


      streams[guild.id].on('tweet', function(tweet) {
        console.log("New Tweet");
        //console.log(tweet);
        //streams[guild.id].stop();

        NewTweet(tweet, guild);
      })
    }

  })

}



function NewTweet(tweet, guild) {
  if (!queuedMessages[guild.id]) queuedMessages[guild.id] = 0

  db.feed.GetFeedChannel(guild.id).then(channelId => {
    if (!channelId) {
      console.log(`No feed channel found for server ${guild.name}`)
    } else {
      let getCh = guild.channels.get(channelId.ChannelId);
      if (getCh) {
        if (queuedMessages[guild.id] >= 7) {
          return console.log("FALLING BEHIND");
        } else queuedMessages[guild.id]++;
        let newMsg = `https://twitter.com/lol/status/${tweet.id_str}`
        getCh.send(newMsg).then(() => {
          console.log("MESSAGE SENT");
          queuedMessages[guild.id]--;
        }).catch(e => {
          queuedMessages[guild.id]--;
          console.error(e);
        })
      }
    }

  })
}

const Discord = require('discord.js');
let twitterInt = require('../twitter/twitter.js');


exports.run = async (client, message, args) => {
  let reply =; m => {
    return message.reply(m).then(msg => msg.delete(7000)).catch(console.error);
  };
  if (!message.member.hasPermission("ADMINISTRATOR")) return reply(`You need administrator privelegies/permissions to use this command!`);
  if (!args[0]) return reply(`Please tell me what you'd like to do!`);
  let actionWanted = args[0].toLowerCase();

  let channelMention = message.mentions.channels.first();

  if (actionWanted == "on" || actionWanted == "off") {
    if (!channelMention || !args[2]) return reply(`Please mention a channel, and give me the feedname!`);
    let feedName = args.slice(2).join(" ").toLowerCase();
    if (actionWanted == "on") {
      client.database.feed.SetFeedChannel(message.guild.id, channelMention.id).then(() => {
        client.database.feed.AddFeed(message.guild.id, feedName).then(succ => {
          twitterInt.StartServerStream(message.guild);
          return reply(`Successfully added ${feedName} to the feed list!`);
        });
      });
    } else {
      client.database.feed.DeleteFeedChannel(message.guild.id).then(() => {
        client.database.feed.DeleteFeed(message.guild.id, feedName).then(() => {
          twitterInt.StartServerStream(message.guild);
          return reply(`Successfully removed ${feedName} from the feed list, and removed ${channelMention.name} as the feed channel :ok_hand:`);

        });
      });
    }

  } else if (actionWanted == "add") {
    if (!args[1]) return reply(`Please give me the feedname!`);
    client.database.feed.GetFeedChannel(message.guild.id).then(feedId => {
      if (!feedId) return reply(`Please set the feed channel first, by using \`${client.config.Prefix}feed on <#channel> <feedname>\``);

      let feedName = args.slice(1).join(" ").toLowerCase();
      client.database.feed.AddFeed(message.guild.id, feedName).then(() => {
        twitterInt.StartServerStream(message.guild);
        return reply(`Added ${feedName} to the feed list :ok_hand:`);

      });
    });
  } else if (actionWanted == "del") {
    if (!args[1]) return reply(`Please give me the name of the feed you'd like to remove!`);

    let feedName = args.slice(1).join(" ").toLowerCase();
    client.database.feed.GetFeed(message.guild.id, feedName).then(feed => {
      if (!feed) return reply(`No feed with that name!`);
      console.log(feed);
      client.database.feed.DeleteFeed(message.guild.id, feedName).then(() => {
        reply(`Removed ${feedName} from the feedlist!`);
        twitterInt.StartServerStream(message.guild);
      });
    });

  } else if (actionWanted == "list") {
    client.database.feed.GetFeeds(message.guild.id).then(allFeeds => {
      let wholeStr = "";
      allFeeds.forEach(val => {
        wholeStr += `-${val.Feed}\n`;
      });
      client.database.feed.GetFeedChannel(message.guild.id).then(fC => {
        let getChannel = (fC != null ? message.guild.channels.get(fC.ChannelId) : "None");



        message.channel.send(`**Feed list:**\n\n${wholeStr}\nFeed channel: ${getChannel}`);
      });

    });
  } else if (actionWanted == "stop") {
    twitterInt.StopServerStream(message.guild.id).then(() => {
      message.channel.send(`Stopped the server stream :ok_hand:`);
    });
  } else if (actionWanted == "start") {
    twitterInt.StartStream().then(() => {
      message.channel.send(`Starting the stream, please wait...`);
    });
  } else if (actionWanted == "restart") {
    twitterInt.StopServerStream(message.guild.id).then(() => {
      twitterInt.StartServerStream(message.guild).then(() => {
        message.channel.send(`Restarting ..`);
      });
    });
  } else {
    return reply(`Please do either \`stop\`, \`start\`, \`list\`, \`del\`, \`on/off\`, \`add\` `);
  }
};

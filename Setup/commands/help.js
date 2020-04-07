exports.run = (Bot, message, args) => {
  //Just sends an embed to the Channel and deletes it afterwards

  message.channel.send("", {
    embed: {
      "title": `${Bot.user.username}'s Help!`,
      "description": "`help` - Displays this help\n" +
        "`afk <reason>` -  Displays the reason whenever you get mentioned\n" +
        "`log <on/off> <#channel>` - Sets the Log Channel>\n" +
        "`kick <@User> <reason>` - Kicks a User and Logs the Reason in LogChannel\n" +
        "`ban <@User> <reason>` - Bans a User and Logs the Reason in LogChannel\n" +
        "`mute <@User> <reason> <time in seconds>` - Mutes a User for a period of time\n" +
        "`chatlock <#channel> <reason> <time in seconds>` - Lockdowns a Channel for a period of time\n" +
        "`chatlockoff <#channel>` - Unlock a Locked Channel before time is over\n" +
        "`autorole <on/off> <role>` - Enables an Autorole or disables it"
    }
  }).then(msg => msg.delete(30000));
};

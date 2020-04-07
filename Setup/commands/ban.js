exports.run = (Bot, message, args) => {
  //Check if member has admin perms

  if (message.member.hasPermission("ADMINISTRATOR")) {
    //Check if reason is provided and there is a mention
    if (message.mentions.members.size < 1 || !args[1]) {
      message.reply("You forgot to mention someone or there is no reason!").then(msg => msg.delete(5000));
    } else {
      //Ban the Member
      message.guild.ban(message.guild.members.get(message.mentions.users.first(1)[0].id, {
        reason: args.slice(1).join(" ")
      })).catch(console.error);
      //Try to log in LogChannel
      Bot.sql.get(`SELECT * FROM logchannel`).then(row => {
        //If the Channel is found (not undefined) Message will be sent!
        if (typeof row !== 'undefined')
          return message.guild.channels.get(`${row.logChannel}`).send("", {
            embed: {
              'title': `User ${message.mentions.users.first(1)[0].username} banned`,
              "description": `**Reason:** ${args.slice(1).join(" ")}\n**Moderator:** ${message.author}`,
              "timestamp": new Date()
            }
          });
      });
    }

  }

};
